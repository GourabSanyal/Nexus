mod api;
mod config;
mod error;
mod handlers;
mod models;
mod services;

use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::JsFuture;
use serde_json::json;

#[wasm_bindgen]
pub async fn handle_request(req: web_sys::Request) -> Result<web_sys::Response, JsValue> {
    let method = req.method();
    let path = req.url();

    // Parse path from URL
    let url_parts: Vec<&str> = path.split('/').collect();
    let path_segment = if url_parts.len() > 3 {
        url_parts[3..].join("/")
    } else {
        String::new()
    };

    // Create CORS headers
    let mut headers = web_sys::Headers::new().map_err(|_| "Failed to create headers")?;
    headers.set("Access-Control-Allow-Origin", "*").ok();
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS").ok();
    headers.set("Access-Control-Allow-Headers", "Content-Type").ok();
    headers.set("Content-Type", "application/json").ok();

    // Handle CORS preflight
    if method == "OPTIONS" {
        let mut init = web_sys::ResponseInit::new();
        init.set_status(200);
        init.set_headers(&headers);
        let response = web_sys::Response::new_with_opt_str_and_init(
            Some(""),
            &init,
        ).map_err(|_| "Failed to create response")?;
        return Ok(response);
    }

    let (status, response_body): (u16, String) = match (method.as_str(), path_segment.as_str()) {
        ("GET", "") => {
            (200, json!({"message": "Hello from Cloudflare Worker - Rust APIs"}).to_string())
        }
        ("GET", "health") => {
            (200, json!({
                "status": "ok",
                "service": "rust-apis",
                "timestamp": js_sys::Date::now() as u64,
            }).to_string())
        }
        ("POST", "wallet/solana/balance") => {
            let body_promise = req.text().map_err(|_| "Failed to get request text")?;
            match JsFuture::from(body_promise).await {
                Ok(body_val) => {
                    if let Some(_body_str) = body_val.as_string() {
                        // Handle balance request
                        (200, json!({"error": "Balance endpoint requires environment setup"}).to_string())
                    } else {
                        (400, json!({"error": "Invalid request body"}).to_string())
                    }
                }
                Err(_) => {
                    (500, json!({"error": "Failed to read request body"}).to_string())
                }
            }
        }
        ("POST", "wallet/solana/transactions") => {
            (200, json!({"error": "Transactions endpoint requires environment setup"}).to_string())
        }
        _ => {
            (404, json!({"error": "Not Found"}).to_string())
        }
    };

    let mut init = web_sys::ResponseInit::new();
    init.set_status(status);
    init.set_headers(&headers);

    let response = web_sys::Response::new_with_opt_str_and_init(
        Some(&response_body),
        &init,
    ).map_err(|_| "Failed to create response")?;

    Ok(response)
}

#[wasm_bindgen]
pub fn init_panic_hook() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

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

#[wasm_bindgen]
pub async fn get_solana_latest_blockhash(rpc_url: String) -> Result<JsValue, JsValue> {
    let result = services::get_latest_blockhash(&rpc_url)
        .await
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    // Convert Value to JsValue
    serde_json::to_string(&result)
        .map(|s| JsValue::from_str(&s))
        .map_err(|e| JsValue::from_str(&e.to_string()))
}

#[wasm_bindgen]
pub async fn send_solana_transaction(
    signed_transaction: String,
    rpc_url: String,
) -> Result<String, JsValue> {
    services::send_transaction(&rpc_url, &signed_transaction)
        .await
        .map_err(|e| JsValue::from_str(&e.to_string()))
}

