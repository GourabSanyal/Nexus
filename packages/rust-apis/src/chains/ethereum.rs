use crate::chains::errors::WalletError;
use crate::chains::traits::{
    BalanceFuture, BalanceResult, BatchBalanceFuture, BlockchainAdapter, SendFuture,
    SendPrepareFuture, SendPrepareResult, SendResult, TransactionsFuture, TransactionsResult,
};
use crate::chains::transaction_options::TransactionFetchOptions;
use crate::services;

pub struct EthereumAdapter;

impl EthereumAdapter {
    fn resolve_rpc(
        cluster: Option<&str>,
        rpc_override: Option<&str>,
    ) -> Result<(String, String), WalletError> {
        let cluster_value = cluster.unwrap_or("mainnet");
        if let Some(rpc) = rpc_override {
            return Ok((cluster_value.to_string(), rpc.to_string()));
        }

        let rpc_url = match cluster_value {
            "mainnet" => "https://eth.llamarpc.com",
            "sepolia" => "https://rpc.sepolia.org",
            _ => {
                return Err(WalletError::UnsupportedCluster {
                    chain: "ethereum",
                    cluster: cluster_value.to_string(),
                })
            }
        };

        Ok((cluster_value.to_string(), rpc_url.to_string()))
    }
}

impl BlockchainAdapter for EthereumAdapter {
    fn chain_name(&self) -> &'static str {
        "ethereum"
    }

    fn rpc_override_header(&self, cluster: Option<&str>) -> Option<&'static str> {
        match cluster.unwrap_or("mainnet") {
            "sepolia" => Some("x-ethereum-sepolia-rpc"),
            _ => Some("x-ethereum-mainnet-rpc"),
        }
    }

    fn get_balance<'a>(
        &'a self,
        address: &'a str,
        cluster: Option<&'a str>,
        rpc_override: Option<&'a str>,
    ) -> BalanceFuture<'a> {
        Box::pin(async move {
            let (_, rpc) = Self::resolve_rpc(cluster, rpc_override)?;
            let balance = services::ethereum_rpc::get_balance(address, &rpc).await?;
            Ok(BalanceResult { balance })
        })
    }

    fn get_balances_batch<'a>(
        &'a self,
        addresses: &'a [&'a str],
        cluster: Option<&'a str>,
        rpc_override: Option<&'a str>,
    ) -> BatchBalanceFuture<'a> {
        Box::pin(async move {
            let (_, rpc) = Self::resolve_rpc(cluster, rpc_override)?;
            let balances = services::ethereum_rpc::get_balances_batch(addresses, &rpc)
                .await
                .map_err(|e| WalletError::Rpc(e.to_string()))?;
            Ok(balances)
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
            let (_, rpc) = Self::resolve_rpc(cluster, rpc_override)?;
            let limit = options.effective_limit();
            let fetch_options = services::ethereum_rpc::EthFetchOptions {
                limit,
                page_key: options.cursor,
                until_hash: options.until_signature,
            };
            let (transactions, has_more, next_cursor) =
                services::ethereum_rpc::get_transactions(address, &rpc, fetch_options).await?;
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
        from: Option<&'a str>,
        to: Option<&'a str>,
        value: Option<&'a str>,
        rpc_override: Option<&'a str>,
    ) -> SendPrepareFuture<'a> {
        Box::pin(async move {
            let (_, rpc) = Self::resolve_rpc(cluster, rpc_override)?;
            let from = from.ok_or(WalletError::MissingField("Sender address"))?;
            let to = to.ok_or(WalletError::MissingField("Recipient address"))?;
            let value = value.ok_or(WalletError::MissingField("Transaction value"))?;
            let payload = services::ethereum_rpc::prepare_send(from, to, value, &rpc).await?;
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
            let (_, rpc) = Self::resolve_rpc(cluster, rpc_override)?;
            let signature =
                services::ethereum_rpc::send_raw_transaction(&rpc, signed_transaction).await?;
            Ok(SendResult { signature })
        })
    }
}
