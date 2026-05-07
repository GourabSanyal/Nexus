//! `POST /wallet/<chain>/balance`

use serde_json::json;

use crate::chains::ChainRegistry;

use super::body::{
    map_wallet_error, parse_wallet_body, required_address, resolve_rpc_override_from_headers,
};

pub async fn handle_balance(req: &web_sys::Request, chain: &str) -> (u16, String) {
    let parsed = match parse_wallet_body(req).await {
        Ok(parsed) => parsed,
        Err(err) => return err,
    };

    let address = match required_address(&parsed) {
        Ok(address) => address,
        Err(error) => return error,
    };

    let registry = ChainRegistry::new();
    let Some(adapter) = registry.adapter(chain) else {
        return (400, json!({"error": format!("Unsupported chain: {chain}")}).to_string());
    };

    let cluster = parsed.cluster.as_deref();
    let env_rpc_override = resolve_rpc_override_from_headers(req, adapter, cluster);
    let rpc_override = parsed.rpc_url.as_deref().or(env_rpc_override.as_deref());

    match adapter.get_balance(address, cluster, rpc_override).await {
        Ok(result) => (200, json!({ "balance": result.balance }).to_string()),
        Err(error) => map_wallet_error(error),
    }
}

