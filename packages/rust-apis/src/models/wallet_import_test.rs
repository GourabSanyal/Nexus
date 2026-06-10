#[cfg(test)]
mod tests {
    use crate::models::wallet_import::balance_has_funds;

    #[test]
    fn test_balance_has_funds() {
        assert!(!balance_has_funds("0"));
        assert!(!balance_has_funds("0x0"));
        assert!(balance_has_funds("274067121"));
        assert!(balance_has_funds("0x1"));
    }
}
