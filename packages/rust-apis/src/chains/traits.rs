use std::future::Future;
use std::pin::Pin;

pub struct BalanceResult {
    pub balance: String,
    pub address: String,
    pub cluster: String,
}

pub type BalanceFuture<'a> = Pin<Box<dyn Future<Output = Result<BalanceResult, String>> + 'a>>;

pub trait BlockchainAdapter {
    fn chain_name(&self) -> &'static str;
    fn get_balance<'a>(&'a self, address: &'a str, cluster: Option<&'a str>) -> BalanceFuture<'a>;
}
