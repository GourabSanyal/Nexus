//! Shared cursor-based fetch options for transaction listing.

pub const DEFAULT_TX_LIMIT: usize = 20;
/// Cap below provider ceilings (Solana/Alchemy ~1000) to bound enrichment cost.
pub const MAX_TX_LIMIT: usize = 100;

pub struct TransactionFetchOptions<'a> {
    pub limit: Option<usize>,
    /// "Load more" — fetch older than this signature.
    pub cursor: Option<&'a str>,
    /// Incremental sync — stop when this signature is seen.
    pub until_signature: Option<&'a str>,
}

impl<'a> TransactionFetchOptions<'a> {
    /// Clamp `limit` to `[1, MAX_TX_LIMIT]`, default `DEFAULT_TX_LIMIT`.
    pub fn effective_limit(&self) -> usize {
        self.limit.unwrap_or(DEFAULT_TX_LIMIT).min(MAX_TX_LIMIT)
    }
}
