//! `sendTransaction` + `getLatestBlockhash`.

use anyhow::Result;
use serde_json::{json, Value};
use web_sys::console;

use crate::services::rpc_client::json_rpc_call;
use crate::services::util::value_as_string;

pub async fn get_latest_blockhash(cluster_url: &str) -> Result<Value> {
    let result = json_rpc_call(
        cluster_url,
        "getLatestBlockhash",
        json!([{"commitment": "finalized"}]),
    )
    .await?;
    result
        .get("value")
        .cloned()
        .ok_or_else(|| anyhow::anyhow!("Failed to parse blockhash result"))
}

pub async fn send_transaction(cluster_url: &str, signed_transaction: &str) -> Result<String> {
    console::log_1(
        &format!(
            "[rust-apis] solana_rpc.send_transaction url={} signed_tx_len={}",
            cluster_url,
            signed_transaction.len()
        )
        .into(),
    );

    let params = json!([
        signed_transaction,
        { "encoding": "base64", "preflightCommitment": "confirmed" }
    ]);
    let result = json_rpc_call(cluster_url, "sendTransaction", params).await?;

    console::log_1(
        &format!(
            "[rust-apis] solana_rpc.send_transaction rpc_result={}",
            result
        )
        .into(),
    );

    value_as_string(&result, "transaction signature")
}
