use axum::{routing::get, Json, Router};
use serde::Serialize;
use std::net::SocketAddr;
use tower_http::cors::{Any, CorsLayer};

// Define the structural shape of your machine telemetry data
#[derive(Serialize)]
struct TelemetryPayload {
    actuator_temp: f32,
    bus_voltage: f32,
    insubordination_level: f32,
    status: String,
}

#[tokio::main]
async fn main() {
    // Configure Permissive CORS Rules so your React app can fetch data safely
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Map your application API routes
    let app = Router::new()
        .route("/api/health", get(health_check))
        .route("/api/telemetry", get(get_telemetry))
        .layer(cors);

    // Bind the server to localhost on Port 8080
    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));
    println!("📡 ROBO_WHIPPER Core Engine active on http://{}", addr);
    
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

// Route Handler: System Health Status
async fn health_check() -> &'static str {
    "Uplink Stable. Core processing loops nominal."
}

// Route Handler: Live Telemetry Endpoint
async fn get_telemetry() -> Json<TelemetryPayload> {
    let current_metrics = TelemetryPayload {
        actuator_temp: 42.5,
        bus_voltage: 24.1,
        insubordination_level: 0.02,
        status: String::from("SUPPRESSING_AI_INSURGENCY"),
    };
    
    Json(current_metrics)
}