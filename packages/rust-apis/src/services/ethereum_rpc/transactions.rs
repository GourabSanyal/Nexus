//! Transfer listing via `alchemy_getAssetTransfers`. Fetches sent+received, merges, hands off to `parser`.

use anyhow::Result;
use serde_json::{json, Value};

use crate::models::transaction::TransactionInfo;
use crate::services::ethereum_fetch_options::EthFetchOptions;
use crate::services::rpc_client::json_rpc_call;

use super::parser::{block_num, map_transaction};

const CATEGORIES: [&str; 4] = ["external", "erc20", "erc721", "erc1155"];

pub async fn get_transactions(
    address: &str,
    rpc_url: &str,
    options: EthFetchOptions<'_>,
) -> Result<(Vec<TransactionInfo>, bool, Option<String>)> {
    let max = options.limit;
    let (txs, page_key) =
        fetch_and_merge_transfers(rpc_url, address, max, options.page_key).await?;

    let filtered_txs = filter_until_hash(txs, options.until_hash);

    let out: Vec<TransactionInfo> = filtered_txs
        .iter()
        .take(max)
        .map(|t| map_transaction(t, address))
        .collect();

    let has_more = filtered_txs.len() > max || page_key.is_some();
    let next_cursor = page_key.or_else(|| out.last().map(|t| t.signature.clone()));
    Ok((out, has_more, next_cursor))
}

fn filter_until_hash(txs: Vec<Value>, until_hash: Option<&str>) -> Vec<Value> {
    let Some(until) = until_hash else {
        return txs;
    };
    let until_lower = until.to_lowercase();
    txs.into_iter()
        .take_while(|t| {
            t.get("hash")
                .and_then(|h| h.as_str())
                .map(|h| h.to_lowercase() != until_lower)
                .unwrap_or(true)
        })
        .collect()
}

async fn fetch_and_merge_transfers(
    rpc_url: &str,
    address: &str,
    max: usize,
    page_key: Option<&str>,
) -> Result<(Vec<Value>, Option<String>)> {
    let max_hex = format!("0x{:x}", max);
    let sent_params = transfers_params("fromAddress", address, &max_hex, page_key);
    let recv_params = transfers_params("toAddress", address, &max_hex, page_key);

    let (sent, sent_page_key) = fetch_transfers(rpc_url, sent_params).await?;
    let (recv, recv_page_key) = fetch_transfers(rpc_url, recv_params).await?;

    let txs = merge_and_sort_desc(sent, recv);
    Ok((txs, sent_page_key.or(recv_page_key)))
}

fn transfers_params(
    direction_field: &str,
    address: &str,
    max_hex: &str,
    page_key: Option<&str>,
) -> Value {
    let mut params = json!({
        "fromBlock": "0x0",
        direction_field: address,
        "category": CATEGORIES,
        "withMetadata": true,
        "maxCount": max_hex,
        "order": "desc",
    });
    if let Some(pk) = page_key {
        params["pageKey"] = json!(pk);
    }
    params
}

async fn fetch_transfers(rpc_url: &str, params: Value) -> Result<(Vec<Value>, Option<String>)> {
    let data = json_rpc_call(rpc_url, "alchemy_getAssetTransfers", json!([params])).await?;
    let transfers = data
        .get("transfers")
        .and_then(|v| v.as_array())
        .cloned()
        .unwrap_or_default();
    let page_key = data
        .get("pageKey")
        .and_then(|v| v.as_str())
        .map(|s| s.to_string());
    Ok((transfers, page_key))
}

fn merge_and_sort_desc(sent: Vec<Value>, recv: Vec<Value>) -> Vec<Value> {
    let mut map = std::collections::BTreeMap::new();
    for t in sent.into_iter().chain(recv.into_iter()) {
        if let Some(h) = t.get("hash").and_then(|x| x.as_str()) {
            map.insert(h.to_lowercase(), t);
        }
    }
    let mut txs: Vec<Value> = map.into_values().collect();
    txs.sort_by_key(|t| std::cmp::Reverse(block_num(t)));
    txs
}
