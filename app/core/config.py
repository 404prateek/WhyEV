from __future__ import annotations

from functools import lru_cache
from typing import Annotated

from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # ----- App -----
    APP_NAME: str = "WhyEV Backend"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "changeme-in-production-use-32-char-minimum"

    # ----- CORS -----
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    # ----- Database -----
    DATABASE_URL: str = "postgresql+asyncpg://whyev:whyev@localhost:5432/whyev"

    # ----- Redis -----
    REDIS_URL: str = "redis://localhost:6379/0"

    # ----- JWT -----
    JWT_SECRET: str = "changeme-jwt-secret"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TTL: int = 900         # seconds — 15 min
    JWT_REFRESH_TTL: int = 2_592_000  # seconds — 30 days

    # ----- OTP -----
    OTP_EXPIRY_SECONDS: int = 300     # 5 min
    OTP_RATE_LIMIT_PER_PHONE: int = 3
    OTP_RATE_LIMIT_PER_IP: int = 10

    # ----- SMS Gateway -----
    SMS_GATEWAY: str = "msg91"        # msg91 | twilio
    SMS_API_KEY: str = ""
    SMS_SENDER_ID: str = "WHYEV"
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""

    # ----- Google OAuth -----
    GOOGLE_OAUTH_CLIENT_ID: str = ""

    # ----- Anthropic -----
    ANTHROPIC_API_KEY: str = ""
    ANTHROPIC_AGENT_MODEL: str = "claude-sonnet-4-5"      # main agent turns
    ANTHROPIC_CLASSIFIER_MODEL: str = "claude-haiku-4-5"  # cheap intent classification

    # ----- S3-compatible file storage -----
    S3_ENDPOINT_URL: str = ""          # leave empty for AWS S3, set for Cloudflare R2
    S3_BUCKET: str = "whyev-assets"
    S3_ACCESS_KEY: str = ""
    S3_SECRET_KEY: str = ""
    S3_REGION: str = "auto"

    # ----- Observability -----
    SENTRY_DSN: str = ""

    # ----- Celery -----
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # ----- pgvector -----
    VECTOR_DIMENSION: int = 1536       # OpenAI/Anthropic embedding dim

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings: Settings = get_settings()
