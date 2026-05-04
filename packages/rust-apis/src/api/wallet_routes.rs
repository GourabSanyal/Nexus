use serde::Deserialize;
use serde_json::json;
use wasm_bindgen_futures::JsFuture;

use crate::chains::ChainRegistry;
use crate::chains::traits::BlockchainAdapter;

#[derive(Debug, Deserialize)]
struct BalanceBody {
    address: String,
    cluster: Option<String>,
    #[serde(alias = "rpcUrl")]
    rpc_url: Option<String>,
}

pub async fn handle_balance(req: &web_sys::Request, chain: &str) -> (u16, String) {
    let parsed = match parse_balance_body(req).await {
        Ok(parsed) => parsed,
        Err(err) => return err,
    };

    let address = parsed.address.trim();
    if address.is_empty() {
        return (400, json!({"error": "Address is required"}).to_string());
    }

    let registry = ChainRegistry::new();
    let Some(adapter) = registry.adapter(chain) else {
        return (400, json!({"error": format!("Unsupported chain: {chain}")}).to_string());
    };
    let cluster = parsed.cluster.as_deref();
    let env_rpc_override = resolve_rpc_override_from_headers(req, adapter, cluster);
    let rpc_override = parsed.rpc_url.as_deref().or(env_rpc_override.as_deref());

    match adapter
        .get_balance(
            address,
            cluster,
            rpc_override,
        )
        .await
    {
        Ok(result) => (200, json!({ "balance": result.balance }).to_string()),
        Err(error) => map_balance_error(error),
    }
}

async fn parse_balance_body(req: &web_sys::Request) -> Result<BalanceBody, (u16, String)> {
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

fn map_balance_error(error: String) -> (u16, String) {
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

fn resolve_rpc_override_from_headers(
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
