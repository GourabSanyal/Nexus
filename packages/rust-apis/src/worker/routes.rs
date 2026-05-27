//! Method+path → handler dispatch. No parsing or chain-specific logic here.

use serde_json::json;

use crate::api;

pub async fn route_request(
    req: &web_sys::Request,
    method: &str,
    path_segment: &str,
) -> (u16, String) {
    match (method, path_segment) {
        ("GET", "") => (
            200,
            json!({"message": "Hello from Cloudflare Worker - Rust APIs"}).to_string(),
        ),
        ("GET", "health") => (
            200,
            json!({
                "status": "ok",
                "service": "rust-apis",
                "timestamp": js_sys::Date::now() as u64,
            })
            .to_string(),
        ),
        ("POST", "wallet/solana/balance") => api::wallet::handle_balance(req, "solana").await,
        ("POST", "wallet/ethereum/balance") => api::wallet::handle_balance(req, "ethereum").await,
        ("POST", "wallet/solana/transactions") => {
            api::wallet::handle_transactions(req, "solana").await
        }
        ("POST", "wallet/ethereum/transactions") => {
            api::wallet::handle_transactions(req, "ethereum").await
        }
        ("POST", "wallet/solana/send/prepare") => {
            api::wallet::handle_prepare_send(req, "solana").await
        }
        ("POST", "wallet/solana/send") => api::wallet::handle_send(req, "solana").await,
        ("POST", "wallet/ethereum/send/prepare") => {
            api::wallet::handle_prepare_send(req, "ethereum").await
        }
        ("POST", "wallet/ethereum/send") => api::wallet::handle_send(req, "ethereum").await,
        _ => (404, json!({"error": "Not Found"}).to_string()),
    }
}
