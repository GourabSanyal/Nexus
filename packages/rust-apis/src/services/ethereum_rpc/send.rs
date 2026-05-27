//! `eth_sendRawTransaction` + prepare-send (chainId + nonce + gasPrice + gasLimit).

use anyhow::Result;
use serde_json::{json, Value};

use crate::services::rpc_client::json_rpc_call;
use crate::services::util::value_as_string;

pub async fn prepare_send(address: &str, to: &str, value: &str, rpc_url: &str) -> Result<Value> {
    let chain_id = json_rpc_call(rpc_url, "eth_chainId", json!([])).await?;
    let nonce = json_rpc_call(
        rpc_url,
        "eth_getTransactionCount",
        json!([address, "pending"]),
    )
    .await?;
    let gas_price = json_rpc_call(rpc_url, "eth_gasPrice", json!([])).await?;
    let gas_limit = json_rpc_call(
        rpc_url,
        "eth_estimateGas",
        json!([{"from": address, "to": to, "value": value}]),
    )
    .await?;
    Ok(json!({
        "chainId": chain_id,
        "nonce": nonce,
        "gasPrice": gas_price,
        "gasLimit": gas_limit,
    }))
}

pub async fn send_raw_transaction(rpc_url: &str, signed_transaction: &str) -> Result<String> {
    let result = json_rpc_call(
        rpc_url,
        "eth_sendRawTransaction",
        json!([signed_transaction]),
    )
    .await?;
    value_as_string(&result, "tx hash")
}
