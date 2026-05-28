use std::future::Future;
use std::pin::Pin;

use crate::chains::errors::WalletError;
use crate::chains::transaction_options::TransactionFetchOptions;
use crate::models::transaction::TransactionInfo;

pub struct BalanceResult {
    pub balance: String,
}

pub type BalanceFuture<'a> =
    Pin<Box<dyn Future<Output = Result<BalanceResult, WalletError>> + 'a>>;
pub type TransactionsFuture<'a> =
    Pin<Box<dyn Future<Output = Result<TransactionsResult, WalletError>> + 'a>>;
pub type SendPrepareFuture<'a> =
    Pin<Box<dyn Future<Output = Result<SendPrepareResult, WalletError>> + 'a>>;
pub type SendFuture<'a> = Pin<Box<dyn Future<Output = Result<SendResult, WalletError>> + 'a>>;

pub struct TransactionsResult {
    pub transactions: Vec<TransactionInfo>,
    pub has_more: bool,
    pub next_cursor: Option<String>,
    pub limit: usize,
}

pub struct SendPrepareResult {
    pub payload: serde_json::Value,
}

pub struct SendResult {
    pub signature: String,
}

pub trait BlockchainAdapter {
    fn chain_name(&self) -> &'static str;
    fn rpc_override_header(&self, cluster: Option<&str>) -> Option<&'static str>;
    fn get_balance<'a>(
        &'a self,
        address: &'a str,
        cluster: Option<&'a str>,
        rpc_override: Option<&'a str>,
    ) -> BalanceFuture<'a>;
    fn get_transactions<'a>(
        &'a self,
        address: &'a str,
        cluster: Option<&'a str>,
        options: TransactionFetchOptions<'a>,
        rpc_override: Option<&'a str>,
    ) -> TransactionsFuture<'a>;
    fn prepare_send<'a>(
        &'a self,
        cluster: Option<&'a str>,
        from: Option<&'a str>,
        to: Option<&'a str>,
        value: Option<&'a str>,
        rpc_override: Option<&'a str>,
    ) -> SendPrepareFuture<'a>;
    fn send_transaction<'a>(
        &'a self,
        cluster: Option<&'a str>,
        signed_transaction: &'a str,
        rpc_override: Option<&'a str>,
    ) -> SendFuture<'a>;
}
