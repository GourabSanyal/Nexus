#[cfg(test)]
mod tests {
    use crate::models::wallet_import::DerivationScheme;
    use crate::services::wallet_derivation::{
        derive_ethereum_address, derive_solana_address, enumerate_import_candidates,
        validate_mnemonic,
    };

    const ATHLETE_MNEMONIC: &str =
        "athlete reason combine sponsor verb clay ghost melt art invest often saddle";

    fn seed_from(mnemonic: &str) -> [u8; 64] {
        validate_mnemonic(mnemonic).expect("valid mnemonic")
    }

    #[test]
    fn test_validate_12_and_24_word_mnemonics() {
        validate_mnemonic(ATHLETE_MNEMONIC).expect("12 words");
        let twenty_four = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art";
        validate_mnemonic(twenty_four).expect("24 words");
    }

    #[test]
    fn test_validate_rejects_invalid_word_count() {
        assert!(validate_mnemonic("abandon abandon abandon abandon").is_err());
    }

    #[test]
    fn test_standard_paths_for_abandon_mnemonic() {
        let seed = seed_from(
            "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
        );

        let sol = derive_solana_address(&seed, "m/44'/501'/0'/0'").unwrap();
        assert_eq!(sol, "HAgk14JpMQLgt6rVgv7cBQFJWFto5Dqxi472uT3DKpqk");

        let eth = derive_ethereum_address(&seed, "m/44'/60'/0'/0/0").unwrap();
        assert_eq!(
            eth.to_lowercase(),
            "0x9858effd232b4033e47d90003d41ec34ecaeda94"
        );
    }

    #[test]
    fn test_athlete_mnemonic_legacy_and_nexus_wallets() {
        let seed = seed_from(ATHLETE_MNEMONIC);

        assert_eq!(
            derive_solana_address(&seed, "m/44'/501'/0'").unwrap(),
            "cBXvXnd8cUdyuNaUjdeakEWZ42Wbh5bhwpeMC5FSdRP"
        );
        assert_eq!(
            derive_solana_address(&seed, "m/44'/501'/1'/0'").unwrap(),
            "GoXSRkGKExFuWgtfXdpyyfRsvsuFQurrzgqgXbxNpxup"
        );
        assert_eq!(
            derive_solana_address(&seed, "m/44'/501'/2'/0'").unwrap(),
            "dkb3ys3ocBJgHTkhVEiF5NNtHx51u16GFY83GKmfD7T"
        );

        assert_eq!(
            derive_ethereum_address(&seed, "m/44'/60'/60'/0'").unwrap(),
            "0x6541493a00fa13418e9ed7c2f52b93bd32b91942"
        );
        assert_eq!(
            derive_ethereum_address(&seed, "m/44'/60'/1'/0'").unwrap(),
            "0x8614a0de99c7da55479e9812c6589e9faaa13db5"
        );
        assert_eq!(
            derive_ethereum_address(&seed, "m/44'/60'/2'/0'").unwrap(),
            "0x9bff4de8054082446597111f79f29b13d33877c9"
        );
    }

    #[test]
    fn test_enumerate_import_candidates_includes_all_schemes() {
        let seed = seed_from(ATHLETE_MNEMONIC);
        let candidates = enumerate_import_candidates(&seed, 3);

        let legacy_sol = candidates
            .iter()
            .find(|c| c.scheme == DerivationScheme::NexusLegacy && c.chain == "solana")
            .expect("legacy sol");
        assert_eq!(legacy_sol.address, "cBXvXnd8cUdyuNaUjdeakEWZ42Wbh5bhwpeMC5FSdRP");

        let nexus_eth: Vec<_> = candidates
            .iter()
            .filter(|c| c.scheme == DerivationScheme::Nexus && c.chain == "ethereum")
            .collect();
        assert_eq!(nexus_eth.len(), 3);

        let standard_eth: Vec<_> = candidates
            .iter()
            .filter(|c| c.scheme == DerivationScheme::Standard && c.chain == "ethereum")
            .collect();
        assert_eq!(standard_eth.len(), 3);
    }
}
