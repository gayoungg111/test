import os
from pathlib import Path

from pydantic import AliasChoices, Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def _default_output_dir() -> Path:
    if os.getenv("VERCEL"):
        return Path("/tmp/reports")
    return Path(__file__).resolve().parent.parent / "output"


def _read_env(*names: str) -> str:
    for name in names:
        value = os.getenv(name)
        if value:
            return value
    return ""


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        extra="ignore",
        populate_by_name=True,
    )

    gemini_api_key: str = Field(
        default="",
        validation_alias=AliasChoices("GEMINI_API_KEY", "gemini_api_key"),
    )
    gemini_model: str = Field(
        default="gemini-2.0-flash",
        validation_alias=AliasChoices("GEMINI_MODEL", "gemini_model"),
    )
    tavily_api_key: str = Field(
        default="",
        validation_alias=AliasChoices("TAVILY_API_KEY", "tavily_api_key"),
    )

    smtp_enabled: bool = False
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = ""

    output_dir: Path = _default_output_dir()

    @model_validator(mode="after")
    def fill_from_os_environ(self) -> "Settings":
        if not self.gemini_api_key:
            self.gemini_api_key = _read_env("GEMINI_API_KEY", "gemini_api_key")
        if self.gemini_model == "gemini-2.0-flash":
            self.gemini_model = _read_env("GEMINI_MODEL", "gemini_model") or self.gemini_model
        if not self.tavily_api_key:
            self.tavily_api_key = _read_env("TAVILY_API_KEY", "tavily_api_key")
        return self


settings = Settings()
