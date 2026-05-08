//! `POST /wallet/<chain>/send/*`

use serde_json::json;
use web_sys::console;

use crate::chains::ChainRegistry;

use super::body::{map_wallet_error, parse_wallet_body, resolve_rpc_override_from_headers};

pub async fn handle_prepare_send(req: &web_sys::Request, chain: &str) -> (u16, String) {
    let parsed = match parse_wallet_body(req).await {
        Ok(parsed) => parsed,
        Err(err) => return err,
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

    match adapter
        .prepare_send(
            cluster,
            parsed
                .address
                .as_deref()
                .map(str::trim)
                .filter(|s| !s.is_empty()),
            parsed.to.as_deref(),
            parsed.value.as_deref(),
            rpc_override,
        )
        .await
    {
        Ok(result) => (200, result.payload.to_string()),
        Err(error) => map_wallet_error(error),
    }
}

pub async fn handle_send(req: &web_sys::Request, chain: &str) -> (u16, String) {
    let parsed = match parse_wallet_body(req).await {
        Ok(parsed) => parsed,
        Err(err) => return err,
    };

    let signed_transaction = match parsed
        .signed_transaction
        .as_deref()
        .map(str::trim)
        .filter(|s| !s.is_empty())
    {
        Some(value) => value,
        None => {
            return (
                400,
                json!({"error": "signedTransaction is required"}).to_string(),
            )
        }
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

    console::log_1(
        &format!(
            "[rust-apis] handle_send chain={} cluster={:?} signed_tx_len={} rpc_override_present={}",
            chain,
            cluster,
            signed_transaction.len(),
            rpc_override.is_some()
        )
        .into(),
    );

    match adapter
        .send_transaction(cluster, signed_transaction, rpc_override)
        .await
    {
        Ok(result) => {
            console::log_1(
                &format!(
                    "[rust-apis] handle_send success chain={} signature={}",
                    chain, result.signature
                )
                .into(),
            );
            (200, json!({ "signature": result.signature }).to_string())
        }
        Err(error) => {
            console::log_1(
                &format!("[rust-apis] handle_send error chain={} error={}", chain, error).into(),
            );
            map_wallet_error(error)
        }
    }
}
