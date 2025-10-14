# Quick Start Script for Backend
# This script helps you get the backend up and running quickly

Write-Host "🚀 Restaurant Management System - Backend Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check Python version
Write-Host "1️⃣  Checking Python installation..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Python not found. Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

# Create virtual environment
Write-Host ""
Write-Host "2️⃣  Creating virtual environment..." -ForegroundColor Yellow
if (Test-Path "venv") {
    Write-Host "⚠️  Virtual environment already exists" -ForegroundColor Yellow
} else {
    python -m venv venv
    Write-Host "✅ Virtual environment created" -ForegroundColor Green
}

# Activate virtual environment
Write-Host ""
Write-Host "3️⃣  Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"
Write-Host "✅ Virtual environment activated" -ForegroundColor Green

# Install dependencies
Write-Host ""
Write-Host "4️⃣  Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Create .env file
Write-Host ""
Write-Host "5️⃣  Setting up environment variables..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "⚠️  .env file already exists" -ForegroundColor Yellow
} else {
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created from template" -ForegroundColor Green
    Write-Host "⚠️  Please edit .env file with your actual values!" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Edit .env file with your database and API keys" -ForegroundColor White
Write-Host "2. Set up PostgreSQL database" -ForegroundColor White
Write-Host "3. Run: python init_db.py (to create tables)" -ForegroundColor White
Write-Host "4. Run: python seed_db.py (to add sample data)" -ForegroundColor White
Write-Host "5. Run: uvicorn main:app --reload" -ForegroundColor White
Write-Host ""
Write-Host "API will be available at: http://localhost:8000" -ForegroundColor Cyan
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
