import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import report

logging.basicConfig(level=logging.INFO)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(report.router)


@app.get("/health")
@app.get("/api/health")
async def health_check() -> dict[str, str | bool | list[str]]:
    env_key_names = sorted(
        name
        for name in os.environ
        if any(token in name.lower() for token in ("gemini", "tavily", "smtp"))
    )
    return {
        "status": "ok",
        "gemini_api_key_configured": bool(settings.gemini_api_key),
        "tavily_api_key_configured": bool(settings.tavily_api_key),
        "gemini_model": settings.gemini_model,
        "matched_env_key_names": env_key_names,
    }
