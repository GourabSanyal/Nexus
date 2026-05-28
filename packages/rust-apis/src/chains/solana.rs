use serde_json::json;

use crate::chains::errors::WalletError;
use crate::chains::traits::{
    BalanceFuture, BalanceResult, BlockchainAdapter, SendFuture, SendPrepareFuture,
    SendPrepareResult, SendResult, TransactionsFuture, TransactionsResult,
};
use crate::chains::transaction_options::TransactionFetchOptions;
use crate::services;

pub struct SolanaAdapter;

impl SolanaAdapter {
    fn resolve_rpc(
        cluster: Option<&str>,
        rpc_override: Option<&str>,
    ) -> Result<(String, String), WalletError> {
        let cluster_value = cluster.unwrap_or("mainnet-beta");

        if let Some(url) = rpc_override {
            return Ok((cluster_value.to_string(), url.to_string()));
        }

        let rpc_url = match cluster_value {
            "mainnet" | "mainnet-beta" => "https://api.mainnet-beta.solana.com",
            "devnet" => "https://api.devnet.solana.com",
            "testnet" => "https://api.testnet.solana.com",
            _ => {
                return Err(WalletError::UnsupportedCluster {
                    chain: "solana",
                    cluster: cluster_value.to_string(),
                })
            }
        };

        Ok((cluster_value.to_string(), rpc_url.to_string()))
    }
}

impl BlockchainAdapter for SolanaAdapter {
    fn chain_name(&self) -> &'static str {
        "solana"
    }

    fn rpc_override_header(&self, cluster: Option<&str>) -> Option<&'static str> {
        match cluster.unwrap_or("mainnet-beta") {
            "devnet" => Some("x-solana-devnet-rpc"),
            "mainnet" | "mainnet-beta" | "testnet" => Some("x-solana-mainnet-rpc"),
            _ => Some("x-solana-mainnet-rpc"),
        }
    }

    fn get_balance<'a>(
        &'a self,
        address: &'a str,
        cluster: Option<&'a str>,
        rpc_override: Option<&'a str>,
    ) -> BalanceFuture<'a> {
        Box::pin(async move {
            let (_, rpc_url) = Self::resolve_rpc(cluster, rpc_override)?;
            let lamports = services::solana_rpc::get_balance(address, &rpc_url).await?;
            Ok(BalanceResult {
                balance: lamports.to_string(),
            })
        })
    }

    fn get_transactions<'a>(
        &'a self,
        address: &'a str,
        cluster: Option<&'a str>,
        options: TransactionFetchOptions<'a>,
        rpc_override: Option<&'a str>,
    ) -> TransactionsFuture<'a> {
        Box::pin(async move {
            let (_, rpc_url) = Self::resolve_rpc(cluster, rpc_override)?;
            let limit = options.effective_limit();
            let fetch_options = services::solana_rpc::SolanaFetchOptions {
                limit,
                before: options.cursor,
                until: options.until_signature,
            };
            let (transactions, has_more, next_cursor) =
                services::solana_rpc::get_transactions(address, &rpc_url, fetch_options).await?;

            Ok(TransactionsResult {
                transactions,
                has_more,
                next_cursor,
                limit,
            })
        })
    }

    fn prepare_send<'a>(
        &'a self,
        cluster: Option<&'a str>,
        _from: Option<&'a str>,
        _to: Option<&'a str>,
        _value: Option<&'a str>,
        rpc_override: Option<&'a str>,
    ) -> SendPrepareFuture<'a> {
        Box::pin(async move {
            let (cluster_value, rpc_url) = Self::resolve_rpc(cluster, rpc_override)?;
            let blockhash_payload = services::solana_rpc::get_latest_blockhash(&rpc_url).await?;
            let payload = json!({
                "chain": "solana",
                "cluster": cluster_value,
                "blockhash": blockhash_payload.get("blockhash").and_then(|v| v.as_str()),
                "lastValidBlockHeight": blockhash_payload.get("lastValidBlockHeight").and_then(|v| v.as_u64()),
            });

            Ok(SendPrepareResult { payload })
        })
    }

    fn send_transaction<'a>(
        &'a self,
        cluster: Option<&'a str>,
        signed_transaction: &'a str,
        rpc_override: Option<&'a str>,
    ) -> SendFuture<'a> {
        Box::pin(async move {
            let (_, rpc_url) = Self::resolve_rpc(cluster, rpc_override)?;
            let signature =
                services::solana_rpc::send_transaction(&rpc_url, signed_transaction).await?;
            Ok(SendResult { signature })
        })
    }
}
