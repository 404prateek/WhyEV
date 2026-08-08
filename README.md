# WhyEV Backend

> FastAPI + PostgreSQL backend for the WhyEV EV consultation platform.

## Quick Start (Full-Stack: Backend + Frontend)

### Option A: Docker Compose (Recommended)
```bash
# 1. Start all services together (PostgreSQL + FastAPI Backend + Next.js Frontend + Nginx)
docker-compose up -d

# 2. Run database migrations
docker-compose exec api alembic upgrade head

# 3. Access Full Application
# Frontend: http://localhost:3000
# Backend API Docs: http://localhost:8000/docs
```

### Option B: Local PowerShell Concurrent Script
```powershell
# Run from root directory — starts FastAPI (8000) and Next.js (3000) concurrently
.\start-dev.ps1
```

## Architecture

```
User → Nginx → FastAPI (api) → PostgreSQL (pgvector)
                           ↘ Groq LLM Pool (AI agent)
```

## Module Map

| Router | Prefix | Description |
|--------|--------|-------------|
| auth | `/api/v1/auth` | OTP + Google OAuth + JWT refresh |
| profile | `/api/v1/profile` | User profile CRUD |
| recommendations | `/api/v1/recommendations` | Vehicle matching engine |
| subsidy | `/api/v1/subsidy` | Eligibility calc + application lifecycle |
| dealers | `/api/v1/dealers` | Nearby dealers + consent-gated leads |
| certification | `/api/v1/certification` | Battery health reports + QR verify |
| agent | `/api/v1/agent` | SSE streaming AI agent |
| notifications | `/api/v1/notifications` | Multi-channel notification history |
| admin | `/api/v1/admin` | Two-person subsidy approval + analytics |

## Key Design Decisions

- **Append-only subsidy rules**: `subsidy_rules` rows are never updated. New values = new rows requiring two distinct admin approvals.
- **No LLM number fabrication**: All subsidy amounts, deadlines, and eligibility reasons are injected into agent prompts from the DB. The LLM cannot free-generate financial facts.
- **Consent gating**: `dealer_leads.consent_given_at` is null until the user explicitly opts in. The API enforces this.
- **Empanelled-first**: Vehicle recommendations only show `is_empanelled=true` vehicles.

## Running Tests

```bash
# Install dev deps
pip install -e ".[dev]"

# Run all tests
pytest tests/ -v --cov=app

# Unit tests only (no DB needed)
pytest tests/unit/ -v
```

## Build Order (spec recommendation)

1. `auth` → `user_profiles` CRUD
2. `vehicles_master` + `recommendation_service` (pure filter logic)
3. `subsidy_rules` + `eligibility_service` (**USP — get this right**)
4. `agent_orchestrator` wrapping both
5. `dealers` / `leads`
6. `certification`
7. Admin / observability
