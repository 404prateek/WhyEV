from __future__ import annotations

import logging
import sys
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import structlog
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prometheus_fastapi_instrumentator import Instrumentator
import sentry_sdk

from app.core.config import settings
from app.db.session import engine
from app.db.base import Base  # noqa: F401 — import all models to register them
from app.routers import (
    profile,
    recommendations,
    subsidy,
    dealers,
    certification,
    agent,
    notifications,
    admin,
    news,
    charging,
    location,
)

# ---------------------------------------------------------------------------
# Structured logging
# ---------------------------------------------------------------------------


structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.dev.ConsoleRenderer() if settings.DEBUG else structlog.processors.JSONRenderer(),
    ],
    wrapper_class=structlog.make_filtering_bound_logger(
        logging.DEBUG if settings.DEBUG else logging.INFO
    ),
    context_class=dict,
    logger_factory=structlog.PrintLoggerFactory(),
)

log = structlog.get_logger(__name__)


# ---------------------------------------------------------------------------
# Sentry
# ---------------------------------------------------------------------------

if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        traces_sample_rate=0.1,
        environment=settings.ENVIRONMENT,
    )


# ---------------------------------------------------------------------------
# Lifespan — startup / shutdown
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    log.info("whyev.startup", environment=settings.ENVIRONMENT)
    if settings.DEBUG:
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
        except Exception as exc:
            log.warning("primary_db_unreachable_switching_to_sqlite", error=str(exc))
            from sqlalchemy.ext.asyncio import create_async_engine
            from app.db import session as db_session_module
            fallback_engine = create_async_engine("sqlite+aiosqlite:///./whyev.db")
            db_session_module.engine = fallback_engine
            db_session_module.AsyncSessionLocal.configure(bind=fallback_engine)
            async with fallback_engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
    yield
    log.info("whyev.shutdown")
    await engine.dispose()



# ---------------------------------------------------------------------------
# Application
# ---------------------------------------------------------------------------

app = FastAPI(
    title="WhyEV API",
    description="EV consultation, subsidy eligibility, and dealer matching platform.",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)

# CORS — allow the production domain, any *.vercel.app preview, and localhost dev
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=(
        r"https://(www\.)?whyev\.in"           # production: whyev.in / www.whyev.in
        r"|https://.*\.vercel\.app"             # Vercel preview deployments
        r"|http://(localhost|127\.0\.0\.1)(:\d+)?"  # local dev
    ),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prometheus metrics
Instrumentator().instrument(app).expose(app, endpoint="/metrics")


# ---------------------------------------------------------------------------
# Global exception handler
# ---------------------------------------------------------------------------

@app.exception_handler(Exception)
async def unhandled_exception_handler(request, exc):
    log.error("unhandled_exception", path=request.url.path, exc_str=str(exc))
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": f"Internal Server Error: {str(exc)}"},
    )


# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

# Include API routers
API_PREFIX = "/api/v1"

app.include_router(profile.router, prefix=API_PREFIX, tags=["Profile"])
app.include_router(recommendations.router, prefix=API_PREFIX, tags=["Recommendations"])
app.include_router(subsidy.router, prefix=API_PREFIX, tags=["Subsidy"])
app.include_router(dealers.router, prefix=API_PREFIX, tags=["Dealers"])
app.include_router(certification.router, prefix=API_PREFIX, tags=["Certification"])
app.include_router(agent.router, prefix=API_PREFIX, tags=["AI Agent"])
app.include_router(notifications.router, prefix=API_PREFIX, tags=["Notifications"])
app.include_router(admin.router, prefix=API_PREFIX, tags=["Admin"])
app.include_router(news.router, prefix=API_PREFIX, tags=["News"])
app.include_router(charging.router, prefix=API_PREFIX, tags=["Charging Stations"])
app.include_router(location.router, prefix=API_PREFIX, tags=["Location"])



@app.get("/health", tags=["Health"])
async def health() -> dict[str, str]:
    return {"status": "ok", "version": "1.0.0"}
