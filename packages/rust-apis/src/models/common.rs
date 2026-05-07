use serde::{Deserialize, Serialize};

#[allow(dead_code)]
#[derive(Debug, Serialize, Deserialize)]
pub struct BalanceRequest {
    pub address: String,
    pub cluster: String,
}

#[allow(dead_code)]
#[derive(Debug, Serialize, Deserialize)]
pub struct BalanceResponse {
    pub balance: u64,
}
