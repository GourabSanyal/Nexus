//! `getSignaturesForAddress` listing + pagination window. Hands off to `details` for enrichment.

use anyhow::Result;
use serde_json::{json, Value};

use crate::models::transaction::TransactionInfo;
use crate::services::rpc_client::make_rpc_request;
use crate::services::solana_fetch_options::SolanaFetchOptions;

use super::details::build_transactions;
use super::parser::signature_from_signature_item;

pub async fn get_transactions(
    address: &str,
    cluster_url: &str,
    options: SolanaFetchOptions<'_>,
) -> Result<(Vec<TransactionInfo>, bool, Option<String>)> {
    validate_input(address, cluster_url)?;

    let request_body =
        signatures_request_body(address, options.limit + 1, options.before, options.until);
    let response_data = make_rpc_request(cluster_url, request_body).await?;

    let signatures = extract_signatures(&response_data)?;
    let filtered = filter_until_signature(signatures, options.until);
    let (window, has_more) = signatures_window(filtered, options.limit);

    let next_cursor = window.last().and_then(|s| signature_from_signature_item(s));
    let owned_sigs: Vec<Value> = window.iter().map(|v| (*v).clone()).collect();
    let transactions = build_transactions(&owned_sigs, cluster_url, address).await;

    Ok((transactions, has_more, next_cursor))
}

fn validate_input(address: &str, cluster_url: &str) -> Result<()> {
    if address.is_empty() {
        return Err(anyhow::anyhow!("Address cannot be empty"));
    }
    if cluster_url.is_empty() {
        return Err(anyhow::anyhow!("Cluster URL cannot be empty"));
    }
    Ok(())
}

fn signatures_request_body(
    address: &str,
    limit: usize,
    before: Option<&str>,
    until: Option<&str>,
) -> Value {
    let mut params = json!({ "limit": limit });
    if let Some(before_sig) = before {
        params["before"] = json!(before_sig);
    }
    if let Some(until_sig) = until {
        params["until"] = json!(until_sig);
    }
    json!({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getSignaturesForAddress",
        "params": [address, params]
    })
}

fn extract_signatures(response_data: &Value) -> Result<&Vec<Value>> {
    response_data
        .get("result")
        .and_then(|r| r.as_array())
        .ok_or_else(|| anyhow::anyhow!("Failed to parse signatures from response"))
}

/// Stop before `until_signature` if provided, else pass through.
fn filter_until_signature<'a>(
    signatures: &'a [Value],
    until_signature: Option<&str>,
) -> Vec<&'a Value> {
    match until_signature {
        Some(until) => signatures
            .iter()
            .take_while(|sig| {
                sig.get("signature")
                    .and_then(|s| s.as_str())
                    .map(|s| s != until)
                    .unwrap_or(true)
            })
            .collect(),
        None => signatures.iter().collect(),
    }
}

/// Trim to `limit` items; flag whether more pages exist.
fn signatures_window(signatures: Vec<&Value>, limit: usize) -> (Vec<&Value>, bool) {
    if signatures.len() > limit {
        let mut truncated = signatures;
        truncated.truncate(limit);
        (truncated, true)
    } else {
        let has_more = signatures.len() == limit + 1;
        (signatures, has_more)
    }
}
