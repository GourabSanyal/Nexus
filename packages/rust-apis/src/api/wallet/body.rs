//! Shared JSON body parsing + RPC override resolution for wallet routes.
//!
//! Keeping parsing here prevents route handlers from bloating as we add more wallet endpoints.

use serde::Deserialize;
use serde_json::json;
use wasm_bindgen_futures::JsFuture;

use crate::chains::traits::BlockchainAdapter;

#[derive(Debug, Deserialize)]
pub struct WalletRequestBody {
    pub address: String,
    pub cluster: Option<String>,
    #[serde(default)]
    pub limit: Option<usize>,
    #[serde(alias = "rpcUrl")]
    pub rpc_url: Option<String>,
}

pub async fn parse_wallet_body(req: &web_sys::Request) -> Result<WalletRequestBody, (u16, String)> {
    let body_promise = req
        .text()
        .map_err(|_| (500, json!({"error": "Failed to read request body"}).to_string()))?;
    let body_value = JsFuture::from(body_promise)
        .await
        .map_err(|_| (500, json!({"error": "Failed to read request body"}).to_string()))?;
    let body_str = body_value
        .as_string()
        .ok_or_else(|| (400, json!({"error": "Invalid request body"}).to_string()))?;

    serde_json::from_str(&body_str)
        .map_err(|_| (400, json!({"error": "Invalid request payload"}).to_string()))
}

pub fn map_wallet_error(error: String) -> (u16, String) {
    let bad_request = [
        "Unsupported Solana cluster",
        "Unsupported Ethereum cluster",
        "unsupported cluster",
    ];
    let status = if bad_request.iter().any(|needle| error.contains(needle)) {
        400
    } else {
        500
    };
    (status, json!({"error": error}).to_string())
}

pub fn resolve_rpc_override_from_headers(
    req: &web_sys::Request,
    adapter: &dyn BlockchainAdapter,
    cluster: Option<&str>,
) -> Option<String> {
    let header_name = adapter.rpc_override_header(cluster)?;

    req.headers()
        .get(header_name)
        .ok()
        .flatten()
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
}

