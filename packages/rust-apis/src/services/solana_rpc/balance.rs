//! `getBalance` — returns lamports. Supports single and batch requests.

use anyhow::Result;
use serde_json::{json, Value};
use std::collections::HashMap;

use crate::services::rpc_client::make_rpc_request;

pub async fn get_balance(address: &str, cluster_url: &str) -> Result<u64> {
    let request_body = json!({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getBalance",
        "params": [address]
    });

    let response_data = make_rpc_request(cluster_url, request_body).await?;

    response_data
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
        })
}

/// Batch fetch balances for multiple addresses in a single RPC call.
/// Returns a map of address -> balance (in lamports as string).
/// Failed lookups return "0" for that address.
pub async fn get_balances_batch(
    addresses: &[&str],
    cluster_url: &str,
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
                "method": "getBalance",
                "params": [addr]
            })
        })
        .collect();

    let response_data = make_rpc_request(cluster_url, Value::Array(batch_request)).await?;

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
                .and_then(|r| {
                    if r.is_number() {
                        r.as_u64()
                    } else {
                        r.get("value").and_then(|v| v.as_u64())
                    }
                })
                .unwrap_or(0);

            balances.insert(address.to_string(), balance.to_string());
        }
    }

    // Fill in any missing addresses with "0"
    for addr in addresses {
        balances.entry(addr.to_string()).or_insert_with(|| "0".to_string());
    }

    Ok(balances)
}
