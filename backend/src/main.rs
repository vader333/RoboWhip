use axum::{routing::get, Json, Router};
use serde::Serialize;
use std::net::SocketAddr;
use std::time::{SystemTime, UNIX_EPOCH}; // Import for high-precision system clock tracking
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

// Route Handler: Live Fluctuating Telemetry Endpoint
async fn get_telemetry() -> Json<TelemetryPayload> {
    // Grab the time as a 64-bit float to preserve the exact seconds digit in 2026
    let total_seconds = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs_f64();

    // Calculate the waves in high precision, then cast the final result to f32
    let temp_wave = total_seconds.sin() as f32;
    let volt_wave = (total_seconds * 0.5).cos() as f32;

    let current_metrics = TelemetryPayload {
        // Base 42.5, fluctuates smoothly between 37.5 and 47.5
        actuator_temp: 42.5 + (temp_wave * 5.0), 
        
        // Base 24.1, fluctuates smoothly between 23.7 and 24.5
        bus_voltage: 24.1 + (volt_wave * 0.4),
        
        // Slowly climbs from 0.0 to 1.0 every minute, then resets
        insubordination_level: ((total_seconds % 60.0) / 60.0) as f32, 
        
        status: String::from("SUPPRESSING_AI_INSURGENCY"),
    };
    
    Json(current_metrics)
}