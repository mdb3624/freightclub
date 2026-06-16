# FreightClub Integration Test Suite (PowerShell)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition

function Write-Status {
    param([string]$Message, [string]$Status = "info")
    $colors = @{
        "success" = "Green"
        "error" = "Red"
        "warning" = "Yellow"
        "info" = "Cyan"
    }
    Write-Host "==> $Message" -ForegroundColor $colors[$Status]
}

function Cleanup {
    Write-Status "Cleaning up Docker containers" "warning"
    docker-compose -f docker-compose.test.yml down --remove-orphans 2>$null
}

trap {
    Write-Status "Error occurred: $_" "error"
    Cleanup
    exit 1
}

Write-Status "FreightClub Integration Test Suite" "info"

# Cleanup and start fresh
Cleanup
Start-Sleep -Seconds 2

# Start containers
Write-Status "Starting Docker containers" "warning"
docker-compose -f docker-compose.test.yml up -d
if ($LASTEXITCODE -ne 0) {
    Write-Status "Failed to start Docker containers" "error"
    exit 1
}

# Wait for services
Write-Status "Waiting for services to be healthy" "warning"
$maxAttempts = 60
$attempt = 0
$allHealthy = $false

while ($attempt -lt $maxAttempts) {
    $dbStatus = docker-compose -f docker-compose.test.yml ps test-db 2>$null | Select-String "healthy"
    $backendStatus = docker-compose -f docker-compose.test.yml ps backend-test 2>$null | Select-String "healthy"
    $frontendStatus = docker-compose -f docker-compose.test.yml ps frontend-test 2>$null | Select-String "healthy"

    if ($dbStatus -and $backendStatus -and $frontendStatus) {
        $allHealthy = $true
        break
    }

    $attempt++
    if ($attempt % 10 -eq 0) {
        Write-Host "Still waiting... ($attempt/$maxAttempts)"
    }
    Start-Sleep -Seconds 1
}

if (-not $allHealthy) {
    Write-Status "Services failed to reach healthy state" "error"
    docker-compose -f docker-compose.test.yml logs
    exit 1
}

Write-Status "All services are healthy" "success"
Start-Sleep -Seconds 5

# Backend tests
Write-Status "Running backend integration tests" "warning"
Push-Location backend
mvn clean test "-Dspring.profiles.active=test" 2>&1 | Select-Object -Last 100
if ($LASTEXITCODE -ne 0) {
    Write-Status "Backend tests failed" "error"
    docker-compose -f ../docker-compose.test.yml logs backend-test
    Pop-Location
    exit 1
}
Write-Status "Backend tests passed" "success"
Pop-Location

# Frontend tests
Write-Status "Running frontend unit tests" "warning"
Push-Location frontend
npm test 2>&1 | Select-Object -Last 50
if ($LASTEXITCODE -ne 0) {
    Write-Status "Frontend tests failed" "error"
    Pop-Location
    exit 1
}
Write-Status "Frontend tests passed" "success"
Pop-Location

# Puppeteer verification
Write-Status "Running Puppeteer integration verification" "warning"
if (Test-Path "frontend/verify-fixes.cjs") {
    Push-Location frontend
    node verify-fixes.cjs 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Status "Puppeteer verification failed" "error"
        Pop-Location
        exit 1
    }
    Write-Status "Puppeteer verification passed" "success"
    Pop-Location
} else {
    Write-Status "Puppeteer script not found" "warning"
}

Write-Status "All integration tests passed!" "success"
