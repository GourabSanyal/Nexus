use axum::{extract::Json, http::StatusCode, response::Json as ResponseJson};
use crate::models::{TransactionRequest, TransactionResponse, PaginationInfo};
use crate::services::get_transactions;
use crate::config::Config;

pub async fn get_sol_transactions_handler(
    Json(payload): Json<TransactionRequest>,
) -> Result<ResponseJson<TransactionResponse>, (StatusCode, String)> {
    if payload.address.is_empty() {
        return Err((
            StatusCode::BAD_REQUEST,
            "Address cannot be empty".to_string(),
        ));
    }

    if payload.cluster.is_empty() {
        return Err((
            StatusCode::BAD_REQUEST,
            "Cluster cannot be empty".to_string(),
        ));
    }

    let cluster_url = match Config::get_solana_rpc_url(&payload.cluster) {
        url if url.is_empty() => {
            return Err((
                StatusCode::BAD_REQUEST,
                format!("Invalid cluster: {}", payload.cluster),
            ));
        }
        url => url,
    };

    // Set limit with validation (default 20, max 100)
    let limit = payload.limit
        .map(|l| l.min(100).max(1)) // Clamp between 1 and 100
        .unwrap_or(20);
    
    match get_transactions(&payload.address, &cluster_url, Some(limit)).await {
        Ok((transactions, has_more, next_cursor)) => {
            let pagination = if has_more {
                Some(PaginationInfo {
                    has_more,
                    next_cursor,
                    limit,
                })
            } else {
                None
            };

            Ok(ResponseJson(TransactionResponse {
                transactions,
                pagination,
            }))
        },
        Err(e) => {
            // Log the error for debugging
            eprintln!("Error fetching transactions: {}", e);
            
            // Return user-friendly error message
            let error_msg = if e.to_string().contains("Invalid") {
                format!("Invalid address format: {}", payload.address)
            } else if e.to_string().contains("connection") || e.to_string().contains("timeout") {
                "Failed to connect to Solana RPC. Please try again later.".to_string()
            } else {
                format!("Failed to fetch transactions: {}", e)
            };

            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                error_msg,
            ))
        },
    }
}

