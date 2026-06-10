#[cfg(test)]
mod tests {
    use crate::services::wallet_service::derive_import_candidates;

    #[test]
    fn test_derive_import_candidates_default_max_accounts() {
        let mnemonic =
            "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
        let candidates = derive_import_candidates(mnemonic, None).expect("valid mnemonic");
        assert!(candidates.iter().any(|c| c.chain == "solana"));
        assert!(candidates.iter().any(|c| c.chain == "ethereum"));
    }

    #[test]
    fn test_derive_import_candidates_invalid_words() {
        let result = derive_import_candidates("abandon abandon abandon abandon", None);
        assert!(result.is_err());
    }
}
