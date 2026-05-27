//! Pagination options for `alchemy_getAssetTransfers`. `limit` is pre-clamped by the adapter.

pub struct EthFetchOptions<'a> {
    pub limit: usize,
    /// Alchemy `pageKey` — cursor to older transactions.
    pub page_key: Option<&'a str>,
    /// Stop when this tx hash is seen (incremental sync).
    pub until_hash: Option<&'a str>,
}
