use axum::{extract::Json, http::StatusCode, response::Json as ResponseJson};
use crate::models::{BalanceRequest, BalanceResponse};
use crate::services::get_balance;
use crate::config::Config;

pub async fn get_sol_balance_handler(
    Json(payload): Json<BalanceRequest>,
) -> Result<ResponseJson<BalanceResponse>, (StatusCode, String)> {
    
    let cluster_url = Config::get_solana_rpc_url(&payload.cluster);
    
    match get_balance(&payload.address, &cluster_url).await {
        Ok(balance) => {
            Ok(ResponseJson(BalanceResponse { balance }))
        },
        Err(e) => {
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Failed to get balance: {}", e),
            ))
        },
    }
}
