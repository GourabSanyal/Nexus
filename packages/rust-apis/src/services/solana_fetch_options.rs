//! Cursor/until options for `getSignaturesForAddress`. `limit` is pre-clamped by the adapter.

pub struct SolanaFetchOptions<'a> {
    pub limit: usize,
    /// Solana RPC `before` — fetch older than this signature.
    pub before: Option<&'a str>,
    /// Solana RPC `until` — stop when this signature is seen.
    pub until: Option<&'a str>,
}
