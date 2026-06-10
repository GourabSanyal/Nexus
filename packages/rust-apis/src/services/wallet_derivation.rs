use crate::models::wallet_import::DerivationScheme;
use anyhow::{anyhow, Result};
use bip39::{Language, Mnemonic};
use bs58;
use ed25519_dalek::SigningKey;
use hex;
use sha3::{Digest, Keccak256};
use slip10::{derive_key_from_path, BIP32Path, Curve};
use std::collections::HashSet;
use std::str::FromStr;

pub const DEFAULT_MAX_ACCOUNTS: u32 = 5;
pub const MAX_ACCOUNTS_CAP: u32 = 10;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DerivedCandidate {
    pub chain: &'static str,
    pub address: String,
    pub derivation_path: String,
    pub scheme: DerivationScheme,
    pub account_index: u32,
}

pub fn validate_mnemonic(mnemonic_str: &str) -> Result<[u8; 64]> {
    let mnemonic = Mnemonic::parse_in_normalized(Language::English, mnemonic_str)
        .map_err(|e| anyhow!("Invalid seed phrase: {}", e))?;

    let word_count = mnemonic.word_count();
    if word_count != 12 && word_count != 24 {
        return Err(anyhow!("Seed phrase must be 12 or 24 words."));
    }

    Ok(mnemonic.to_seed(""))
}

pub fn clamp_max_accounts(max_accounts: Option<u32>) -> u32 {
    max_accounts
        .unwrap_or(DEFAULT_MAX_ACCOUNTS)
        .clamp(1, MAX_ACCOUNTS_CAP)
}

pub fn enumerate_import_candidates(seed: &[u8], max_accounts: u32) -> Vec<DerivedCandidate> {
    let mut seen = HashSet::new();
    let mut out = Vec::new();

    let mut push = |candidate: DerivedCandidate| {
        let key = (candidate.chain, candidate.address.clone());
        if seen.insert(key) {
            out.push(candidate);
        }
    };

    for account_index in 0..max_accounts {
        let sol_path = format!("m/44'/501'/{}'/0'", account_index);
        if let Ok(address) = derive_solana_address(seed, &sol_path) {
            push(DerivedCandidate {
                chain: "solana",
                address,
                derivation_path: sol_path,
                scheme: DerivationScheme::Standard,
                account_index,
            });
        }

        let eth_standard = format!("m/44'/60'/{}'/0/0", account_index);
        if let Ok(address) = derive_ethereum_address(seed, &eth_standard) {
            push(DerivedCandidate {
                chain: "ethereum",
                address,
                derivation_path: eth_standard,
                scheme: DerivationScheme::Standard,
                account_index,
            });
        }

        let eth_nexus = format!("m/44'/60'/{}'/0'", account_index);
        if let Ok(address) = derive_ethereum_address(seed, &eth_nexus) {
            push(DerivedCandidate {
                chain: "ethereum",
                address,
                derivation_path: eth_nexus,
                scheme: DerivationScheme::Nexus,
                account_index,
            });
        }
    }

    let legacy_sol = "m/44'/501'/0'";
    if let Ok(address) = derive_solana_address(seed, legacy_sol) {
        push(DerivedCandidate {
            chain: "solana",
            address,
            derivation_path: legacy_sol.to_string(),
            scheme: DerivationScheme::NexusLegacy,
            account_index: 0,
        });
    }

    let legacy_eth = "m/44'/60'/60'/0'";
    if let Ok(address) = derive_ethereum_address(seed, legacy_eth) {
        push(DerivedCandidate {
            chain: "ethereum",
            address,
            derivation_path: legacy_eth.to_string(),
            scheme: DerivationScheme::NexusLegacy,
            account_index: 0,
        });
    }

    out
}

pub fn derive_solana_address(seed: &[u8], path: &str) -> Result<String> {
    let sol_path = BIP32Path::from_str(path).map_err(|e| anyhow!("{:?}", e))?;
    let sol_derived = derive_key_from_path(seed, Curve::Ed25519, &sol_path)
        .map_err(|e| anyhow!("Solana derivation error: {:?}", e))?;

    let sol_secret: [u8; 32] = sol_derived.key[..32].try_into()?;
    let sol_signing_key = SigningKey::from_bytes(&sol_secret);
    let sol_pubkey = sol_signing_key.verifying_key();
    Ok(bs58::encode(sol_pubkey.as_bytes()).into_string())
}

pub fn derive_ethereum_address(seed: &[u8], path: &str) -> Result<String> {
    let xprv = bip32::XPrv::derive_from_path(seed, &path.parse()?)?;
    let eth_pubkey = xprv.public_key();
    let pubkey_bytes = eth_pubkey.public_key().to_encoded_point(false);

    let mut hasher = Keccak256::new();
    hasher.update(&pubkey_bytes.as_bytes()[1..]);
    let hash = hasher.finalize();

    Ok(format!("0x{}", hex::encode(&hash[12..])))
}
