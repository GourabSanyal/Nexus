use anyhow::{anyhow, Result};
use bip39::{Language, Mnemonic};
use bs58;
use ed25519_dalek::SigningKey;
use hex;
use sha3::{Digest, Keccak256};
use slip10::{derive_key_from_path, BIP32Path, Curve};
use std::str::FromStr;

pub struct DerivedWallets {
    pub solana_address: String,
    pub ethereum_address: String,
}

pub fn derive_wallets_from_mnemonic(mnemonic_str: &str) -> Result<DerivedWallets> {
    // 1. Validate mnemonic
    let mnemonic = Mnemonic::parse_in_normalized(Language::English, mnemonic_str)
        .map_err(|e| anyhow!("Invalid seed phrase: {}", e))?;

    // Validate word count (12 or 24)
    let word_count = mnemonic.word_count();
    if word_count != 12 && word_count != 24 {
        return Err(anyhow!("Seed phrase must be 12 or 24 words."));
    }

    let seed = mnemonic.to_seed("");

    // 2. Derive Solana Address (m/44'/501'/0'/0') using Ed25519 via slip10
    let sol_path = BIP32Path::from_str("m/44'/501'/0'/0'").map_err(|e| anyhow!("{:?}", e))?;
    let sol_derived = derive_key_from_path(&seed, Curve::Ed25519, &sol_path)
        .map_err(|e| anyhow!("Solana derivation error: {:?}", e))?;
    
    let sol_secret: [u8; 32] = sol_derived.key[..32].try_into()?;
    let sol_signing_key = SigningKey::from_bytes(&sol_secret);
    let sol_pubkey = sol_signing_key.verifying_key();
    let solana_address = bs58::encode(sol_pubkey.as_bytes()).into_string();

    // 3. Derive Ethereum Address (m/44'/60'/0'/0/0) using Secp256k1 via bip32
    let xprv = bip32::XPrv::derive_from_path(&seed, &"m/44'/60'/0'/0/0".parse()?)?;
    let eth_pubkey = xprv.public_key();
    
    // Ethereum uncompressed public key format
    let pubkey_bytes = eth_pubkey.public_key().to_encoded_point(false);
    
    // Ethereum address is the last 20 bytes of Keccak256 hash of the public key (excluding the 0x04 prefix)
    let mut hasher = Keccak256::new();
    hasher.update(&pubkey_bytes.as_bytes()[1..]);
    let hash = hasher.finalize();
    
    let eth_address_bytes = &hash[12..];
    let mut ethereum_address = String::with_capacity(42);
    ethereum_address.push_str("0x");
    ethereum_address.push_str(&hex::encode(eth_address_bytes));

    Ok(DerivedWallets {
        solana_address,
        ethereum_address,
    })
}
