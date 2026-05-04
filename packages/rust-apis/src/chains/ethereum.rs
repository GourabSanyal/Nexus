use crate::chains::traits::{
    BalanceFuture, BalanceResult, BlockchainAdapter, SendFuture, SendPrepareFuture, SendPrepareResult,
    SendResult, TransactionsFuture, TransactionsResult,
};
use crate::services;

pub struct EthereumAdapter;

impl EthereumAdapter {
    fn resolve_rpc(cluster: Option<&str>, rpc_override: Option<&str>) -> Result<(String, String), String> {
        let cluster_value = cluster.unwrap_or("mainnet");
        if let Some(rpc) = rpc_override {
            return Ok((cluster_value.to_string(), rpc.to_string()));
        }

        let rpc_url = match cluster_value {
            // fallback rps
            "mainnet" => "https://eth.llamarpc.com",
            "sepolia" => "https://rpc.sepolia.org",
            _ => return Err(format!("Unsupported Ethereum cluster: {cluster_value}")),
        };

        Ok((cluster_value.to_string(), rpc_url.to_string()))
    }
}

impl BlockchainAdapter for EthereumAdapter {
    fn chain_name(&self) -> &'static str { "ethereum" }

    fn rpc_override_header(&self, cluster: Option<&str>) -> Option<&'static str> {
        match cluster.unwrap_or("mainnet") {
            "sepolia" => Some("x-ethereum-sepolia-rpc"),
            _ => Some("x-ethereum-mainnet-rpc"),
        }
    }

    fn get_balance<'a>(&'a self, address: &'a str, cluster: Option<&'a str>, rpc_override: Option<&'a str>) -> BalanceFuture<'a> {
        Box::pin(async move {
            let (cluster_value, rpc) = Self::resolve_rpc(cluster, rpc_override)?;
            let balance = services::ethereum_rpc::get_balance(address, &rpc).await.map_err(|e| e.to_string())?;
            Ok(BalanceResult { balance, address: address.to_string(), cluster: cluster_value })
        })
    }

    fn get_transactions<'a>(&'a self, address: &'a str, cluster: Option<&'a str>, limit: Option<usize>, rpc_override: Option<&'a str>) -> TransactionsFuture<'a> {
        Box::pin(async move {
            let (_, rpc) = Self::resolve_rpc(cluster, rpc_override)?;
            let (transactions, has_more, next_cursor) = services::ethereum_rpc::get_transactions(address, &rpc, limit).await.map_err(|e| e.to_string())?;
            Ok(TransactionsResult { transactions, has_more, next_cursor, limit: limit.unwrap_or(20).min(100) })
        })
    }

    fn prepare_send<'a>(&'a self, cluster: Option<&'a str>, from: Option<&'a str>, to: Option<&'a str>, value: Option<&'a str>, rpc_override: Option<&'a str>) -> SendPrepareFuture<'a> {
        Box::pin(async move {
            let (_, rpc) = Self::resolve_rpc(cluster, rpc_override)?;
            let (from, to, value) = (from.ok_or("Sender address is required")?, to.ok_or("Recipient address is required")?, value.ok_or("Transaction value is required")?);
            let payload = services::ethereum_rpc::prepare_send(from, to, value, &rpc).await.map_err(|e| e.to_string())?;
            Ok(SendPrepareResult { payload })
        })
    }

    fn send_transaction<'a>(&'a self, cluster: Option<&'a str>, signed_transaction: &'a str, rpc_override: Option<&'a str>) -> SendFuture<'a> {
        Box::pin(async move {
            let (_, rpc) = Self::resolve_rpc(cluster, rpc_override)?;
            let signature = services::ethereum_rpc::send_raw_transaction(&rpc, signed_transaction).await.map_err(|e| e.to_string())?;
            Ok(SendResult { signature })
        })
    }
}
