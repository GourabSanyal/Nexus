//! `getBalance` — returns lamports.

use anyhow::Result;
use serde_json::json;

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
