use axum::{routing::post, Router};
use crate::handlers::get_sol_balance_handler;

pub fn wallet_routes() -> Router {
    Router::new().route("/wallet/solana/balance", post(get_sol_balance_handler))
}
