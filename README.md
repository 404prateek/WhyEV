# WhyEV — EV Consultation, Subsidy Eligibility & Reliable Charging Platform

> Full-stack EV discovery, policy eligibility calculator, empanelled dealer lead matching, and crowdsourced reliable EV charging station map engine built with FastAPI and Next.js.

---

## 🚀 Quick Start (Full-Stack Startup)

### 1. Concurrent Dev Startup (Windows PowerShell)
```powershell
# Starts FastAPI Backend (Port 8000) and Next.js Frontend (Port 3000)
.\start-dev.ps1
```

### 2. Linux / macOS Dev Startup
```bash
chmod +x start-dev.sh
./start-dev.sh
```

### 3. Docker Compose (Production Environment)
```bash
# Start PostgreSQL, FastAPI Backend, Next.js Frontend, and Nginx reverse proxy
docker-compose up -d --build

# Run database migrations
docker-compose exec api alembic upgrade head
```

---

## ⚡ Tech Stack

- **Backend**: Python 3.11, FastAPI, SQLAlchemy 2.0 (AsyncIO), PostgreSQL / SQLite automatic fallback (`whyev.db`), Pydantic v2, Structlog.
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, TailwindCSS, Framer Motion, Leaflet Map.
- **AI Engine**: Groq Llama 3.3 70B & Llama 3.1 8B pool for review classification & natural language consultation.
- **Data Layer**: 670+ real geocoded Delhi NCR EV Charging Stations pre-loaded with OpenChargeMap & OpenStreetMap live fallbacks.

---

## 📁 Repository Structure

```
.
├── app/
│   ├── core/           # Configs, security, logger & Groq LLM pool
│   ├── db/             # Base models, async session & SQLite fallback engine
│   ├── models/         # SQLAlchemy models (charging, user, vehicle, dealer, etc.)
│   ├── routers/        # FastAPI API routes (/charging, /subsidy, /recommendations)
│   ├── schemas/        # Pydantic schemas for request & response validation
│   ├── scripts/        # Database seed scripts (seed_stations.py)
│   ├── services/       # Core business logic (reliability engine, eligibility service)
│   └── main.py         # Application entry point & lifespan handler
├── frontend/
│   ├── src/
│   │   ├── app/        # Next.js App Router pages (/map, /subsidy, /recommend)
│   │   ├── components/ # Reusable UI components (charging-map, ai-agent, etc.)
│   │   ├── lib/        # State stores & API client
│   │   └── services/   # Frontend service layer (chargingService.ts)
│   ├── package.json
│   └── next.config.ts
├── tests/              # Unit and integration test suite
├── delhi ncr ev stations.json # Delhi NCR EV stations dataset (670 POIs)
├── requirements.txt    # Production Python dependencies
└── README.md
```

---

## 🧪 Running Tests & Verification

```bash
# Run backend test suite
pytest tests/unit/ -v

# Seed 670 charging stations into local database
python app/scripts/seed_stations.py
```

---

## 🔐 Environment Setup

Copy `.env.example` to `.env` in the backend directory:

```env
ENVIRONMENT=development
DEBUG=True
SECRET_KEY=changeme-in-production-use-32-char-minimum
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/whyev

# Groq LLM API Pool (Optional)
GROQ_API_KEY_1=gsk_...
```

---

## 📜 License

Distributed under the MIT License.
