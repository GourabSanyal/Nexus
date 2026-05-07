use anyhow::{anyhow, Result};
use serde_json::{json, Value};

use crate::models::transaction::TransactionInfo;
use crate::services::rpc_client::make_rpc_request;

pub async fn get_balance(address: &str, rpc_url: &str) -> Result<String> {
    let body =
        json!({"id":1,"jsonrpc":"2.0","method":"eth_getBalance","params":[address,"latest"]});
    let data = make_rpc_request(rpc_url, body).await?;
    data.get("result")
        .and_then(|v| v.as_str())
        .map(|v| v.to_string())
        .ok_or_else(|| anyhow!("Failed to parse balance"))
}

pub async fn get_transactions(
    address: &str,
    rpc_url: &str,
    limit: Option<usize>,
) -> Result<(Vec<TransactionInfo>, bool, Option<String>)> {
    let max = limit.unwrap_or(20).min(100);
    let txs = fetch_and_merge_transfers(rpc_url, address, max).await?;
    let out: Vec<TransactionInfo> = txs
        .iter()
        .take(max)
        .map(|t| map_transaction(t, address))
        .collect();
    let next_cursor = out.last().map(|t| t.signature.clone());
    Ok((out, txs.len() > max, next_cursor))
}

pub async fn prepare_send(address: &str, to: &str, value: &str, rpc_url: &str) -> Result<Value> {
    let chain_id = rpc(rpc_url, "eth_chainId", json!([])).await?;
    let nonce = rpc(
        rpc_url,
        "eth_getTransactionCount",
        json!([address, "pending"]),
    )
    .await?;
    let gas_price = rpc(rpc_url, "eth_gasPrice", json!([])).await?;
    let gas_limit = rpc(
        rpc_url,
        "eth_estimateGas",
        json!([{"from": address, "to": to, "value": value}]),
    )
    .await?;
    Ok(json!({"chainId":chain_id,"nonce":nonce,"gasPrice":gas_price,"gasLimit":gas_limit}))
}

pub async fn send_raw_transaction(rpc_url: &str, signed_transaction: &str) -> Result<String> {
    let result = rpc(
        rpc_url,
        "eth_sendRawTransaction",
        json!([signed_transaction]),
    )
    .await?;
    result
        .as_str()
        .map(|s| s.to_string())
        .ok_or_else(|| anyhow!("Failed to parse tx hash"))
}

async fn fetch_transfers(rpc_url: &str, params: Value) -> Result<Vec<Value>> {
    let data = rpc(rpc_url, "alchemy_getAssetTransfers", json!([params])).await?;
    Ok(data
        .get("transfers")
        .and_then(|v| v.as_array())
        .cloned()
        .unwrap_or_default())
}

async fn fetch_and_merge_transfers(rpc_url: &str, address: &str, max: usize) -> Result<Vec<Value>> {
    let max_hex = format!("0x{:x}", max);
    let sent = fetch_transfers(
        rpc_url,
        json!({"fromBlock":"0x0","fromAddress":address,"category":["external","erc20","erc721","erc1155"],"withMetadata":true,"maxCount":max_hex}),
    )
    .await?;
    let recv = fetch_transfers(
        rpc_url,
        json!({"fromBlock":"0x0","toAddress":address,"category":["external","erc20","erc721","erc1155"],"withMetadata":true,"maxCount":max_hex}),
    )
    .await?;

    let mut map = std::collections::BTreeMap::new();
    for t in sent.into_iter().chain(recv.into_iter()) {
        if let Some(h) = t.get("hash").and_then(|x| x.as_str()) {
            map.insert(h.to_lowercase(), t);
        }
    }

    let mut txs: Vec<Value> = map.into_values().collect();
    txs.sort_by_key(|t| std::cmp::Reverse(block_num(t)));
    Ok(txs)
}

fn map_transaction(t: &Value, address: &str) -> TransactionInfo {
    let from = t
        .get("from")
        .and_then(|v| v.as_str())
        .map(|s| s.to_string());
    let to = t.get("to").and_then(|v| v.as_str()).map(|s| s.to_string());
    TransactionInfo {
        signature: t
            .get("hash")
            .and_then(|v| v.as_str())
            .unwrap_or_default()
            .to_string(),
        slot: block_num(t),
        block_time: block_time(t),
        status: "success".to_string(),
        err: None,
        confirmation_status: None,
        amount: amount_eth(t),
        fee: None,
        direction: transfer_direction(&from, &to, address),
        from_address: from,
        to_address: to,
        memo: None,
    }
}

fn transfer_direction(from: &Option<String>, to: &Option<String>, address: &str) -> Option<String> {
    let addr = address.to_lowercase();
    match (
        from.as_ref().map(|x| x.to_lowercase()),
        to.as_ref().map(|x| x.to_lowercase()),
    ) {
        (Some(f), Some(t)) if f == addr && t == addr => Some("self".to_string()),
        (Some(f), _) if f == addr => Some("sent".to_string()),
        (_, Some(t)) if t == addr => Some("received".to_string()),
        _ => Some("received".to_string()),
    }
}

fn block_num(t: &Value) -> u64 {
    u64::from_str_radix(
        t.get("blockNum")
            .and_then(|v| v.as_str())
            .unwrap_or("0x0")
            .trim_start_matches("0x"),
        16,
    )
    .unwrap_or(0)
}

fn block_time(t: &Value) -> Option<i64> {
    let timestamp = t
        .get("metadata")
        .and_then(|m| m.get("blockTimestamp"))
        .and_then(|v| v.as_str())?;
    js_sys::Date::new(&wasm_bindgen::JsValue::from_str(timestamp))
        .get_time()
        .is_finite()
        .then(|| {
            (js_sys::Date::new(&wasm_bindgen::JsValue::from_str(timestamp)).get_time() / 1000.0)
                as i64
        })
}

fn amount_eth(t: &Value) -> Option<f64> {
    if let Some(value) = t.get("value") {
        if let Some(n) = value.as_f64() {
            return Some(n);
        }
        if let Some(s) = value.as_str() {
            if let Ok(n) = s.parse::<f64>() {
                return Some(n);
            }
        }
    }

    let hex_wei = t
        .get("rawContract")
        .and_then(|r| r.get("value"))
        .and_then(|v| v.as_str())?;
    let wei = u128::from_str_radix(hex_wei.trim_start_matches("0x"), 16).ok()?;
    Some((wei as f64) / 1_000_000_000_000_000_000_f64)
}

async fn rpc(rpc_url: &str, method: &str, params: Value) -> Result<Value> {
    let body = json!({"id":1,"jsonrpc":"2.0","method":method,"params":params});
    let data = make_rpc_request(rpc_url, body).await?;
    if let Some(err) = data.get("error") {
        return Err(anyhow!("RPC Error: {err}"));
    }
    data.get("result")
        .cloned()
        .ok_or_else(|| anyhow!("Missing result for {method}"))
}
