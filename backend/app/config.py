import os
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


def _default_output_dir() -> Path:
    if os.getenv("VERCEL"):
        return Path("/tmp/reports")
    return Path(__file__).resolve().parent.parent / "output"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash"
    tavily_api_key: str = ""

    smtp_enabled: bool = False
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = ""

    output_dir: Path = _default_output_dir()


settings = Settings()
