use crate::api::wallet::body::resolve_rpc_override_from_headers;
use crate::chains::transaction_options::TransactionFetchOptions;
use crate::chains::traits::BlockchainAdapter;
use crate::models::wallet_import::{balance_has_funds, NetworkImportData, WalletImportEntry};
use crate::services::wallet_derivation::DerivedCandidate;

const TX_LIMIT: usize = 10;

pub async fn scan_network(
    adapter: &dyn BlockchainAdapter,
    candidates: &[DerivedCandidate],
    chain: &str,
    cluster: &str,
    req: &web_sys::Request,
) -> NetworkImportData {
    let env_rpc = resolve_rpc_override_from_headers(req, adapter, Some(cluster));

    let mut wallets = Vec::new();
    for candidate in candidates.iter().filter(|c| c.chain == chain) {
        let tx_opts = TransactionFetchOptions {
            limit: Some(TX_LIMIT),
            cursor: None,
            until_signature: None,
        };

        let bal_res = adapter
            .get_balance(&candidate.address, Some(cluster), env_rpc.as_deref())
            .await;
        let tx_res = adapter
            .get_transactions(
                &candidate.address,
                Some(cluster),
                tx_opts,
                env_rpc.as_deref(),
            )
            .await;

        let balance = bal_res
            .map(|r| r.balance)
            .unwrap_or_else(|_| "0".to_string());
        let transactions = tx_res.map(|r| r.transactions).unwrap_or_default();
        let has_activity = balance_has_funds(&balance) || !transactions.is_empty();

        wallets.push(WalletImportEntry {
            address: candidate.address.clone(),
            derivation_path: candidate.derivation_path.clone(),
            scheme: candidate.scheme,
            account_index: candidate.account_index,
            balance,
            transactions,
            has_activity,
        });
    }

    NetworkImportData { wallets }
}
