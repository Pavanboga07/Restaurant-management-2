# Face Recognition Attendance System - Setup Script
# PowerShell script to set up both backend and frontend

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Face Recognition Attendance System Setup" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Backend Setup
Write-Host "Setting up Backend..." -ForegroundColor Yellow
Write-Host ""

Set-Location backend

# Check if Python is installed
if (Get-Command python -ErrorAction SilentlyContinue) {
    Write-Host "Python found: " -NoNewline
    python --version
} else {
    Write-Host "ERROR: Python is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Create virtual environment
Write-Host "Creating Python virtual environment..." -ForegroundColor Green
python -m venv venv

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Green
.\venv\Scripts\Activate.ps1

# Install Python dependencies
Write-Host "Installing Python dependencies..." -ForegroundColor Green
Write-Host "(This may take several minutes, especially for dlib and face_recognition)" -ForegroundColor Yellow
pip install --upgrade pip
pip install -r requirements.txt

if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: Some packages may have failed to install" -ForegroundColor Yellow
    Write-Host "If dlib or face_recognition failed, you may need to install Visual C++ Build Tools" -ForegroundColor Yellow
    Write-Host "See README.md for troubleshooting steps" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Backend setup complete!" -ForegroundColor Green
Write-Host ""

# Return to root directory
Set-Location ..

# Frontend Setup
Write-Host "Setting up Frontend..." -ForegroundColor Yellow
Write-Host ""

Set-Location frontend

# Check if Node.js is installed
if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Host "Node.js found: " -NoNewline
    node --version
    Write-Host "npm found: " -NoNewline
    npm --version
} else {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Install Node.js dependencies
Write-Host "Installing Node.js dependencies..." -ForegroundColor Green
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: npm install failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Frontend setup complete!" -ForegroundColor Green
Write-Host ""

# Return to root directory
Set-Location ..

# Summary
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Start Backend (in one terminal):" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   .\venv\Scripts\Activate.ps1" -ForegroundColor Gray
Write-Host "   python app.py" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Start Frontend (in another terminal):" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Open browser at: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "For more information, see README.md" -ForegroundColor Yellow
Write-Host ""
