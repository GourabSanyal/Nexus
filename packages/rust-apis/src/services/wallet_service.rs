use anyhow::Result;

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
