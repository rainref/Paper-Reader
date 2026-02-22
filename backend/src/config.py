from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    app_dir: Path = Path(__file__).parent.parent
    data_dir: Path = app_dir / "data"
    papers_dir: Path = data_dir / "papers"
    annotations_dir: Path = data_dir / "annotations"
    db_path: Path = data_dir / "papers.db"

    # AI Configuration
    openai_api_key: str = ""
    anthropic_api_key: str = ""
    ollama_base_url: str = "http://localhost:11434"
    default_ai_provider: str = "openai"  # openai, anthropic, ollama

    class Config:
        env_file = ".env"

settings = Settings()

# Ensure directories exist
settings.papers_dir.mkdir(parents=True, exist_ok=True)
settings.annotations_dir.mkdir(parents=True, exist_ok=True)
