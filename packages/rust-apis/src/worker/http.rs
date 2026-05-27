//! CORS, path parsing, header builder, response constructor.

use wasm_bindgen::JsValue;

pub fn read_cors_origin(req: &web_sys::Request) -> String {
    req.headers()
        .get("x-cors-origin")
        .ok()
        .flatten()
        .filter(|value| !value.trim().is_empty())
        .unwrap_or_else(|| "*".to_string())
}

pub fn extract_path_segment(path: &str) -> String {
    let url_parts: Vec<&str> = path.split('/').collect();
    if url_parts.len() > 3 {
        url_parts[3..].join("/")
    } else {
        String::new()
    }
}

pub fn build_json_headers(cors_origin: &str) -> Result<web_sys::Headers, JsValue> {
    let headers = web_sys::Headers::new().map_err(|_| "Failed to create headers")?;
    headers.set("Access-Control-Allow-Origin", cors_origin).ok();
    headers
        .set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        .ok();
    headers
        .set("Access-Control-Allow-Headers", "Content-Type")
        .ok();
    headers.set("Content-Type", "application/json").ok();
    Ok(headers)
}

pub fn make_response(
    status: u16,
    body: &str,
    headers: &web_sys::Headers,
) -> Result<web_sys::Response, JsValue> {
    let init = web_sys::ResponseInit::new();
    init.set_status(status);
    init.set_headers(headers);

    web_sys::Response::new_with_opt_str_and_init(Some(body), &init)
        .map_err(|_| "Failed to create response".into())
}
