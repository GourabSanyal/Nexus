//! Ethereum JSON-RPC service. Submodules own one concern each; public API re-exported.

mod balance;
mod parser;
mod send;
mod transactions;

pub use crate::services::ethereum_fetch_options::EthFetchOptions;
pub use balance::{get_balance, get_balances_batch};
pub use send::{prepare_send, send_raw_transaction};
pub use transactions::get_transactions;
