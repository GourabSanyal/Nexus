use anyhow::{anyhow, Result};

use crate::models::wallet_import::{ImportCandidate, WalletImportRequest};

use super::wallet_derivation::{
    clamp_max_accounts, enumerate_import_candidates, validate_mnemonic,
};

pub use super::wallet_derivation::DerivedCandidate;

/// Parity unit tests only; production API accepts pre-derived `candidates`.
#[allow(dead_code)]
pub fn derive_import_candidates(
    mnemonic_str: &str,
    max_accounts: Option<u32>,
) -> Result<Vec<DerivedCandidate>> {
    let seed = validate_mnemonic(mnemonic_str)?;
    let max_accounts = clamp_max_accounts(max_accounts);
    Ok(enumerate_import_candidates(&seed, max_accounts))
}

fn import_candidate_to_derived(candidate: &ImportCandidate) -> Result<DerivedCandidate> {
    Ok(DerivedCandidate {
        chain: candidate.chain.as_str(),
        address: candidate.address.clone(),
        derivation_path: candidate.derivation_path.clone(),
        scheme: candidate.scheme,
        account_index: candidate.account_index,
    })
}

pub fn resolve_import_candidates(request: &WalletImportRequest) -> Result<Vec<DerivedCandidate>> {
    if request.candidates.is_empty() {
        return Err(anyhow!("Request must include non-empty candidates"));
    }

    request
        .candidates
        .iter()
        .map(import_candidate_to_derived)
        .collect()
}
