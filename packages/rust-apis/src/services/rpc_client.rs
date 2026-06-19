use anyhow::Result;
use serde_json::{json, Value};
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use wasm_bindgen_futures::JsFuture;
use web_sys::{Request, RequestInit, Response};

/// Per-fetch timeout in milliseconds. Prevents hanging RPC calls from blocking
/// the entire request (e.g. unreliable devnet endpoints).
const FETCH_TIMEOUT_MS: u32 = 10_000;

pub async fn make_rpc_request(rpc_url: &str, request_body: Value) -> Result<Value> {
    let request = build_request(rpc_url, request_body)?;
    let response_text = execute_fetch(request).await?;
    let response_data: Value = serde_json::from_str(&response_text)?;

    if let Some(error) = response_data.get("error") {
        return Err(anyhow::anyhow!("RPC Error: {}", error));
    }

    Ok(response_data)
}

/// JSON-RPC 2.0 envelope helper: builds the request, returns `result` (or errors).
pub async fn json_rpc_call(rpc_url: &str, method: &str, params: Value) -> Result<Value> {
    let body = json!({"id": 1, "jsonrpc": "2.0", "method": method, "params": params});
    let data = make_rpc_request(rpc_url, body).await?;
    data.get("result")
        .cloned()
        .ok_or_else(|| anyhow::anyhow!("Missing result for {method}"))
}

/// Attach an `AbortSignal.timeout()` to the fetch so hanging RPCs don't block forever.
fn attach_abort_timeout(opts: &RequestInit, timeout_ms: u32) {
    let Ok(abort_signal_class) =
        js_sys::Reflect::get(&js_sys::global(), &"AbortSignal".into())
    else {
        return;
    };

    let Ok(timeout_fn) = js_sys::Reflect::get(&abort_signal_class, &"timeout".into()) else {
        return;
    };

    let Ok(timeout_fn) = timeout_fn.dyn_into::<js_sys::Function>() else {
        return;
    };

    if let Ok(signal) = timeout_fn.call1(&abort_signal_class, &timeout_ms.into()) {
        let _ = js_sys::Reflect::set(opts, &"signal".into(), &signal);
    }
}

fn build_request(rpc_url: &str, request_body: Value) -> Result<Request> {
    let opts = RequestInit::new();
    opts.set_method("POST");
    opts.set_mode(web_sys::RequestMode::Cors);

    attach_abort_timeout(&opts, FETCH_TIMEOUT_MS);

    let body_str = serde_json::to_string(&request_body)?;
    opts.set_body(&JsValue::from_str(&body_str));

    let request = Request::new_with_str_and_init(rpc_url, &opts)
        .map_err(|_| anyhow::anyhow!("Failed to create request"))?;

    request
        .headers()
        .set("Content-Type", "application/json")
        .map_err(|_| anyhow::anyhow!("Failed to set request headers"))?;

    Ok(request)
}

async fn execute_fetch(request: Request) -> Result<String> {
    let global = js_sys::global();
    let fetch_value = js_sys::Reflect::get(&global, &"fetch".into())
        .map_err(|_| anyhow::anyhow!("Global fetch not found"))?;
    let fetch_func: js_sys::Function = fetch_value
        .dyn_into()
        .map_err(|_| anyhow::anyhow!("'fetch' is not a function"))?;

    let resp_promise: js_sys::Promise = fetch_func
        .call1(&global, &request)
        .map_err(|_| anyhow::anyhow!("Failed to call fetch"))?
        .dyn_into()
        .map_err(|_| anyhow::anyhow!("fetch did not return a promise"))?;

    let resp_value = JsFuture::from(resp_promise)
        .await
        .map_err(|e| {
            let msg = e
                .as_string()
                .or_else(|| js_sys::Reflect::get(&e, &"message".into()).ok()?.as_string())
                .unwrap_or_else(|| format!("{e:?}"));
            anyhow::anyhow!("Fetch failed: {msg}")
        })?;
    let resp: Response = resp_value
        .dyn_into()
        .map_err(|_| anyhow::anyhow!("Failed to convert response"))?;

    let text_promise = resp
        .text()
        .map_err(|_| anyhow::anyhow!("Failed to get response text"))?;
    let text_value = JsFuture::from(text_promise)
        .await
        .map_err(|_| anyhow::anyhow!("Failed to read response body"))?;

    text_value
        .as_string()
        .ok_or_else(|| anyhow::anyhow!("Response is not a string"))
}
