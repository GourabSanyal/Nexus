use rust_apis::handle_request;
use serde_json::{json, Value};
use wasm_bindgen::JsValue;
use wasm_bindgen_futures::JsFuture;
use wasm_bindgen_test::*;

fn build_post_request(path: &str, payload: Value) -> web_sys::Request {
    let request_init = web_sys::RequestInit::new();
    request_init.set_method("POST");
    request_init.set_body(&JsValue::from_str(&payload.to_string()));

    let request = web_sys::Request::new_with_str_and_init(path, &request_init)
        .expect("request should be created");
    request
        .headers()
        .set("Content-Type", "application/json")
        .expect("content-type header should be set");
    request
}

async fn parse_json_body(response: web_sys::Response) -> Value {
    let body_promise = response
        .text()
        .expect("response text promise should be available");
    let body_value = JsFuture::from(body_promise)
        .await
        .expect("response text promise should resolve");
    let body = body_value
        .as_string()
        .expect("response body should be a string");
    serde_json::from_str(&body).expect("response body should be valid JSON")
}

#[wasm_bindgen_test(async)]
async fn solana_transactions_valid_address_default_limit_returns_contract_shape() {
    let request = build_post_request(
        "https://example.com/wallet/solana/transactions",
        json!({
            "address": "cBXvXnd8cUdyuNaUjdeakEWZ42Wbh5bhwpeMC5FSdRP",
            "cluster": "mainnet-beta",
            "rpcUrl": "https://api.mainnet-beta.solana.com"
        }),
    );

    let response = handle_request(request)
        .await
        .expect("request handler should return response");
    assert_eq!(
        response.status(),
        200,
        "expected 200 for valid solana tx request"
    );

    let parsed = parse_json_body(response).await;
    assert!(
        parsed
            .get("transactions")
            .and_then(Value::as_array)
            .is_some(),
        "transactions should be an array"
    );
    let pagination = parsed
        .get("pagination")
        .expect("pagination should exist in response");
    assert!(
        pagination
            .get("has_more")
            .and_then(Value::as_bool)
            .is_some(),
        "pagination.has_more should be a bool"
    );
    assert!(
        pagination.get("limit").and_then(Value::as_u64).is_some(),
        "pagination.limit should be numeric"
    );
}

#[wasm_bindgen_test(async)]
async fn solana_transactions_invalid_payload_returns_400() {
    let request = build_post_request(
        "https://example.com/wallet/solana/transactions",
        json!({
            "cluster": "mainnet-beta",
            "limit": 20
        }),
    );

    let response = handle_request(request)
        .await
        .expect("request handler should return response");
    assert_eq!(response.status(), 400, "missing address should return 400");
}

#[wasm_bindgen_test(async)]
async fn solana_transactions_unsupported_cluster_returns_400() {
    let request = build_post_request(
        "https://example.com/wallet/solana/transactions",
        json!({
            "address": "cBXvXnd8cUdyuNaUjdeakEWZ42Wbh5bhwpeMC5FSdRP",
            "cluster": "unknownnet"
        }),
    );

    let response = handle_request(request)
        .await
        .expect("request handler should return response");
    assert_eq!(
        response.status(),
        400,
        "unsupported cluster should return 400"
    );

    let parsed = parse_json_body(response).await;
    let error = parsed
        .get("error")
        .and_then(Value::as_str)
        .unwrap_or_default();
    assert!(
        error.contains("Unsupported Solana cluster"),
        "error should mention unsupported cluster"
    );
}

#[wasm_bindgen_test(async)]
async fn solana_transactions_rpc_failure_returns_500() {
    let request = build_post_request(
        "https://example.com/wallet/solana/transactions",
        json!({
            "address": "cBXvXnd8cUdyuNaUjdeakEWZ42Wbh5bhwpeMC5FSdRP",
            "cluster": "mainnet-beta",
            "rpcUrl": "http://127.0.0.1:1"
        }),
    );

    let response = handle_request(request)
        .await
        .expect("request handler should return response");
    assert_eq!(response.status(), 500, "unreachable rpc should return 500");
}

#[wasm_bindgen_test(async)]
async fn ethereum_transactions_valid_address_returns_contract_shape() {
    let request = build_post_request(
        "https://example.com/wallet/ethereum/transactions",
        json!({
            "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4",
            "cluster": "mainnet",
            "rpcUrl": "https://eth.llamarpc.com"
        }),
    );

    let response = handle_request(request)
        .await
        .expect("request handler should return response");
    assert_eq!(
        response.status(),
        200,
        "expected 200 for valid ethereum transactions request"
    );

    let parsed = parse_json_body(response).await;
    assert!(
        parsed
            .get("transactions")
            .and_then(Value::as_array)
            .is_some(),
        "transactions should be an array"
    );
    let pagination = parsed
        .get("pagination")
        .expect("pagination should exist in response");
    assert!(
        pagination
            .get("has_more")
            .and_then(Value::as_bool)
            .is_some(),
        "pagination.has_more should be a bool"
    );
    assert!(
        pagination.get("limit").and_then(Value::as_u64).is_some(),
        "pagination.limit should be numeric"
    );
}

#[wasm_bindgen_test(async)]
async fn ethereum_transactions_invalid_payload_returns_400() {
    let request = build_post_request(
        "https://example.com/wallet/ethereum/transactions",
        json!({
            "cluster": "mainnet",
            "limit": 20
        }),
    );

    let response = handle_request(request)
        .await
        .expect("request handler should return response");
    assert_eq!(response.status(), 400, "missing address should return 400");
}

#[wasm_bindgen_test(async)]
async fn ethereum_transactions_unsupported_cluster_returns_400() {
    let request = build_post_request(
        "https://example.com/wallet/ethereum/transactions",
        json!({
            "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4",
            "cluster": "goerli"
        }),
    );

    let response = handle_request(request)
        .await
        .expect("request handler should return response");
    assert_eq!(
        response.status(),
        400,
        "unsupported cluster should return 400"
    );

    let parsed = parse_json_body(response).await;
    let error = parsed
        .get("error")
        .and_then(Value::as_str)
        .unwrap_or_default();
    assert!(
        error.contains("Unsupported Ethereum cluster"),
        "error should mention unsupported cluster"
    );
}

#[wasm_bindgen_test(async)]
async fn ethereum_transactions_rpc_failure_returns_500() {
    let request = build_post_request(
        "https://example.com/wallet/ethereum/transactions",
        json!({
            "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4",
            "cluster": "mainnet",
            "rpcUrl": "http://127.0.0.1:1"
        }),
    );

    let response = handle_request(request)
        .await
        .expect("request handler should return response");
    assert_eq!(response.status(), 500, "unreachable rpc should return 500");

    let parsed = parse_json_body(response).await;
    let error = parsed
        .get("error")
        .and_then(Value::as_str)
        .unwrap_or_default();
    assert!(
        !error.is_empty(),
        "rpc failure should include error message"
    );
}

#[wasm_bindgen_test(async)]
async fn solana_send_prepare_unsupported_cluster_returns_400() {
    let request = build_post_request(
        "https://example.com/wallet/solana/send/prepare",
        json!({
            "address": "cBXvXnd8cUdyuNaUjdeakEWZ42Wbh5bhwpeMC5FSdRP",
            "cluster": "unknownnet"
        }),
    );

    let response = handle_request(request)
        .await
        .expect("request handler should return response");
    assert_eq!(
        response.status(),
        400,
        "unsupported cluster should return 400"
    );
}

#[wasm_bindgen_test(async)]
async fn solana_send_prepare_rpc_failure_returns_500() {
    let request = build_post_request(
        "https://example.com/wallet/solana/send/prepare",
        json!({
            "address": "cBXvXnd8cUdyuNaUjdeakEWZ42Wbh5bhwpeMC5FSdRP",
            "cluster": "mainnet-beta",
            "rpcUrl": "http://127.0.0.1:1"
        }),
    );

    let response = handle_request(request)
        .await
        .expect("request handler should return response");
    assert_eq!(response.status(), 500, "unreachable rpc should return 500");

    let parsed = parse_json_body(response).await;
    let error = parsed
        .get("error")
        .and_then(Value::as_str)
        .unwrap_or_default();
    assert!(
        !error.is_empty(),
        "rpc failure should include error message"
    );
}

#[wasm_bindgen_test(async)]
async fn solana_send_missing_signed_transaction_returns_400() {
    let request = build_post_request(
        "https://example.com/wallet/solana/send",
        json!({
            "cluster": "mainnet-beta"
        }),
    );

    let response = handle_request(request)
        .await
        .expect("request handler should return response");
    assert_eq!(
        response.status(),
        400,
        "signedTransaction is required for send route"
    );
}

#[wasm_bindgen_test(async)]
async fn ethereum_send_prepare_unsupported_cluster_returns_400() {
    let request = build_post_request(
        "https://example.com/wallet/ethereum/send/prepare",
        json!({
            "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4",
            "cluster": "goerli",
            "to": "0x1111111111111111111111111111111111111111",
            "value": "0x2386f26fc10000"
        }),
    );

    let response = handle_request(request)
        .await
        .expect("request handler should return response");
    assert_eq!(
        response.status(),
        400,
        "unsupported cluster should return 400"
    );
}

#[wasm_bindgen_test(async)]
async fn ethereum_send_prepare_rpc_failure_returns_500() {
    let request = build_post_request(
        "https://example.com/wallet/ethereum/send/prepare",
        json!({
            "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4",
            "cluster": "mainnet",
            "to": "0x1111111111111111111111111111111111111111",
            "value": "0x2386f26fc10000",
            "rpcUrl": "http://127.0.0.1:1"
        }),
    );

    let response = handle_request(request)
        .await
        .expect("request handler should return response");
    assert_eq!(response.status(), 500, "unreachable rpc should return 500");
}

#[wasm_bindgen_test(async)]
async fn ethereum_send_missing_signed_transaction_returns_400() {
    let request = build_post_request(
        "https://example.com/wallet/ethereum/send",
        json!({
            "cluster": "mainnet"
        }),
    );

    let response = handle_request(request)
        .await
        .expect("request handler should return response");
    assert_eq!(
        response.status(),
        400,
        "signedTransaction is required for send route"
    );
}

#[wasm_bindgen_test(async)]
async fn ethereum_send_rpc_failure_returns_500() {
    let request = build_post_request(
        "https://example.com/wallet/ethereum/send",
        json!({
            "cluster": "mainnet",
            "signedTransaction": "0xdeadbeef",
            "rpcUrl": "http://127.0.0.1:1"
        }),
    );

    let response = handle_request(request)
        .await
        .expect("request handler should return response");
    assert_eq!(response.status(), 500, "unreachable rpc should return 500");
}
