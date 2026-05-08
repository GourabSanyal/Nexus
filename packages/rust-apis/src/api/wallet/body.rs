//! Shared JSON body parsing + RPC override resolution for wallet routes.
//!
//! Keeping parsing here prevents route handlers from bloating as we add more wallet endpoints.

use serde::Deserialize;
use serde_json::json;
use wasm_bindgen_futures::JsFuture;

use crate::chains::traits::BlockchainAdapter;

#[derive(Debug, Deserialize)]
pub struct WalletRequestBody {
    #[serde(default)]
    pub address: Option<String>,
    pub cluster: Option<String>,
    #[serde(default)]
    pub limit: Option<usize>,
    #[serde(default)]
    pub to: Option<String>,
    #[serde(default)]
    pub value: Option<String>,
    #[serde(alias = "signedTransaction", default)]
    pub signed_transaction: Option<String>,
    #[serde(alias = "rpcUrl")]
    pub rpc_url: Option<String>,
}

pub async fn parse_wallet_body(req: &web_sys::Request) -> Result<WalletRequestBody, (u16, String)> {
    let body_promise = req.text().map_err(|_| {
        (
            500,
            json!({"error": "Failed to read request body"}).to_string(),
        )
    })?;
    let body_value = JsFuture::from(body_promise).await.map_err(|_| {
        (
            500,
            json!({"error": "Failed to read request body"}).to_string(),
        )
    })?;
    let body_str = body_value
        .as_string()
        .ok_or_else(|| (400, json!({"error": "Invalid request body"}).to_string()))?;

    serde_json::from_str(&body_str)
        .map_err(|_| (400, json!({"error": "Invalid request payload"}).to_string()))
}

pub fn map_wallet_error(error: String) -> (u16, String) {
    let (status, client_error) = if error.contains("InsufficientFundsForRent")
        || error.contains("insufficient funds for rent")
    {
        (
            400,
            "Insufficient SOL for rent and network fees. Fund the sender wallet or lower the amount."
                .to_string(),
        )
    } else if error.contains("Unsupported Solana cluster")
        || error.contains("Unsupported Ethereum cluster")
        || error.contains("unsupported cluster")
    {
        (400, error.clone())
    } else {
        (500, error.clone())
    };

    (status, json!({"error": client_error}).to_string())
}

pub fn required_address(parsed: &WalletRequestBody) -> Result<&str, (u16, String)> {
    let address = parsed
        .address
        .as_deref()
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .ok_or_else(|| (400, json!({"error": "Address is required"}).to_string()))?;
    Ok(address)
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
