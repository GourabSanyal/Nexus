use serde_json::json;
use wasm_bindgen_futures::JsFuture;

use crate::api::wallet::import_scan::scan_network;
use crate::chains::ChainRegistry;
use crate::models::wallet_import::{ChainImportData, WalletImportRequest, WalletImportResponse};
use crate::services::wallet_service::derive_import_candidates;

pub async fn handle_import_data(req: &web_sys::Request) -> (u16, String) {
    let body_promise = match req.text() {
        Ok(p) => p,
        Err(_) => return (500, json!({"error": "Failed to read request body"}).to_string()),
    };

    let body_value = match JsFuture::from(body_promise).await {
        Ok(v) => v,
        Err(_) => return (500, json!({"error": "Failed to resolve request body"}).to_string()),
    };

    let body_str = match body_value.as_string() {
        Some(s) => s,
        None => return (400, json!({"error": "Invalid request body format"}).to_string()),
    };

    let request_data: WalletImportRequest = match serde_json::from_str(&body_str) {
        Ok(data) => data,
        Err(_) => return (400, json!({"error": "Invalid JSON payload"}).to_string()),
    };

    let candidates = match derive_import_candidates(
        &request_data.seed_phrase,
        request_data.max_accounts,
    ) {
        Ok(c) => c,
        Err(e) => return (400, json!({"error": e.to_string()}).to_string()),
    };

    let registry = ChainRegistry::new();
    let solana_adapter = registry.adapter("solana").expect("Solana adapter missing");
    let eth_adapter = registry.adapter("ethereum").expect("Ethereum adapter missing");

    let solana_mainnet = scan_network(solana_adapter, &candidates, "solana", "mainnet-beta", req).await;
    let solana_devnet = scan_network(solana_adapter, &candidates, "solana", "devnet", req).await;
    let ethereum_mainnet = scan_network(eth_adapter, &candidates, "ethereum", "mainnet", req).await;
    let ethereum_devnet = scan_network(eth_adapter, &candidates, "ethereum", "sepolia", req).await;

    let response = WalletImportResponse {
        solana: ChainImportData {
            mainnet: solana_mainnet,
            devnet: solana_devnet,
        },
        ethereum: ChainImportData {
            mainnet: ethereum_mainnet,
            devnet: ethereum_devnet,
        },
    };

    (200, json!(response).to_string())
}
