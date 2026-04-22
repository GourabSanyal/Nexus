use serde::Deserialize;
use serde_json::json;
use wasm_bindgen_futures::JsFuture;

use crate::chains::ChainRegistry;

#[derive(Debug, Deserialize)]
struct BalanceBody {
    address: String,
    cluster: Option<String>,
}

pub async fn handle_balance(req: &web_sys::Request, chain: &str) -> (u16, String) {
    let body_promise = match req.text() {
        Ok(promise) => promise,
        Err(_) => return (500, json!({"error": "Failed to read request body"}).to_string()),
    };

    let body_value = match JsFuture::from(body_promise).await {
        Ok(value) => value,
        Err(_) => return (500, json!({"error": "Failed to read request body"}).to_string()),
    };

    let body_str = match body_value.as_string() {
        Some(value) => value,
        None => return (400, json!({"error": "Invalid request body"}).to_string()),
    };

    let parsed: BalanceBody = match serde_json::from_str(&body_str) {
        Ok(value) => value,
        Err(_) => return (400, json!({"error": "Invalid request payload"}).to_string()),
    };

    let address = parsed.address.trim();
    if address.is_empty() {
        return (400, json!({"error": "Address is required"}).to_string());
    }

    let registry = ChainRegistry::new();
    let Some(adapter) = registry.adapter(chain) else {
        return (400, json!({"error": format!("Unsupported chain: {chain}")}).to_string());
    };

    match adapter.get_balance(address, parsed.cluster.as_deref()).await {
        Ok(result) => (
            200,
            json!({
                "balance": result.balance,
                "address": result.address,
                "cluster": result.cluster,
                "chain": chain,
            })
            .to_string(),
        ),
        Err(error) => (500, json!({"error": error}).to_string()),
    }
}
