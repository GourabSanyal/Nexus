use serde_json::json;

use crate::api::wallet::body::parse_json_body;
use crate::api::wallet::import_scan::scan_network;
use crate::chains::ChainRegistry;
use crate::models::wallet_import::{ChainImportData, WalletImportRequest, WalletImportResponse};
use crate::services::wallet_service::resolve_import_candidates;

pub async fn handle_import_data(req: &web_sys::Request) -> (u16, String) {
    let request_data = match parse_json_body::<WalletImportRequest>(req).await {
        Ok(data) => data,
        Err(err) => return err,
    };

    let candidates = match resolve_import_candidates(&request_data) {
        Ok(c) => c,
        Err(e) => return (400, json!({"error": e.to_string()}).to_string()),
    };

    let registry = ChainRegistry::new();
    let solana_adapter = registry.adapter("solana").expect("Solana adapter missing");
    let eth_adapter = registry
        .adapter("ethereum")
        .expect("Ethereum adapter missing");

    let solana_mainnet =
        scan_network(solana_adapter, &candidates, "solana", "mainnet-beta", req).await;
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
