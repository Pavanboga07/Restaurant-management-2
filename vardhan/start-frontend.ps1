# Start Frontend Development Server
# PowerShell script

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Starting React Frontend Server" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to frontend directory
Set-Location frontend

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "ERROR: node_modules not found!" -ForegroundColor Red
    Write-Host "Please run setup.ps1 first" -ForegroundColor Yellow
    exit 1
}

# Start React development server
Write-Host "Starting React development server..." -ForegroundColor Green
Write-Host "The application will open automatically at http://localhost:3000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

npm start
