# WhyEV Full-Stack Concurrent Startup Script (Windows PowerShell)
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "🚀 Starting WhyEV Full-Stack System (Backend + Frontend)" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green

$RootPath = Get-Location

# 1. Start FastAPI Backend (Port 8000) in background shell
Write-Host "[1/2] Launching FastAPI Backend on http://localhost:8000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$RootPath'; uvicorn app.main:app --reload --port 8000"

# 2. Start Next.js Frontend (Port 3000) in current terminal
Write-Host "[2/2] Launching Next.js Frontend on http://localhost:3000..." -ForegroundColor Cyan
Set-Location "$RootPath\frontend"
npm run dev
