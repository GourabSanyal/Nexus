mod api;
mod config;
mod error;
mod handlers;
mod models;
mod services;

use wasm_bindgen::prelude::*;

// Export functions for JavaScript/TypeScript to call
#[wasm_bindgen]
pub async fn get_solana_balance(address: String, rpc_url: String) -> Result<u64, JsValue> {
    services::get_balance(&address, &rpc_url)
        .await
        .map_err(|e| JsValue::from_str(&e.to_string()))
}

#[wasm_bindgen]
pub async fn get_solana_transactions(
    address: String,
    rpc_url: String,
    limit: Option<usize>,
) -> Result<JsValue, JsValue> {
    let (transactions, has_more, next_cursor) = services::get_transactions(&address, &rpc_url, limit)
        .await
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    // Convert to JSON
    let result = serde_json::json!({
        "transactions": transactions,
        "has_more": has_more,
        "next_cursor": next_cursor,
    });

    serde_json::to_string(&result)
        .map(|s| JsValue::from_str(&s))
        .map_err(|e| JsValue::from_str(&e.to_string()))
}
