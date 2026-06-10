//! Shared JSON body parsing + RPC override resolution for wallet routes.
//!
//! Keeping parsing here prevents route handlers from bloating as we add more wallet endpoints.

use serde::Deserialize;
use serde_json::json;
use wasm_bindgen_futures::JsFuture;

use crate::chains::traits::BlockchainAdapter;
use crate::chains::WalletError;

#[derive(Debug, Deserialize)]
pub struct WalletRequestBody {
    #[serde(default)]
    pub address: Option<String>,
    pub cluster: Option<String>,
    #[serde(default)]
    pub limit: Option<usize>,
    /// Fetch transactions older than this signature (for "load more" pagination)
    #[serde(default)]
    pub cursor: Option<String>,
    /// Stop fetching when this signature is found (for incremental sync - fetch only new txs)
    #[serde(alias = "untilSignature", default)]
    pub until_signature: Option<String>,
    #[serde(default)]
    pub to: Option<String>,
    #[serde(default)]
    pub value: Option<String>,
    #[serde(alias = "signedTransaction", default)]
    pub signed_transaction: Option<String>,
    #[serde(alias = "rpcUrl")]
    pub rpc_url: Option<String>,
}

pub async fn read_request_body(req: &web_sys::Request) -> Result<String, (u16, String)> {
    let body_promise = req.text().map_err(|_| {
        (
            500,
            json!({"error": "Failed to read request body"}).to_string(),
        )
    })?;
    let body_value = JsFuture::from(body_promise).await.map_err(|_| {
        (
            500,
            json!({"error": "Failed to resolve request body"}).to_string(),
        )
    })?;

    body_value.as_string().ok_or_else(|| {
        (
            400,
            json!({"error": "Invalid request body format"}).to_string(),
        )
    })
}

pub async fn parse_json_body<T>(req: &web_sys::Request) -> Result<T, (u16, String)>
where
    T: for<'de> Deserialize<'de>,
{
    let body_str = read_request_body(req).await?;
    serde_json::from_str(&body_str)
        .map_err(|_| (400, json!({"error": "Invalid JSON payload"}).to_string()))
}

pub async fn parse_wallet_body(req: &web_sys::Request) -> Result<WalletRequestBody, (u16, String)> {
    parse_json_body(req).await.map_err(|(status, body)| {
        if status == 400 {
            (
                status,
                json!({"error": "Invalid request payload"}).to_string(),
            )
        } else {
            (status, body)
        }
    })
}

pub fn map_wallet_error(error: WalletError) -> (u16, String) {
    (
        error.status_code(),
        json!({ "error": error.client_message() }).to_string(),
    )
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
