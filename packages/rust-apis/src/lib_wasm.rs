mod api;
mod config;
mod error;
mod handlers;
mod models;
mod services;

use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::JsFuture;
use serde_json::json;

#[wasm_bindgen]
pub async fn handle_request(req: web_sys::Request) -> Result<web_sys::Response, JsValue> {
    let method = req.method();
    let path = req.url();

    // Parse path from URL
    let url_parts: Vec<&str> = path.split('/').collect();
    let path_segment = if url_parts.len() > 3 {
        url_parts[3..].join("/")
    } else {
        String::new()
    };

    // Create CORS headers
    let mut headers = web_sys::Headers::new().map_err(|_| "Failed to create headers")?;
    headers.set("Access-Control-Allow-Origin", "*").ok();
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS").ok();
    headers.set("Access-Control-Allow-Headers", "Content-Type").ok();
    headers.set("Content-Type", "application/json").ok();

    // Handle CORS preflight
    if method == "OPTIONS" {
        let response = web_sys::Response::new_with_opt_str_and_init(
            Some(""),
            {
                let mut init = web_sys::ResponseInit::new();
                init.status(200).headers(&headers);
                &init
            },
        ).map_err(|_| "Failed to create response")?;
        return Ok(response);
    }

    let response_body = match (method.as_str(), path_segment.as_str()) {
        ("GET", "") => {
            json!({"message": "Hello from Cloudflare Worker - Rust APIs"}).to_string()
        }
        ("GET", "health") => {
            json!({
                "status": "ok",
                "service": "rust-apis",
                "timestamp": js_sys::Date::now() as u64,
            }).to_string()
        }
        ("POST", "wallet/solana/balance") => {
            match req.text().await {
                Ok(body_promise) => {
                    match JsFuture::from(body_promise).await {
                        Ok(body_val) => {
                            if let Some(body_str) = body_val.as_string() {
                                // Handle balance request
                                json!({"error": "Balance endpoint requires environment setup"}).to_string()
                            } else {
                                json!({"error": "Invalid request body"}).to_string()
                            }
                        }
                        Err(_) => {
                            json!({"error": "Failed to read request body"}).to_string()
                        }
                    }
                }
                Err(_) => {
                    json!({"error": "Failed to get request text"}).to_string()
                }
            }
        }
        ("POST", "wallet/solana/transactions") => {
            json!({"error": "Transactions endpoint requires environment setup"}).to_string()
        }
        _ => {
            json!({"error": "Not Found"}).to_string()
        }
    };

    let response = web_sys::Response::new_with_opt_str_and_init(
        Some(&response_body),
        {
            let mut init = web_sys::ResponseInit::new();
            init.status(200).headers(&headers);
            &init
        },
    ).map_err(|_| "Failed to create response")?;

    Ok(response)
}

#[wasm_bindgen]
pub fn init_panic_hook() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}
