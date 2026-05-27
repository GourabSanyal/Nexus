//! `eth_getBalance` — returns hex-encoded wei.

use anyhow::Result;
use serde_json::json;

use crate::services::rpc_client::json_rpc_call;
use crate::services::util::value_as_string;

pub async fn get_balance(address: &str, rpc_url: &str) -> Result<String> {
    let result = json_rpc_call(rpc_url, "eth_getBalance", json!([address, "latest"])).await?;
    value_as_string(&result, "balance")
}
