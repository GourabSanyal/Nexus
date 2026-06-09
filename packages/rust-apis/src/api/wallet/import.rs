use serde_json::json;
use wasm_bindgen_futures::JsFuture;
use crate::models::wallet_import::{WalletImportData, WalletImportRequest, WalletImportResponse};
use crate::services::wallet_service::derive_wallets_from_mnemonic;

pub async fn handle_import_data(req: &web_sys::Request) -> (u16, String) {
    // 1. Parse the request body
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

    // 2. Validate and derive addresses from mnemonic
    let derived_wallets = match derive_wallets_from_mnemonic(&request_data.seed_phrase) {
        Ok(wallets) => wallets,
        Err(e) => return (400, json!({"error": e.to_string()}).to_string()),
    };

    // 3. For Slice 2, return the generated addresses with empty balances/transactions
    let response = WalletImportResponse {
        solana: WalletImportData {
            address: derived_wallets.solana_address,
            balance: "0".to_string(),
            transactions: vec![],
        },
        ethereum: WalletImportData {
            address: derived_wallets.ethereum_address,
            balance: "0".to_string(),
            transactions: vec![],
        },
    };

    (200, json!(response).to_string())
}
