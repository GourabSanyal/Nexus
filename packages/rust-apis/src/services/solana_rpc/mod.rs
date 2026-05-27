//! Solana JSON-RPC service. Submodules own one concern each; public API re-exported.

mod balance;
mod details;
mod parser;
mod send;
mod signatures;

pub use crate::services::solana_fetch_options::SolanaFetchOptions;
pub use balance::get_balance;
pub use send::{get_latest_blockhash, send_transaction};
pub use signatures::get_transactions;
