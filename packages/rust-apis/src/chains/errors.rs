//! Typed error surface for `BlockchainAdapter` results.
//!
//! Adapters return `Result<T, WalletError>`; the route layer converts each variant
//! to its HTTP status + JSON body via `WalletError::{status_code, client_message}`.

use std::fmt;

#[derive(Debug)]
pub enum WalletError {
    UnsupportedCluster {
        chain: &'static str,
        cluster: String,
    },
    MissingField(&'static str),
    InsufficientFunds,
    Rpc(String),
}

impl WalletError {
    pub fn status_code(&self) -> u16 {
        match self {
            WalletError::UnsupportedCluster { .. }
            | WalletError::MissingField(_)
            | WalletError::InsufficientFunds => 400,
            WalletError::Rpc(_) => 500,
        }
    }

    pub fn client_message(&self) -> String {
        match self {
            WalletError::UnsupportedCluster { chain, cluster } => {
                format!("Unsupported {chain} cluster: {cluster}")
            }
            WalletError::MissingField(field) => format!("{field} is required"),
            WalletError::InsufficientFunds => INSUFFICIENT_FUNDS_HINT.to_string(),
            WalletError::Rpc(message) => message.clone(),
        }
    }
}

impl fmt::Display for WalletError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.client_message())
    }
}

impl From<anyhow::Error> for WalletError {
    fn from(error: anyhow::Error) -> Self {
        let message = error.to_string();
        if is_insufficient_funds(&message) {
            WalletError::InsufficientFunds
        } else {
            WalletError::Rpc(message)
        }
    }
}

fn is_insufficient_funds(message: &str) -> bool {
    message.contains("InsufficientFundsForRent")
        || message.contains("insufficient funds for rent")
}

const INSUFFICIENT_FUNDS_HINT: &str =
    "Insufficient SOL for rent and network fees. Fund the sender wallet or lower the amount.";
