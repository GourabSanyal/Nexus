//! `POST /wallet/<chain>/transactions`

use serde_json::json;

use crate::chains::transaction_options::TransactionFetchOptions;
use crate::chains::ChainRegistry;

use super::body::{
    map_wallet_error, parse_wallet_body, required_address, resolve_rpc_override_from_headers,
};

pub async fn handle_transactions(req: &web_sys::Request, chain: &str) -> (u16, String) {
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
        return (
            400,
            json!({"error": format!("Unsupported chain: {chain}")}).to_string(),
        );
    };

    let cluster = parsed.cluster.as_deref();
    let env_rpc_override = resolve_rpc_override_from_headers(req, adapter, cluster);
    let rpc_override = parsed.rpc_url.as_deref().or(env_rpc_override.as_deref());

    let options = TransactionFetchOptions {
        limit: parsed.limit,
        cursor: parsed.cursor.as_deref(),
        until_signature: parsed.until_signature.as_deref(),
    };

    match adapter
        .get_transactions(address, cluster, options, rpc_override)
        .await
    {
        Ok(result) => (
            200,
            json!({
                "transactions": result.transactions,
                "pagination": {
                    "has_more": result.has_more,
                    "next_cursor": result.next_cursor,
                    "limit": result.limit
                }
            })
            .to_string(),
        ),
        Err(error) => map_wallet_error(error),
    }
}
