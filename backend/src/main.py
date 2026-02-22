from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .models import get_db
from .routers import papers, annotations

app = FastAPI(title="Paper-Reader Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(papers.router, prefix="/api")
app.include_router(annotations.router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Paper-Reader API"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/config")
def get_config():
    return {
        "default_ai_provider": settings.default_ai_provider,
        "ollama_base_url": settings.ollama_base_url,
    }
