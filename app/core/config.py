from __future__ import annotations

from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # ----- App -----
    # ENVIRONMENT: which mode the app is running in (development / production).
    #   - development → detailed error messages, /docs enabled, auto-reload
    #   - production  → errors are hidden from users, /docs disabled
    APP_NAME: str = "WhyEV Backend"
    ENVIRONMENT: str = "development"

    # DEBUG: when True, SQLAlchemy prints every SQL query and FastAPI shows
    # full stack traces. Always False in production.
    DEBUG: bool = True

    # SECRET_KEY: a long random string used as the master secret for the app.
    # Used to derive other secrets and sign cookies. Generate once with:
    #   python -c "import secrets; print(secrets.token_hex(32))"
    SECRET_KEY: str = "changeme-in-production-use-32-char-minimum"

    # ----- CORS -----
    # Which browser origins are allowed to call the API.
    # Add your frontend URL here (e.g. https://whyev.in)
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    # ----- Database (Supabase / Postgres) -----
    # Your Postgres connection string.
    # For Supabase: get it from Project Settings → Database → Connection string
    # Use the "Transaction" mode URL (port 6543) for serverless/edge,
    # or the direct URL (port 5432) for a persistent backend like ours.
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/whyev"

    # ----- JWT -----
    # JWT_SECRET: signs your login tokens. Different from SECRET_KEY.
    # If someone gets this they can forge login sessions — keep it secret!
    JWT_SECRET: str = "changeme-jwt-secret"
    JWT_ALGORITHM: str = "HS256"
    # JWT_ACCESS_TTL: how long (seconds) an access token is valid → 900s = 15 min
    JWT_ACCESS_TTL: int = 900
    # JWT_REFRESH_TTL: how long (seconds) a refresh token is valid → 30 days
    JWT_REFRESH_TTL: int = 2_592_000

    # ----- Google OAuth (only auth method for MVP) -----
    # Get this from Google Cloud Console → APIs → Credentials → OAuth 2.0 Client
    GOOGLE_OAUTH_CLIENT_ID: str = ""
    GOOGLE_OAUTH_CLIENT_SECRET: str = ""

    # ----- Open-Source LLM via Groq -----
    # Groq gives you a free API key to run open-source models (Llama 3, Mixtral)
    # at very high speed. Sign up at console.groq.com — free tier is generous.
    GROQ_API_KEY: str = ""
    # Main agent model — powerful enough for multi-step reasoning
    LLM_AGENT_MODEL: str = "llama-3.3-70b-versatile"
    # Classifier model — fast & cheap for intent routing
    LLM_CLASSIFIER_MODEL: str = "llama-3.1-8b-instant"

    # ----- Observability -----
    # Sentry catches and reports backend errors. Free tier is fine for MVP.
    # Leave empty to disable.
    SENTRY_DSN: str = ""

    # ----- pgvector -----
    # Dimension of the embedding vectors stored in ai_conversations.
    # Groq doesn't provide embeddings, so we'll use a lightweight local model
    # (sentence-transformers) or Supabase's built-in pgvector later.
    VECTOR_DIMENSION: int = 384   # all-MiniLM-L6-v2 dimension (runs locally, free)

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
