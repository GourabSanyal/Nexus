use axum::{
    routing::get,
    Router,
};

use tower_http::cors::{CorsLayer, Any};
use axum::http::{Method, HeaderValue};
use dotenv::dotenv;
use std::env;

#[tokio::main]
async fn main() {
    dotenv().ok();

    let port = env::var("PORT").unwrap_or_else(|_| "9000".to_string());
    let origin = env::var("CORS_ORIGIN").expect("CORS_ORIGIN missing");

    let cors = CorsLayer::new()
        .allow_origin(origin.parse::<HeaderValue>().unwrap())
        .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
        .allow_headers(Any);   

    let app = Router::new().route("/", get(|| async { "Hello, World!" })).layer(cors);

    let addr = format!("0.0.0.0:{}", port);
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();

    println!("Rust backend live on {:?}", listener.local_addr().unwrap());

    axum::serve(listener, app).await.unwrap();
    
}
