//! Per-signature enrichment (`getTransaction`): adds amount, fee, direction relative to wallet.

use anyhow::Result;
use serde_json::{json, Value};

use crate::models::transaction::TransactionInfo;
use crate::services::rpc_client::make_rpc_request;

use super::parser::{parse_transaction_from_signature, signature_from_signature_item};

const UNKNOWN: &str = "unknown";

pub(super) async fn build_transactions(
    signatures: &[Value],
    cluster_url: &str,
    wallet_address: &str,
) -> Vec<TransactionInfo> {
    let mut transactions = Vec::with_capacity(signatures.len());
    for sig_info in signatures.iter() {
        let mut tx_info = parse_transaction_from_signature(sig_info);
        maybe_enrich_transaction(&mut tx_info, sig_info, cluster_url, wallet_address).await;
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

async fn get_transaction_details(
    signature: &str,
    cluster_url: &str,
    wallet_address: &str,
) -> Result<TransactionInfo> {
    let response_data = make_rpc_request(cluster_url, get_transaction_body(signature)).await?;
    let result = response_data
        .get("result")
        .ok_or_else(|| anyhow::anyhow!("No transaction result"))?;
    let meta = result
        .get("meta")
        .ok_or_else(|| anyhow::anyhow!("No transaction meta"))?;

    let fee = meta.get("fee").and_then(|f| f.as_u64()).unwrap_or(0);
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

fn get_transaction_body(signature: &str) -> Value {
    json!({
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
    })
}

fn derive_wallet_amount_and_direction(
    result: &Value,
    meta: &Value,
    wallet_address: &str,
) -> (i64, String) {
    let amount = match wallet_balance_delta(result, meta, wallet_address) {
        Some(delta) => delta,
        None => return (0, UNKNOWN.to_string()),
    };
    let direction = if amount < 0 { "sent" } else { "received" };
    (amount, direction.to_string())
}

fn wallet_balance_delta(result: &Value, meta: &Value, wallet_address: &str) -> Option<i64> {
    let account_keys = result
        .get("transaction")
        .and_then(|t| t.get("message"))
        .and_then(|m| m.get("accountKeys"))
        .and_then(|a| a.as_array())?;
    let wallet_idx = find_wallet_index(account_keys, wallet_address)?;
    let pre_bal = balance_at(meta.get("preBalances"), wallet_idx)?;
    let post_bal = balance_at(meta.get("postBalances"), wallet_idx)?;
    Some(post_bal - pre_bal)
}

fn find_wallet_index(account_keys: &[Value], wallet_address: &str) -> Option<usize> {
    account_keys.iter().position(|key| {
        key.as_str() == Some(wallet_address)
            || key.get("pubkey").and_then(|p| p.as_str()) == Some(wallet_address)
    })
}

fn balance_at(balances: Option<&Value>, index: usize) -> Option<i64> {
    balances
        .and_then(|b| b.as_array())
        .and_then(|arr| arr.get(index))
        .and_then(|v| v.as_i64())
}
