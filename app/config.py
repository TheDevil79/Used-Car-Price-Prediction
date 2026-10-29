"""
AutoWise AI - Configuration Module
"""

import os
from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "AutoWise AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Base directories
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    ARTIFACTS_DIR: Path = BASE_DIR / "artifacts"
    MODEL_PATH: Path = ARTIFACTS_DIR / "model.joblib"
    REPORT_PATH: Path = ARTIFACTS_DIR / "evaluation_report.json"
    METADATA_PATH: Path = ARTIFACTS_DIR / "model_metadata.json"
    FRONTEND_DIST: Path = BASE_DIR / "frontend" / "dist"

    # AI Explanation Settings
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "auto")  # auto, gemini, openai, none

    # API and CORS
    API_PREFIX: str = ""
    CORS_ORIGINS: list[str] = ["*"]

    model_config = {
        "env_file": ".env",
        "extra": "allow"
    }


settings = Settings()
