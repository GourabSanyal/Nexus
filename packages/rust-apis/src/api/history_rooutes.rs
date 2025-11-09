use crate::handlers::get_sol_transactions_handler;
use axum::{routing::post, Router};

pub fn history_routes() -> Router {
    Router::new().route(
        "/wallet/solana/transactions",
        post(get_sol_transactions_handler),
    )
}
