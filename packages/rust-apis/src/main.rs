mod api;
mod config;
mod error;
mod handlers;
mod models;
mod services;

use axum::{
    routing::get,
    Router,
    response::Json,
};

use tower_http::cors::{CorsLayer, AllowOrigin, Any};
use axum::http::{Method, HeaderValue};
use dotenv::dotenv;
use std::env;

#[tokio::main]
async fn main() {
    dotenv().ok();

    let port = env::var("PORT").unwrap_or_else(|_| "9000".to_string());
    
    let cors = if let Ok(origin) = env::var("CORS_ORIGIN") {
        CorsLayer::new()
            .allow_origin(origin.parse::<HeaderValue>().unwrap())
            .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
            .allow_headers(Any)
    } else {
        let is_dev = env::var("ENV").unwrap_or_else(|_| "production".to_string()) == "development"
            || env::var("NODE_ENV").unwrap_or_else(|_| "production".to_string()) == "development";
        
        if is_dev {
            let allowed_origins = vec![
                "http://localhost:3000".parse::<HeaderValue>().unwrap(),
            ];
            CorsLayer::new()
                .allow_origin(AllowOrigin::list(allowed_origins))
                .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
                .allow_headers(Any)
        } else {
            eprintln!("ERROR: CORS_ORIGIN must be set in production!");
            std::process::exit(1);
        }
    };

    let app = Router::new()
        .route("/", get(|| async { "Hello, World!" }))
        .route("/health", get(|| async {
            use std::time::{SystemTime, UNIX_EPOCH};
            let timestamp = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_secs();
            Json(serde_json::json!({
                "status": "ok",
                "service": "rust-apis",
                "timestamp": timestamp,
            }))
        }))
        .merge(api::wallet_routes())
        .merge(api::history_routes())
        .layer(cors);

    let addr = format!("0.0.0.0:{}", port);
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();

    println!("Rust backend live on {:?}", listener.local_addr().unwrap());

    axum::serve(listener, app).await.unwrap();
}
