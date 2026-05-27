//! Direct `#[wasm_bindgen]` exports for JS/TS — bypasses the HTTP `handle_request` path.

use serde_json::json;
use wasm_bindgen::prelude::*;

use crate::chains::transaction_options::TransactionFetchOptions;
use crate::services;

#[wasm_bindgen]
pub async fn get_solana_balance(address: String, rpc_url: String) -> Result<u64, JsValue> {
    services::solana_rpc::get_balance(&address, &rpc_url)
        .await
        .map_err(|e| JsValue::from_str(&e.to_string()))
}

#[wasm_bindgen]
pub async fn get_solana_transactions(
    address: String,
    rpc_url: String,
    limit: Option<usize>,
) -> Result<JsValue, JsValue> {
    let effective_limit = TransactionFetchOptions {
        limit,
        cursor: None,
        until_signature: None,
    }
    .effective_limit();
    let options = services::solana_rpc::SolanaFetchOptions {
        limit: effective_limit,
        before: None,
        until: None,
    };
    let (transactions, has_more, next_cursor) =
        services::solana_rpc::get_transactions(&address, &rpc_url, options)
            .await
            .map_err(|e| JsValue::from_str(&e.to_string()))?;

    let result = json!({
        "transactions": transactions,
        "has_more": has_more,
        "next_cursor": next_cursor,
    });

    serde_json::to_string(&result)
        .map(|s| JsValue::from_str(&s))
        .map_err(|e| JsValue::from_str(&e.to_string()))
}

#[wasm_bindgen]
pub async fn get_solana_latest_blockhash(rpc_url: String) -> Result<JsValue, JsValue> {
    let result = services::solana_rpc::get_latest_blockhash(&rpc_url)
        .await
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    serde_json::to_string(&result)
        .map(|s| JsValue::from_str(&s))
        .map_err(|e| JsValue::from_str(&e.to_string()))
}

#[wasm_bindgen]
pub async fn send_solana_transaction(
    signed_transaction: String,
    rpc_url: String,
) -> Result<String, JsValue> {
    services::solana_rpc::send_transaction(&rpc_url, &signed_transaction)
        .await
        .map_err(|e| JsValue::from_str(&e.to_string()))
}
