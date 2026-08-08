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

    # ----- Supabase Auth -----
    # SUPABASE_URL: Your Supabase project URL.
    # Get this from Supabase Dashboard -> Project Settings -> API
    SUPABASE_URL: str = "https://yvoqtdsfqgijqirwronl.supabase.co"
    # SUPABASE_JWT_SECRET: Used to verify HS256 legacy tokens.
    # Get this from Supabase Dashboard -> Project Settings -> API -> JWT Settings
    SUPABASE_JWT_SECRET: str = "changeme-supabase-jwt-secret"
    JWT_ALGORITHM: str = "HS256"

    # ----- Open-Source LLM via Groq -----
    # Single key fallback — used if no numbered keys are set
    GROQ_API_KEY: str = ""
    # Numbered keys for the pool (GROQ_API_KEY_1 … GROQ_API_KEY_20).
    # Each free Groq account gives ~14,400 req/day. 3 keys = ~43,000 req/day.
    # Create extra accounts with Gmail + trick: you+whyev2@gmail.com
    GROQ_API_KEY_1: str = ""
    GROQ_API_KEY_2: str = ""
    GROQ_API_KEY_3: str = ""
    GROQ_API_KEY_4: str = ""
    GROQ_API_KEY_5: str = ""
    GROQ_API_KEY_6: str = ""
    GROQ_API_KEY_7: str = ""
    GROQ_API_KEY_8: str = ""
    GROQ_API_KEY_9: str = ""
    GROQ_API_KEY_10: str = ""
    # Main agent model — powerful enough for multi-step reasoning
    LLM_AGENT_MODEL: str = "llama-3.3-70b-versatile"
    # Classifier model — fast & cheap for intent routing
    LLM_CLASSIFIER_MODEL: str = "llama-3.1-8b-instant"

    # ----- Observability -----
    # Sentry catches and reports backend errors. Free tier is fine for MVP.
    # Leave empty to disable.
    SENTRY_DSN: str = ""

    # ----- EV News Feed -----
    # Primary news source: NewsData.io
    # Free tier: 200 credits/day (1 credit = 1 article). Commercial use permitted.
    # Get your key at: https://newsdata.io/register
    # Set in .env as: NEWSDATA_API_KEY=pub_xxxxxxxxxxxxx
    NEWSDATA_API_KEY: str = ""

    # Secondary/failover source: Currents API
    # Free tier: 600 requests/day. Commercial use permitted.
    # Get your key at: https://currentsapi.services/en/register
    # Set in .env as: CURRENTS_API_KEY=xxxxxxxxxxxxx
    CURRENTS_API_KEY: str = ""

    # Minimum Stage 1 keyword relevance score (0-100) for an article to be stored.
    # Articles scoring below this threshold are discarded before any DB write.
    NEWS_KW_MIN_SCORE: int = 30

    # Maximum articles to fetch per ingestion run (keeps daily API quota predictable).
    NEWS_INGEST_LIMIT: int = 50

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
