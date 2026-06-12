import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import report

logging.basicConfig(level=logging.INFO)


def _cors_origins() -> list[str]:
    origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
    vercel_url = os.getenv("VERCEL_URL")
    if vercel_url:
        origins.append(f"https://{vercel_url}")
    return origins


app = FastAPI(
    title="키워드 이슈 보고서 서비스",
    description="키워드 기반 최근 7일 이슈 수집, 보고서 생성, 이메일 발송 API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(report.router)


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}
