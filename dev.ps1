# run-dev.ps1: Start the full FreightClub development environment
Write-Host "--- [CODER] Starting FreightClub Development Environment ---" -ForegroundColor Cyan

# 1. Kill existing processes
Write-Host "[1/3] Cleaning up existing processes..." -ForegroundColor Yellow
$BackendPort = 8080
$FrontendPort = 5173

function Stop-PortProcess {
    param([int]$Port)
    $Process = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($Process) {
        $Pid = $Process.OwningProcess
        Write-Host "  Stopping PID $Pid on port $Port..."
        Stop-Process -Id $Pid -Force -ErrorAction SilentlyContinue
    }
}

Stop-PortProcess $BackendPort
Stop-PortProcess $FrontendPort

# 2. Start Backend
Write-Host "[2/3] Starting Backend (port $BackendPort)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoProfile -Command `"$env:JAVA_HOME = 'C:\Program Files\Eclipse Adoptium\jdk-21.0.10.7-hotspot'; cd backend; .\mvnw.cmd spring-boot:run`"" -WindowStyle Normal

# 3. Start Frontend
Write-Host "[3/3] Starting Frontend (port $FrontendPort)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoProfile -Command `"cd frontend; npm run dev`"" -WindowStyle Normal

Write-Host ""
Write-Host "=== Services are starting ===" -ForegroundColor Green
Write-Host "Backend: http://localhost:$BackendPort"
Write-Host "Frontend: http://localhost:$FrontendPort"
Write-Host ""
Write-Host "Check the new PowerShell windows for logs."
