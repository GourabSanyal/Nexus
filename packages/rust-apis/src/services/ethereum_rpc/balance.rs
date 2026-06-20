//! `eth_getBalance` — returns hex-encoded wei. Supports single and batch requests.

use anyhow::Result;
use serde_json::{json, Value};
use std::collections::HashMap;

use crate::services::rpc_client::make_rpc_request;
use crate::services::util::value_as_string;

pub async fn get_balance(address: &str, rpc_url: &str) -> Result<String> {
    let request_body = json!({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "eth_getBalance",
        "params": [address, "latest"]
    });
    let response = make_rpc_request(rpc_url, request_body).await?;
    let result = response
        .get("result")
        .cloned()
        .ok_or_else(|| anyhow::anyhow!("Missing result in eth_getBalance response"))?;
    value_as_string(&result, "balance")
}

/// Batch fetch balances for multiple addresses in a single RPC call.
/// Returns a map of address -> balance (hex-encoded wei).
/// Failed lookups return "0x0" for that address.
pub async fn get_balances_batch(
    addresses: &[&str],
    rpc_url: &str,
) -> Result<HashMap<String, String>> {
    if addresses.is_empty() {
        return Ok(HashMap::new());
    }

    // Build batch request: array of JSON-RPC calls
    let batch_request: Vec<Value> = addresses
        .iter()
        .enumerate()
        .map(|(i, addr)| {
            json!({
                "jsonrpc": "2.0",
                "id": i + 1,
                "method": "eth_getBalance",
                "params": [addr, "latest"]
            })
        })
        .collect();

    let response_data = make_rpc_request(rpc_url, Value::Array(batch_request)).await?;

    let mut balances = HashMap::new();

    // Response is an array of results, matched by id
    if let Some(responses) = response_data.as_array() {
        for resp in responses {
            let id = resp.get("id").and_then(|v| v.as_u64()).unwrap_or(0) as usize;
            if id == 0 || id > addresses.len() {
                continue;
            }
            let address = addresses[id - 1];

            let balance = resp
                .get("result")
                .and_then(|v| v.as_str())
                .unwrap_or("0x0")
                .to_string();

            balances.insert(address.to_string(), balance);
        }
    }

    // Fill in any missing addresses with "0x0"
    for addr in addresses {
        balances.entry(addr.to_string()).or_insert_with(|| "0x0".to_string());
    }

    Ok(balances)
}
