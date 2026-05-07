mod api;
mod chains;
mod config;
mod error;
mod handlers;
mod models;
mod services;

use wasm_bindgen::prelude::*;
use serde_json::json;

#[wasm_bindgen]
pub async fn handle_request(req: web_sys::Request) -> Result<web_sys::Response, JsValue> {
    let method = req.method();
    let path = req.url();
    let cors_origin = read_cors_origin(&req);
    let path_segment = extract_path_segment(&path);
    let headers = build_json_headers(&cors_origin)?;

    if method == "OPTIONS" {
        return make_response(200, "", &headers);
    }

    let (status, response_body): (u16, String) = route_request(&req, &method, &path_segment).await;
    make_response(status, &response_body, &headers)
}

fn read_cors_origin(req: &web_sys::Request) -> String {
    req.headers()
        .get("x-cors-origin")
        .ok()
        .flatten()
        .filter(|value| !value.trim().is_empty())
        .unwrap_or_else(|| "*".to_string())
}

fn extract_path_segment(path: &str) -> String {
    let url_parts: Vec<&str> = path.split('/').collect();
    if url_parts.len() > 3 {
        url_parts[3..].join("/")
    } else {
        String::new()
    }
}

fn build_json_headers(cors_origin: &str) -> Result<web_sys::Headers, JsValue> {
    let headers = web_sys::Headers::new().map_err(|_| "Failed to create headers")?;
    headers.set("Access-Control-Allow-Origin", cors_origin).ok();
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS").ok();
    headers.set("Access-Control-Allow-Headers", "Content-Type").ok();
    headers.set("Content-Type", "application/json").ok();
    Ok(headers)
}

async fn route_request(req: &web_sys::Request, method: &str, path_segment: &str) -> (u16, String) {
    match (method, path_segment) {
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
        ("POST", "wallet/solana/balance") => api::wallet::handle_balance(&req, "solana").await,
        ("POST", "wallet/ethereum/balance") => api::wallet::handle_balance(&req, "ethereum").await,
        ("POST", "wallet/solana/transactions") => api::wallet::handle_transactions(&req, "solana").await,
        ("POST", "wallet/ethereum/transactions") => api::wallet::handle_transactions(&req, "ethereum").await,
        ("POST", "wallet/solana/send/prepare") => api::wallet::handle_prepare_send(&req, "solana").await,
        ("POST", "wallet/solana/send") => api::wallet::handle_send(&req, "solana").await,
        ("POST", "wallet/ethereum/send/prepare") => api::wallet::handle_prepare_send(&req, "ethereum").await,
        ("POST", "wallet/ethereum/send") => api::wallet::handle_send(&req, "ethereum").await,
        _ => (404, json!({"error": "Not Found"}).to_string()),
    }
}

fn make_response(status: u16, body: &str, headers: &web_sys::Headers) -> Result<web_sys::Response, JsValue> {
    let init = web_sys::ResponseInit::new();
    init.set_status(status);
    init.set_headers(headers);

    web_sys::Response::new_with_opt_str_and_init(Some(body), &init)
        .map_err(|_| "Failed to create response".into())
}

#[wasm_bindgen]
pub fn init_panic_hook() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

// Export functions for JavaScript/TypeScript to call
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
    let (transactions, has_more, next_cursor) = services::solana_rpc::get_transactions(&address, &rpc_url, limit)
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
    let result = services::solana_rpc::get_latest_blockhash(&rpc_url)
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
    services::solana_rpc::send_transaction(&rpc_url, &signed_transaction)
        .await
        .map_err(|e| JsValue::from_str(&e.to_string()))
}

