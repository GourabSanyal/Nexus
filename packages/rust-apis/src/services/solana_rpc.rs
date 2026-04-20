use anyhow::Result;
use serde_json::{json, Value};
use crate::models::TransactionInfo;
use wasm_bindgen_futures::JsFuture;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use web_sys::{Request, RequestInit, Response};

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
        .ok_or_else(|| anyhow::anyhow!("Failed to parse balance from response. Received: {}", response_data))?;

    Ok(balance)
}

/// Fetch Solana transactions via JSON-RPC
pub async fn get_transactions(
    address: &str,
    cluster_url: &str,
    limit: Option<usize>,
) -> Result<(Vec<TransactionInfo>, bool, Option<String>)> {
    if address.is_empty() {
        return Err(anyhow::anyhow!("Address cannot be empty"));
    }
    if cluster_url.is_empty() {
        return Err(anyhow::anyhow!("Cluster URL cannot be empty"));
    }

    let effective_limit = limit.unwrap_or(20).min(100);

    let request_body = json!({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getSignaturesForAddress",
        "params": [
            address,
            {
                "limit": effective_limit + 1
            }
        ]
    });

    let response_data = make_rpc_request(cluster_url, request_body).await?;

    let signatures = response_data
        .get("result")
        .and_then(|r| r.as_array())
        .ok_or_else(|| anyhow::anyhow!("Failed to parse signatures from response"))?;

    let has_more = signatures.len() > effective_limit;
    let signatures_to_process = if has_more {
        &signatures[..effective_limit]
    } else {
        &signatures[..]
    };

    let next_cursor = if has_more && !signatures.is_empty() {
        signatures_to_process
            .last()
            .and_then(|s| s.get("signature"))
            .and_then(|s| s.as_str())
            .map(|s| s.to_string())
    } else {
        None
    };

    let mut transactions = Vec::new();

    for (i, sig_info) in signatures_to_process.iter().enumerate() {
        let mut tx_info = parse_transaction_from_signature(sig_info);
        
        // Enrich the most recent transactions with full details
        if i < 10 {
            if let Some(signature) = sig_info.get("signature").and_then(|s| s.as_str()) {
                if let Ok(details) = get_transaction_details(signature, cluster_url, address).await {
                    tx_info.amount = details.amount;
                    tx_info.fee = details.fee;
                    tx_info.direction = details.direction;
                    tx_info.from_address = details.from_address;
                    tx_info.to_address = details.to_address;
                }
            }
        }
        
        transactions.push(tx_info);
    }

    Ok((transactions, has_more, next_cursor))
}

/// Make a JSON-RPC request to Solana
async fn make_rpc_request(cluster_url: &str, request_body: Value) -> Result<Value> {
    let opts = RequestInit::new();
    opts.set_method("POST");
    opts.set_mode(web_sys::RequestMode::Cors);

    let body_str = serde_json::to_string(&request_body)?;
    opts.set_body(&JsValue::from_str(&body_str));

    let request = Request::new_with_str_and_init(cluster_url, &opts)
        .map_err(|_| anyhow::anyhow!("Failed to create request"))?;
    
    request.headers().set("Content-Type", "application/json")
        .map_err(|_| anyhow::anyhow!("Failed to set request headers"))?;

    let global = js_sys::global();
    let fetch_value = js_sys::Reflect::get(&global, &"fetch".into())
        .map_err(|_| anyhow::anyhow!("Global fetch not found"))?;
    
    let fetch_func: js_sys::Function = fetch_value.dyn_into()
        .map_err(|_| anyhow::anyhow!("'fetch' is not a function"))?;

    let resp_promise: js_sys::Promise = fetch_func.call1(&global, &request)
        .map_err(|_| anyhow::anyhow!("Failed to call fetch"))?
        .dyn_into()
        .map_err(|_| anyhow::anyhow!("fetch did not return a promise"))?;

    let resp_value = JsFuture::from(resp_promise)
        .await
        .map_err(|_| anyhow::anyhow!("Fetch failed"))?;
    
    let resp: Response = resp_value.dyn_into()
        .map_err(|_| anyhow::anyhow!("Failed to convert response"))?;

    let text_promise = resp.text()
        .map_err(|_| anyhow::anyhow!("Failed to get response text"))?;
    
    let text_value = JsFuture::from(text_promise)
        .await
        .map_err(|_| anyhow::anyhow!("Failed to read response body"))?;
    
    let text_str = text_value.as_string()
        .ok_or_else(|| anyhow::anyhow!("Response is not a string"))?;

    let response_data: Value = serde_json::from_str(&text_str)?;

    if let Some(error) = response_data.get("error") {
        return Err(anyhow::anyhow!("RPC Error: {}", error));
    }

    Ok(response_data)
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
    let result = response_data.get("result").ok_or_else(|| anyhow::anyhow!("No transaction result"))?;

    let meta = result.get("meta").ok_or_else(|| anyhow::anyhow!("No transaction meta"))?;
    let fee = meta.get("fee").and_then(|f| f.as_u64()).unwrap_or(0);
    
    // Parse time and slot
    let slot = result.get("slot").and_then(|s| s.as_u64()).unwrap_or(0);
    let block_time = result.get("blockTime").and_then(|t| t.as_i64());

    // Calculate amount change for the specific wallet
    let mut amount = 0i64;
    let mut direction = "unknown".to_string();
    let mut from_address = None;
    let mut to_address = None;

    if let Some(transaction) = result.get("transaction") {
        if let Some(message) = transaction.get("message") {
            if let Some(account_keys) = message.get("accountKeys").and_then(|a| a.as_array()) {
                // Find our address in account keys
                let wallet_idx = account_keys.iter().position(|k| {
                    if let Some(addr) = k.as_str() {
                        addr == wallet_address
                    } else if let Some(addr) = k.get("pubkey").and_then(|p| p.as_str()) {
                        addr == wallet_address
                    } else {
                        false
                    }
                });

                if let Some(idx) = wallet_idx {
                    let pre_balances = meta.get("preBalances").and_then(|p| p.as_array());
                    let post_balances = meta.get("postBalances").and_then(|p| p.as_array());

                    if let (Some(pre), Some(post)) = (pre_balances, post_balances) {
                        if let (Some(pre_bal), Some(post_bal)) = (pre.get(idx).and_then(|b| b.as_i64()), post.get(idx).and_then(|b| b.as_i64())) {
                            amount = post_bal - pre_bal;
                            direction = if amount < 0 { "sent".to_string() } else { "received".to_string() };
                        }
                    }
                }
            }
        }
    }

    Ok(TransactionInfo {
        signature: signature.to_string(),
        slot,
        block_time,
        status: "success".to_string(),
        err: None,
        confirmation_status: Some("finalized".to_string()),
        amount: Some(amount),
        fee: Some(fee),
        direction: Some(direction),
        from_address,
        to_address,
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

    let slot = sig_info
        .get("slot")
        .and_then(|s| s.as_u64())
        .unwrap_or(0);

    let block_time = sig_info
        .get("blockTime")
        .and_then(|b| b.as_i64());

    let status = if sig_info.get("err")
        .map(|e| !e.is_null())
        .unwrap_or(false) {
        "failed"
    } else {
        "success"
    };

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
    
    response_data
        .get("result")
        .and_then(|r| r.as_str())
        .map(|s| s.to_string())
        .ok_or_else(|| anyhow::anyhow!("Failed to parse transaction signature"))
}

