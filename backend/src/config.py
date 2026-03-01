from pydantic_settings import BaseSettings
from pathlib import Path
import os

class Settings(BaseSettings):
    app_dir: Path = Path(__file__).parent.parent
    #print(f"App directory: {app_dir}")
    data_dir: Path = app_dir / "data"
    papers_dir: Path = data_dir / "papers"
    annotations_dir: Path = data_dir / "annotations"
    db_path: Path = data_dir / "papers.db"

    # MinerU Configuration
    mineru_cache_dir: Path = data_dir / "markdown"  # Markdown output directory
    #print(f"MinerU cache directory: {mineru_cache_dir}")
    mineru_model_dir: Path = Path(__file__).parent.parent.parent / "model"  # Local model directory

    # AI Configuration
    openai_api_key: str = ""
    anthropic_api_key: str = ""
    ollama_base_url: str = "http://localhost:11434"
    default_ai_provider: str = "openai"  # openai, anthropic, ollama

    class Config:
        env_file = ".env"

    def get_mineru_vlm_model_path(self) -> Path:
        """获取本地 VLM 模型路径"""
        return self.mineru_model_dir / "MinerU2.5-2509-1.2B"

settings = Settings()

# Ensure directories exist
settings.papers_dir.mkdir(parents=True, exist_ok=True)
settings.annotations_dir.mkdir(parents=True, exist_ok=True)
settings.mineru_cache_dir.mkdir(parents=True, exist_ok=True)
