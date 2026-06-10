use serde::{Deserialize, Serialize};

use crate::models::transaction::TransactionInfo;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum DerivationScheme {
    Standard,
    Nexus,
    NexusLegacy,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WalletImportRequest {
    pub seed_phrase: String,
    #[serde(default)]
    pub max_accounts: Option<u32>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WalletImportEntry {
    pub address: String,
    pub derivation_path: String,
    pub scheme: DerivationScheme,
    pub account_index: u32,
    pub balance: String,
    pub transactions: Vec<TransactionInfo>,
    pub has_activity: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct NetworkImportData {
    pub wallets: Vec<WalletImportEntry>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ChainImportData {
    pub mainnet: NetworkImportData,
    pub devnet: NetworkImportData,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WalletImportResponse {
    pub solana: ChainImportData,
    pub ethereum: ChainImportData,
}

pub fn balance_has_funds(balance: &str) -> bool {
    let b = balance.trim();
    if b.is_empty() || b == "0" || b == "0x0" || b == "0x" {
        return false;
    }
    if let Some(hex) = b.strip_prefix("0x") {
        return u128::from_str_radix(hex, 16).map(|v| v > 0).unwrap_or(false);
    }
    b.parse::<u128>().map(|v| v > 0).unwrap_or(false)
}
