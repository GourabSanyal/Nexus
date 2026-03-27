use anyhow::Result;
use serde_json::{json, Value};
use crate::models::TransactionInfo;
use wasm_bindgen_futures::JsFuture;
use wasm_bindgen::prelude::*;
use web_sys::{Request, RequestInit, Response};

#[wasm_bindgen]
extern "C" {
    // Cloudflare Workers global fetch (no `window` object)
    #[wasm_bindgen(js_name = "fetch")]
    fn global_fetch(input: &Request) -> js_sys::Promise;
}

/// Fetch Solana balance via JSON-RPC
pub async fn get_balance(address: &str, cluster_url: &str) -> Result<u64> {
    let request_body = json!({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getBalance",
        "params": [address]
    });

    let response_data = make_rpc_request(cluster_url, request_body).await?;

    let balance = response_data
        .get("result")
        .and_then(|r| r.get("value"))
        .and_then(|v| v.as_u64())
        .ok_or_else(|| anyhow::anyhow!("Failed to parse balance from response"))?;

    Ok(balance)
}

/// Fetch Solana transactions via JSON-RPC
pub async fn get_transactions(
    address: &str,
    cluster_url: &str,
    limit: Option<usize>,
) -> Result<(Vec<TransactionInfo>, bool, Option<String>)> {
    if address.is_empty() {
        return Err(anyhow::anyhow!("Address cannot be empty"));
    }
    if cluster_url.is_empty() {
        return Err(anyhow::anyhow!("Cluster URL cannot be empty"));
    }

    let effective_limit = limit.unwrap_or(20).min(100);

    let request_body = json!({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getSignaturesForAddress",
        "params": [
            address,
            {
                "limit": effective_limit + 1
            }
        ]
    });

    let response_data = make_rpc_request(cluster_url, request_body).await?;

    let signatures = response_data
        .get("result")
        .and_then(|r| r.as_array())
        .ok_or_else(|| anyhow::anyhow!("Failed to parse signatures from response"))?;

    let has_more = signatures.len() > effective_limit;
    let signatures_to_process = if has_more {
        &signatures[..effective_limit]
    } else {
        &signatures[..]
    };

    let next_cursor = if has_more && !signatures.is_empty() {
        signatures_to_process
            .last()
            .and_then(|s| s.get("signature"))
            .and_then(|s| s.as_str())
            .map(|s| s.to_string())
    } else {
        None
    };

    let mut transactions = Vec::new();

    for sig_info in signatures_to_process {
        let tx_info = parse_transaction_from_signature(sig_info);
        transactions.push(tx_info);
    }

    Ok((transactions, has_more, next_cursor))
}

/// Make a JSON-RPC request to Solana using global fetch (Cloudflare Workers compatible)
async fn make_rpc_request(cluster_url: &str, request_body: Value) -> Result<Value> {
    let opts = RequestInit::new();
    opts.set_method("POST");

    let body_str = serde_json::to_string(&request_body)?;
    opts.set_body(&JsValue::from_str(&body_str));

    let request = Request::new_with_str_and_init(cluster_url, &opts)
        .map_err(|_| anyhow::anyhow!("Failed to create request"))?;
    
    request.headers().set("Content-Type", "application/json")
        .map_err(|_| anyhow::anyhow!("Failed to set request headers"))?;

    // Use global fetch (works in Cloudflare Workers, no `window` needed)
    let resp_value = JsFuture::from(global_fetch(&request))
        .await
        .map_err(|e| anyhow::anyhow!("Fetch failed: {:?}", e))?;
    
    let resp: Response = resp_value.dyn_into()
        .map_err(|_| anyhow::anyhow!("Failed to convert response"))?;

    let text_promise = resp.text()
        .map_err(|_| anyhow::anyhow!("Failed to get response text"))?;
    
    let text_value = JsFuture::from(text_promise)
        .await
        .map_err(|_| anyhow::anyhow!("Failed to read response body"))?;
    
    let text_str = text_value.as_string()
        .ok_or_else(|| anyhow::anyhow!("Response is not a string"))?;

    let response_data: Value = serde_json::from_str(&text_str)?;

    if let Some(error) = response_data.get("error") {
        return Err(anyhow::anyhow!("RPC Error: {}", error));
    }

    Ok(response_data)
}

/// Parse transaction info from signature data
fn parse_transaction_from_signature(sig_info: &Value) -> TransactionInfo {
    let signature = sig_info
        .get("signature")
        .and_then(|s| s.as_str())
        .unwrap_or("unknown")
        .to_string();

    let slot = sig_info
        .get("slot")
        .and_then(|s| s.as_u64())
        .unwrap_or(0);

    let block_time = sig_info
        .get("blockTime")
        .and_then(|b| b.as_i64());

    let status = if sig_info.get("err").is_some() {
        "failed"
    } else {
        "success"
    };

    let confirmation_status = sig_info
        .get("confirmationStatus")
        .and_then(|c| c.as_str())
        .map(|s| s.to_string());

    TransactionInfo {
        signature,
        slot,
        block_time,
        status: status.to_string(),
        err: sig_info.get("err").cloned(),
        confirmation_status,
        amount: None,
        fee: None,
        direction: None,
        from_address: None,
        to_address: None,
        memo: sig_info
            .get("memo")
            .and_then(|m| m.as_str())
            .map(|s| s.to_string()),
    }
}
