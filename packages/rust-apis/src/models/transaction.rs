use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct TransactionRequest {
    pub address: String,
    pub cluster: String,
    #[serde(default)]
    pub limit: Option<usize>, // Optional limit, default to 20
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TransactionInfo {
    pub signature: String,
    pub slot: u64,

    pub block_time: Option<i64>,

    pub status: String,
    pub err: Option<serde_json::Value>,
    pub confirmation_status: Option<String>,

    pub amount: Option<f64>,
    pub fee: Option<f64>,
    pub direction: Option<String>,

    pub from_address: Option<String>,
    pub to_address: Option<String>,
    pub memo: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PaginationInfo {
    pub has_more: bool,
    pub next_cursor: Option<String>, // last signature for next page
    pub limit: usize,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TransactionResponse {
    pub transactions: Vec<TransactionInfo>,
    pub pagination: Option<PaginationInfo>,
}
