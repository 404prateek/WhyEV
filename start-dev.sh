#!/usr/bin/env bash
# WhyEV Full-Stack Concurrent Startup Script (Bash/Linux/macOS)
echo "=========================================================="
echo "🚀 Starting WhyEV Full-Stack System (Backend + Frontend)"
echo "=========================================================="

echo "[1/2] Launching FastAPI Backend on http://localhost:8000..."
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!

echo "[2/2] Launching Next.js Frontend on http://localhost:3000..."
cd frontend && npm run dev

trap "kill $BACKEND_PID" EXIT
