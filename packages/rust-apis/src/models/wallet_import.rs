use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WalletImportRequest {
    pub seed_phrase: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WalletImportData {
    pub address: String,
    // Add balance and transactions as empty/placeholder for now
    pub balance: String,
    // Using simple vector of values to placeholder transactions since we don't have Alchemy yet
    pub transactions: Vec<serde_json::Value>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WalletImportResponse {
    pub solana: WalletImportData,
    pub ethereum: WalletImportData,
}
