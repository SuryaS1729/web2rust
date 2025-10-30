use axum::{
    extract::{Path, State},
    routing::{delete, get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::{
    net::SocketAddr,
    sync::{Arc, RwLock},
};
use tower_http::cors::{Any, CorsLayer};
use uuid::Uuid;

#[derive(Serialize, Deserialize, Clone)]
struct Note {
    id: Uuid,
    text: String,
}

#[derive(Clone, Default)]
struct AppState {
    notes: Arc<RwLock<Vec<Note>>>,
}

#[tokio::main]
async fn main() {
    let state = AppState::default();

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/api/notes", get(list_notes).post(create_note))
        .route("/api/notes/:id", delete(delete_note))
        .with_state(state)
        .layer(cors);

    let addr = SocketAddr::from(([127, 0, 0, 1], 4000));
    println!("🚀 backend running on http://{addr}");

    // ✅ Axum 0.7 built-in server
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn list_notes(State(s): State<AppState>) -> Json<Vec<Note>> {
    let notes = s.notes.read().unwrap().clone();
    Json(notes)
}

#[derive(Deserialize)]
struct CreateNote {
    text: String,
}

async fn create_note(State(s): State<AppState>, Json(body): Json<CreateNote>) -> Json<Note> {
    let note = Note {
        id: Uuid::new_v4(),
        text: body.text,
    };
    let mut notes = s.notes.write().unwrap();
    notes.push(note.clone());
    Json(note)
}

async fn delete_note(State(s): State<AppState>, Path(id): Path<Uuid>) -> Json<bool> {
    let mut notes = s.notes.write().unwrap();
    let before = notes.len();
    notes.retain(|n| n.id != id);
    Json(notes.len() != before)
}
