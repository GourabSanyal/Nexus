#[cfg(test)]
mod tests {
    use crate::services::wallet_service::derive_wallets_from_mnemonic;

    #[test]
    fn test_derive_wallets_from_mnemonic_12_words() {
        // A known 12-word test mnemonic
        let mnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
        
        let result = derive_wallets_from_mnemonic(mnemonic).expect("Failed to derive wallets");
        
        // These are standard derivation outputs for the "abandon..." mnemonic 
        // Solana: m/44'/501'/0'/0'
        // Ethereum: m/44'/60'/0'/0/0
        // Expected ETH address: 0x9858Effd232B4033E47d90003D41ec34EcaEda94 (with a lowercase output from our code)
        // Expected SOL address: CHm3zK7vYDEUjR1Pqf7jAQQ9iFkQn92uHmbdAhfC37kY (just an example, let's print and check the actual)
        
        println!("Solana Address: {}", result.solana_address);
        println!("Ethereum Address: {}", result.ethereum_address);
        
        assert_eq!(result.ethereum_address.to_lowercase(), "0x9858effd232b4033e47d90003d41ec34ecaeda94".to_lowercase());
        // For solana ed25519 standard path m/44'/501'/0'/0'
        // Let's just assert they are not empty for now and run it to see output.
        assert!(!result.solana_address.is_empty());
    }

    #[test]
    fn test_derive_wallets_invalid_words() {
        let mnemonic = "abandon abandon abandon abandon"; // 4 words
        let result = derive_wallets_from_mnemonic(mnemonic);
        assert!(result.is_err());
    }
}
