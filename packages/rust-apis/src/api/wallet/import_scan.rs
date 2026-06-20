use crate::api::wallet::body::resolve_rpc_override_from_headers;
use crate::chains::traits::BlockchainAdapter;
use crate::models::wallet_import::{balance_has_funds, NetworkImportData, WalletImportEntry};
use crate::services::wallet_derivation::DerivedCandidate;

/// Scan a network for wallet balances using batch RPC calls.
/// Transactions are NOT fetched during import to stay under Cloudflare's 50 subrequest limit.
/// This allows scanning 100+ wallets with only 1 subrequest per network.
/// Transactions can be fetched lazily when viewing individual wallets.
pub async fn scan_network(
    adapter: &dyn BlockchainAdapter,
    candidates: &[DerivedCandidate],
    chain: &str,
    cluster: &str,
    req: &web_sys::Request,
) -> NetworkImportData {
    let env_rpc = resolve_rpc_override_from_headers(req, adapter, Some(cluster));

    // Filter candidates for this chain
    let chain_candidates: Vec<_> = candidates.iter().filter(|c| c.chain == chain).collect();

    if chain_candidates.is_empty() {
        return NetworkImportData { wallets: vec![] };
    }

    // Batch fetch all balances in a single RPC call (reduces subrequests dramatically)
    // This allows scanning 100+ wallets with only 1 HTTP request per network
    let addresses: Vec<&str> = chain_candidates.iter().map(|c| c.address.as_str()).collect();
    let balances = adapter
        .get_balances_batch(&addresses, Some(cluster), env_rpc.as_deref())
        .await
        .unwrap_or_default();

    let mut wallets = Vec::new();
    for candidate in chain_candidates {
        let balance = balances
            .get(&candidate.address)
            .cloned()
            .unwrap_or_else(|| "0".to_string());

        // Skip transaction fetching during import to stay under Cloudflare's 50 subrequest limit.
        // Transactions can be fetched lazily via /wallet/transactions endpoint when needed.
        let has_activity = balance_has_funds(&balance);

        wallets.push(WalletImportEntry {
            address: candidate.address.clone(),
            derivation_path: candidate.derivation_path.clone(),
            scheme: candidate.scheme,
            account_index: candidate.account_index,
            balance,
            transactions: vec![],
            has_activity,
        });
    }

    NetworkImportData { wallets }
}
