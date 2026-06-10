#[cfg(test)]
mod tests {
    use crate::models::wallet_import::{
        DerivationScheme, ImportCandidate, ImportChain, WalletImportRequest,
    };
    use crate::services::wallet_service::{derive_import_candidates, resolve_import_candidates};

    #[test]
    fn test_resolve_import_candidates_from_seed_phrase() {
        let request: WalletImportRequest = serde_json::from_str(
            r#"{"seedPhrase":"athlete reason combine sponsor verb clay ghost melt art invest often saddle","maxAccounts":2}"#,
        )
        .expect("valid seed request");

        let candidates = resolve_import_candidates(&request).expect("seed mode");
        assert!(candidates.iter().any(|c| c.chain == "solana"));
        assert!(candidates.iter().any(|c| c.chain == "ethereum"));
    }

    #[test]
    fn test_resolve_import_candidates_from_explicit_candidates() {
        let request: WalletImportRequest = serde_json::from_str(
            r#"{"candidates":[{"chain":"solana","address":"GoXSRkGKExFuWgtfXdpyyfRsvsuFQurrzgqgXbxNpxup","derivationPath":"m/44'/501'/1'/0'","scheme":"standard","accountIndex":1}]}"#,
        )
        .expect("valid candidates request");

        let candidates = resolve_import_candidates(&request).expect("candidates mode");
        assert_eq!(candidates.len(), 1);
        assert_eq!(candidates[0].chain, "solana");
        assert_eq!(candidates[0].scheme, DerivationScheme::Standard);
        assert_eq!(candidates[0].account_index, 1);
    }

    #[test]
    fn test_resolve_import_candidates_prefers_candidates_over_seed() {
        let request = WalletImportRequest {
            candidates: Some(vec![ImportCandidate {
                chain: ImportChain::Ethereum,
                address: "0xabc".to_string(),
                derivation_path: "m/44'/60'/0'/0/0".to_string(),
                scheme: DerivationScheme::Standard,
                account_index: 0,
            }]),
            seed_phrase: Some(
                "athlete reason combine sponsor verb clay ghost melt art invest often saddle"
                    .to_string(),
            ),
            max_accounts: None,
        };

        let candidates = resolve_import_candidates(&request).expect("prefer candidates");
        assert_eq!(candidates.len(), 1);
        assert_eq!(candidates[0].chain, "ethereum");
    }

    #[test]
    fn test_resolve_import_candidates_rejects_empty_payload() {
        let request: WalletImportRequest =
            serde_json::from_str("{}").expect("empty object deserializes");
        assert!(resolve_import_candidates(&request).is_err());
    }

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
