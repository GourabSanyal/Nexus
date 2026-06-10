use anyhow::{anyhow, Result};

use crate::models::wallet_import::{ImportCandidate, WalletImportRequest};

use super::wallet_derivation::{
    clamp_max_accounts, enumerate_import_candidates, validate_mnemonic,
};

pub use super::wallet_derivation::DerivedCandidate;

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

/// Prefer explicit `candidates` (production); fall back to `seedPhrase` (dev).
pub fn resolve_import_candidates(request: &WalletImportRequest) -> Result<Vec<DerivedCandidate>> {
    if let Some(ref candidates) = request.candidates {
        if !candidates.is_empty() {
            return candidates.iter().map(import_candidate_to_derived).collect();
        }
    }

    match request.seed_phrase.as_deref() {
        Some(seed) if !seed.trim().is_empty() => {
            derive_import_candidates(seed.trim(), request.max_accounts)
        }
        _ => Err(anyhow!(
            "Request must include non-empty candidates or seedPhrase"
        )),
    }
}
