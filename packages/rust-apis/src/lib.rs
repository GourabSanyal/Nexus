//! Crate entry point: HTTP handler + panic hook. Plumbing in `worker::*`, JS exports in `wasm_exports`.

mod api;
mod chains;
mod config;
mod handlers;
mod models;
mod services;
mod wasm_exports;
mod worker;

use wasm_bindgen::prelude::*;

use crate::worker::http::{
    build_json_headers, extract_path_segment, make_response, read_cors_origin,
};
use crate::worker::routes::route_request;

#[wasm_bindgen]
pub async fn handle_request(req: web_sys::Request) -> Result<web_sys::Response, JsValue> {
    let method = req.method();
    let path = req.url();
    let cors_origin = read_cors_origin(&req);
    let path_segment = extract_path_segment(&path);
    let headers = build_json_headers(&cors_origin)?;

    if method == "OPTIONS" {
        return make_response(200, "", &headers);
    }

    let (status, response_body) = route_request(&req, &method, &path_segment).await;
    make_response(status, &response_body, &headers)
}

#[wasm_bindgen]
pub fn init_panic_hook() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}
