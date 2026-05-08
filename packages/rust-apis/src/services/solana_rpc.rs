use crate::models::transaction::TransactionInfo;
use crate::services::rpc_client::make_rpc_request;
use anyhow::Result;
use serde_json::{json, Value};
use web_sys::console;

/// Fetch Solana balance via JSON-RPC
pub async fn get_balance(address: &str, cluster_url: &str) -> Result<u64> {
    let request_body = json!({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getBalance",
        "params": [address]
    });

    let response_data = make_rpc_request(cluster_url, request_body).await?;

    let balance = response_data
        .get("result")
        .and_then(|r| {
            if r.is_number() {
                r.as_u64()
            } else {
                r.get("value").and_then(|v| v.as_u64())
            }
        })
        .ok_or_else(|| {
            anyhow::anyhow!(
                "Failed to parse balance from response. Received: {}",
                response_data
            )
        })?;

    Ok(balance)
}

/// Fetch Solana transactions via JSON-RPC
pub async fn get_transactions(
    address: &str,
    cluster_url: &str,
    limit: Option<usize>,
) -> Result<(Vec<TransactionInfo>, bool, Option<String>)> {
    validate_transactions_input(address, cluster_url)?;

    let effective_limit = limit.unwrap_or(20).min(100);
    let request_body = signatures_request_body(address, effective_limit + 1);
    let response_data = make_rpc_request(cluster_url, request_body).await?;

    let signatures = extract_signatures(&response_data)?;
    let (signatures_to_process, has_more) = signatures_window(signatures, effective_limit);
    let next_cursor = if has_more {
        signatures_to_process
            .last()
            .and_then(signature_from_signature_item)
    } else {
        None
    };
    let transactions = build_transactions(signatures_to_process, cluster_url, address).await;

    Ok((transactions, has_more, next_cursor))
}

/// Helper to fetch full transaction details to get amounts and fees
async fn get_transaction_details(
    signature: &str,
    cluster_url: &str,
    wallet_address: &str,
) -> Result<TransactionInfo> {
    let request_body = json!({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getTransaction",
        "params": [
            signature,
            {
                "encoding": "json",
                "maxSupportedTransactionVersion": 0
            }
        ]
    });

    let response_data = make_rpc_request(cluster_url, request_body).await?;
    let result = response_data
        .get("result")
        .ok_or_else(|| anyhow::anyhow!("No transaction result"))?;

    let meta = result
        .get("meta")
        .ok_or_else(|| anyhow::anyhow!("No transaction meta"))?;
    let fee = meta.get("fee").and_then(|f| f.as_u64()).unwrap_or(0);

    // Parse time and slot
    let slot = result.get("slot").and_then(|s| s.as_u64()).unwrap_or(0);
    let block_time = result.get("blockTime").and_then(|t| t.as_i64());

    let (amount, direction) = derive_wallet_amount_and_direction(result, meta, wallet_address);

    Ok(TransactionInfo {
        signature: signature.to_string(),
        slot,
        block_time,
        status: "success".to_string(),
        err: None,
        confirmation_status: Some("finalized".to_string()),
        amount: Some(amount as f64),
        fee: Some(fee as f64),
        direction: Some(direction),
        from_address: None,
        to_address: None,
        memo: None,
    })
}

/// Parse transaction info from signature data
fn parse_transaction_from_signature(sig_info: &Value) -> TransactionInfo {
    let signature = sig_info
        .get("signature")
        .and_then(|s| s.as_str())
        .unwrap_or("unknown")
        .to_string();

    let slot = sig_info.get("slot").and_then(|s| s.as_u64()).unwrap_or(0);

    let block_time = sig_info.get("blockTime").and_then(|b| b.as_i64());

    let status = signature_status(sig_info);

    let confirmation_status = sig_info
        .get("confirmationStatus")
        .and_then(|c| c.as_str())
        .map(|s| s.to_string());

    TransactionInfo {
        signature,
        slot,
        block_time,
        status: status.to_string(),
        err: sig_info.get("err").cloned(),
        confirmation_status,
        amount: None,
        fee: None,
        direction: None,
        from_address: None,
        to_address: None,
        memo: sig_info
            .get("memo")
            .and_then(|m| m.as_str())
            .map(|s| s.to_string()),
    }
}

fn validate_transactions_input(address: &str, cluster_url: &str) -> Result<()> {
    if address.is_empty() {
        return Err(anyhow::anyhow!("Address cannot be empty"));
    }
    if cluster_url.is_empty() {
        return Err(anyhow::anyhow!("Cluster URL cannot be empty"));
    }
    Ok(())
}

fn signatures_request_body(address: &str, limit: usize) -> Value {
    json!({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getSignaturesForAddress",
        "params": [address, { "limit": limit }]
    })
}

fn extract_signatures(response_data: &Value) -> Result<&Vec<Value>> {
    response_data
        .get("result")
        .and_then(|r| r.as_array())
        .ok_or_else(|| anyhow::anyhow!("Failed to parse signatures from response"))
}

fn signatures_window(signatures: &[Value], limit: usize) -> (&[Value], bool) {
    let has_more = signatures.len() > limit;
    let end = signatures.len().min(limit);
    (&signatures[..end], has_more)
}

fn signature_from_signature_item(sig_info: &Value) -> Option<String> {
    sig_info
        .get("signature")
        .and_then(|s| s.as_str())
        .map(|s| s.to_string())
}

async fn build_transactions(
    signatures_to_process: &[Value],
    cluster_url: &str,
    wallet_address: &str,
) -> Vec<TransactionInfo> {
    let mut transactions = Vec::with_capacity(signatures_to_process.len());
    for (i, sig_info) in signatures_to_process.iter().enumerate() {
        let mut tx_info = parse_transaction_from_signature(sig_info);
        if i < 10 {
            maybe_enrich_transaction(&mut tx_info, sig_info, cluster_url, wallet_address).await;
        }
        transactions.push(tx_info);
    }
    transactions
}

async fn maybe_enrich_transaction(
    tx_info: &mut TransactionInfo,
    sig_info: &Value,
    cluster_url: &str,
    wallet_address: &str,
) {
    let Some(signature) = signature_from_signature_item(sig_info) else {
        return;
    };
    let Ok(details) = get_transaction_details(&signature, cluster_url, wallet_address).await else {
        return;
    };
    tx_info.amount = details.amount;
    tx_info.fee = details.fee;
    tx_info.direction = details.direction;
    tx_info.from_address = details.from_address;
    tx_info.to_address = details.to_address;
}

fn signature_status(sig_info: &Value) -> &'static str {
    if sig_info.get("err").map(|e| !e.is_null()).unwrap_or(false) {
        "failed"
    } else {
        "success"
    }
}

fn derive_wallet_amount_and_direction(
    result: &Value,
    meta: &Value,
    wallet_address: &str,
) -> (i64, String) {
    let Some(account_keys) = result
        .get("transaction")
        .and_then(|t| t.get("message"))
        .and_then(|m| m.get("accountKeys"))
        .and_then(|a| a.as_array())
    else {
        return (0, "unknown".to_string());
    };

    let Some(wallet_idx) = account_keys.iter().position(|k| {
        k.as_str() == Some(wallet_address)
            || k.get("pubkey").and_then(|p| p.as_str()) == Some(wallet_address)
    }) else {
        return (0, "unknown".to_string());
    };

    let pre = meta.get("preBalances").and_then(|p| p.as_array());
    let post = meta.get("postBalances").and_then(|p| p.as_array());
    let Some(pre_bal) = pre.and_then(|p| p.get(wallet_idx)).and_then(|b| b.as_i64()) else {
        return (0, "unknown".to_string());
    };
    let Some(post_bal) = post
        .and_then(|p| p.get(wallet_idx))
        .and_then(|b| b.as_i64())
    else {
        return (0, "unknown".to_string());
    };

    let amount = post_bal - pre_bal;
    let direction = if amount < 0 { "sent" } else { "received" }.to_string();
    (amount, direction)
}

/// Get latest blockhash from Solana
pub async fn get_latest_blockhash(cluster_url: &str) -> Result<Value> {
    let request_body = json!({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getLatestBlockhash",
        "params": [
            {
                "commitment": "finalized"
            }
        ]
    });

    let response_data = make_rpc_request(cluster_url, request_body).await?;

    response_data
        .get("result")
        .and_then(|r| r.get("value"))
        .cloned()
        .ok_or_else(|| anyhow::anyhow!("Failed to parse blockhash result"))
}

/// Send a signed transaction to Solana
pub async fn send_transaction(cluster_url: &str, signed_transaction: &str) -> Result<String> {
    console::log_1(
        &format!(
            "[rust-apis] solana_rpc.send_transaction url={} signed_tx_len={}",
            cluster_url,
            signed_transaction.len()
        )
        .into(),
    );

    let request_body = json!({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "sendTransaction",
        "params": [
            signed_transaction,
            {
                "encoding": "base64",
                "preflightCommitment": "confirmed"
            }
        ]
    });

    let response_data = make_rpc_request(cluster_url, request_body).await?;
    console::log_1(
        &format!(
            "[rust-apis] solana_rpc.send_transaction rpc_response={}",
            response_data
        )
        .into(),
    );

    response_data
        .get("result")
        .and_then(|r| r.as_str())
        .map(|s| s.to_string())
        .ok_or_else(|| anyhow::anyhow!("Failed to parse transaction signature"))
}
