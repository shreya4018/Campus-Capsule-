# Campus Capsule - Start both Frontend & Backend
Write-Host "Starting Campus Capsule..." -ForegroundColor Cyan

# Start Backend in a new terminal window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; venv\Scripts\activate; uvicorn app.main:app --reload"

# Start Frontend in current window
Write-Host "Backend starting in new window..." -ForegroundColor Green
Write-Host "Starting Frontend..." -ForegroundColor Green
Set-Location "$PSScriptRoot\frontend"
npm run dev
