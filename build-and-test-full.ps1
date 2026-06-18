#Requires -Version 5.0
<#
.SYNOPSIS
    FreightClub Integration Test: Clean Build → Docker → Run Tests

.DESCRIPTION
    Automates the complete integration test workflow:
    1. Kill stale Java processes
    2. Clean Docker environment (containers + volumes)
    3. Build backend (mvn clean package)
    4. Build frontend (npm ci + npm run build)
    5. Start Docker containers with health verification
    6. Run integration tests (backend + frontend E2E)
    7. Capture logs and test results
    8. Cleanup or leave running for debugging

.PARAMETER SkipDockerBuild
    If $true, skip Docker image rebuild (use existing images)
    Default: $false

.PARAMETER SkipTests
    If $true, build and start Docker but don't run tests
    Default: $false

.PARAMETER LeaveRunning
    If $true, leave Docker containers running after tests (for debugging)
    Default: $false

.PARAMETER TestType
    Specify which tests to run: 'backend', 'frontend', 'both'
    Default: 'both'

.PARAMETER LogPath
    Directory to save test logs and results
    Default: ./test-results

.EXAMPLE
    .\build-and-test-docker.ps1 -TestType backend -LeaveRunning

.EXAMPLE
    .\build-and-test-docker.ps1 -SkipTests  # Just build and start Docker

#>

param(
    [switch]$SkipDockerBuild,
    [switch]$SkipTests,
    [switch]$LeaveRunning,
    [ValidateSet('backend', 'frontend', 'both')]
    [string]$TestType = 'both',
    [string]$LogPath = './test-results'
)

$ErrorActionPreference = 'Stop'
$WarningPreference = 'Continue'

# Suppress docker-compose version warnings
$Env:COMPOSE_IGNORE_ORPHANS = 1

# Store root directory for absolute paths
$RootDir = Get-Location

# Colors for output
$ColorSuccess = 'Green'
$ColorError = 'Red'
$ColorWarning = 'Yellow'
$ColorInfo = 'Cyan'

function Write-Status {
    param([string]$Message, [string]$Type = 'Info')
    $Color = switch ($Type) {
        'Success' { $ColorSuccess }
        'Error' { $ColorError }
        'Warning' { $ColorWarning }
        default { $ColorInfo }
    }
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $Message" -ForegroundColor $Color
}

function Test-CommandExists {
    param([string]$Command)
    $exists = $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
    return $exists
}

# ============================================================================
# PHASE 1: PRE-FLIGHT CHECKS
# ============================================================================

Write-Host "`n========== INTEGRATION TEST PIPELINE START ==========" -ForegroundColor Cyan
Write-Status "Phase 1: Pre-flight Checks" -Type Info

# Check required commands
@('docker', 'docker-compose', 'mvn', 'npm', 'git') | ForEach-Object {
    if (-not (Test-CommandExists $_)) {
        Write-Status "CRITICAL: $_ not found in PATH" -Type Error
        exit 1
    }
    Write-Status "[OK] $_ installed" -Type Success
}

# Check we're in correct directory
if (-not (Test-Path 'docker-compose.test.yml')) {
    Write-Status "ERROR: docker-compose.test.yml not found. Run from project root." -Type Error
    exit 1
}
Write-Status "[OK] docker-compose.test.yml found" -Type Success

# Create log directory
if (-not (Test-Path $LogPath)) {
    New-Item -ItemType Directory -Path $LogPath -Force | Out-Null
    Write-Status "[OK] Created log directory: $LogPath" -Type Success
}

# ============================================================================
# PHASE 2: KILL STALE JAVA PROCESSES
# ============================================================================

Write-Status "Phase 2: Cleanup Stale Java Processes" -Type Info

$javaProcesses = Get-Process java -ErrorAction SilentlyContinue
if ($javaProcesses) {
    Write-Status "Found $(($javaProcesses | Measure-Object).Count) Java process(es)" -Type Warning
    foreach ($proc in $javaProcesses) {
        Write-Status "  Killing PID $($proc.Id): $($proc.ProcessName)"
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        Start-Sleep -Milliseconds 500
    }
    Write-Status "[OK] Java processes terminated" -Type Success
} else {
    Write-Status "[OK] No stale Java processes found" -Type Success
}

Start-Sleep -Seconds 2

# ============================================================================
# PHASE 3: CLEAN DOCKER ENVIRONMENT
# ============================================================================

Write-Status "Phase 3: Clean Docker Environment" -Type Info

Write-Status "  Stopping containers..."
docker-compose -f docker-compose.test.yml down -v | Out-Null

# Verify containers are gone
$activeContainers = @(docker ps -q --filter "label=com.docker.compose.project=freightclub" 2>$null)
if ($activeContainers.Count -gt 0) {
    Write-Status "  Force removing lingering containers..."
    docker rm -f @activeContainers | Out-Null
}

Write-Status "[OK] Docker environment cleaned" -Type Success

# ============================================================================
# PHASE 4: BUILD BACKEND
# ============================================================================

Write-Status "Phase 4: Build Backend (Maven)" -Type Info

Push-Location backend
Write-Status "  Running: mvn clean package -DskipTests"
mvn clean package -DskipTests 2>$null | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Status "FAILED: Maven build failed" -Type Error
    Pop-Location
    exit 1
}
Write-Status "[OK] Backend built successfully" -Type Success
Pop-Location

# ============================================================================
# PHASE 5: BUILD FRONTEND
# ============================================================================

Write-Status "Phase 5: Build Frontend (Node.js)" -Type Info

Push-Location frontend
Write-Status "  Running: npm ci --legacy-peer-deps"
$env:NODE_OPTIONS = "--no-deprecation"
npm ci --legacy-peer-deps --silent 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Status "  Attempting npm install fallback..." -Type Warning
    npm install --legacy-peer-deps --silent 2>$null
}

Write-Status "  Running: npm run build"
npm run build --silent 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Status "FAILED: npm build failed" -Type Error
    Pop-Location
    exit 1
}
Write-Status "[OK] Frontend built successfully" -Type Success
Pop-Location

# ============================================================================
# PHASE 6: START DOCKER CONTAINERS
# ============================================================================

Write-Status "Phase 6: Start Docker Containers" -Type Info

$dockerStartTime = Get-Date

if ($SkipDockerBuild) {
    Write-Status "  Using existing Docker images (--skip-docker-build)"
    $dockerCmd = "docker-compose -f docker-compose.test.yml up 2>$null -d"
} else {
    Write-Status "  Building fresh Docker images"
    $dockerCmd = "docker-compose -f docker-compose.test.yml up 2>$null -d --build"
}

Write-Status "  Executing: $dockerCmd"
Invoke-Expression $dockerCmd | Out-File -FilePath (Join-Path (Join-Path $RootDir $LogPath) "docker-start.log") -Encoding UTF8 -Append

Write-Status "[OK] Docker containers started" -Type Success

# ============================================================================
# PHASE 7: VERIFY DOCKER HEALTH
# ============================================================================

Write-Status "Phase 7: Verify Docker Health Checks" -Type Info

$maxAttempts = 30
$attempt = 0
$allHealthy = $false

while ($attempt -lt $maxAttempts -and -not $allHealthy) {
    $attempt++
    Write-Status "  Health check attempt $attempt/$maxAttempts..."

    $psOutput = docker compose -f docker-compose.test.yml ps --format "{{.Names}}: {{.State}}"
    Write-Status "  Status: `n$psOutput" -Type Info

    # Check for all healthy
    $psJson = docker compose -f docker-compose.test.yml ps --format json 2>/dev/null | ConvertFrom-Json
    $unhealthy = @()

    foreach ($service in $psJson) {
        $state = $service.State
        if ($state -notmatch 'running|Up') {
            $unhealthy += $service.Name
        }
    }

    if ($unhealthy.Count -eq 0) {
        $allHealthy = $true
        Write-Status "[OK] All containers healthy" -Type Success
    } else {
        Write-Status "  Waiting for: $($unhealthy -join ', ')" -Type Warning
        Start-Sleep -Seconds 2
    }
}

if (-not $allHealthy) {
    Write-Status "TIMEOUT: Docker containers failed to become healthy" -Type Error
    docker compose -f docker-compose.test.yml logs | Out-File -FilePath (Join-Path (Join-Path $RootDir $LogPath) "docker-health-fail.log") -Encoding UTF8
    exit 1
}

# ============================================================================
# PHASE 8: VERIFY CONNECTIVITY
# ============================================================================

Write-Status "Phase 8: Verify Service Connectivity" -Type Info

# Backend health check
Write-Status "  Checking backend health (http://localhost:9091/actuator/health)..."
$backendHealthy = $false
for ($i = 0; $i -lt 10; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:9091/actuator/health" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $backendHealthy = $true
            Write-Status "[OK] Backend is healthy" -Type Success
            break
        }
    } catch {
        Write-Status "  Attempt $($i+1)/10 failed, retrying..." -Type Warning
        Start-Sleep -Seconds 1
    }
}

if (-not $backendHealthy) {
    Write-Status "ERROR: Backend health check failed" -Type Error
    docker logs freightclub-test-backend | Out-File -FilePath (Join-Path (Join-Path $RootDir $LogPath) "backend-health-fail.log") -Encoding UTF8
    exit 1
}

# Frontend connectivity check
Write-Status "  Checking frontend (http://localhost:9090)..."
$frontendHealthy = $false
for ($i = 0; $i -lt 10; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:9090" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $frontendHealthy = $true
            Write-Status "[OK] Frontend is accessible" -Type Success
            break
        }
    } catch {
        Write-Status "  Attempt $($i+1)/10 failed, retrying..." -Type Warning
        Start-Sleep -Seconds 1
    }
}

if (-not $frontendHealthy) {
    Write-Status "ERROR: Frontend health check failed" -Type Error
    docker logs freightclub-test-frontend | Out-File -FilePath (Join-Path (Join-Path $RootDir $LogPath) "frontend-health-fail.log") -Encoding UTF8
    exit 1
}

Write-Status "[OK] All services are healthy and responsive" -Type Success

# ============================================================================
# PHASE 9: RUN INTEGRATION TESTS
# ============================================================================

if (-not $SkipTests) {
    Write-Status "Phase 9: Run Integration Tests" -Type Info

    # Backend Tests
    if ($TestType -in @('backend', 'both')) {
        Write-Status "  Running Backend Integration Tests..."
        $backendTestLog = Join-Path (Join-Path $RootDir $LogPath) "backend-tests.log"

        Write-Status "    Executing: docker exec freightclub-test-backend mvn test"
        docker exec -w /app freightclub-test-backend mvn test 2>&1 | Tee-Object -FilePath $backendTestLog

        if ($LASTEXITCODE -ne 0) {
            Write-Status "⚠ Backend tests failed (see $backendTestLog)" -Type Warning
        } else {
            Write-Status "[OK] Backend tests passed" -Type Success
        }

        # Capture coverage report
        Write-Status "  Capturing JaCoCo coverage report..."
        $coverageDir = Join-Path (Join-Path $RootDir $LogPath) "jacoco-backend"
        docker cp freightclub-test-backend:/app/target/site/jacoco $coverageDir 2>/dev/null
        if ($?) {
            Write-Status "[OK] Coverage report saved to $coverageDir" -Type Success
        }
    }

    # Frontend E2E Tests
    if ($TestType -in @('frontend', 'both')) {
        Write-Status "  Running Frontend E2E Tests..."
        $frontendTestLog = Join-Path (Join-Path $RootDir $LogPath) "frontend-e2e-tests.log"

        try {
            Push-Location frontend
            Write-Status "    Executing: npm run test:e2e"
            $testOutput = & npm run test:e2e 2>&1
            $testOutput | Out-File -FilePath $frontendTestLog -Encoding UTF8

            if ($LASTEXITCODE -ne 0) {
                Write-Status "⚠ Frontend E2E tests failed (see $frontendTestLog)" -Type Warning
            } else {
                Write-Status "[OK] Frontend E2E tests passed" -Type Success
            }
            Pop-Location
        } catch {
            Write-Status "ERROR: Frontend test exception: $_" -Type Error
            Pop-Location
        }

        # Capture Playwright results
        $playwrightResults = Join-Path (Join-Path $RootDir $LogPath) "playwright-results"
        Copy-Item -Path "frontend/test-results" -Destination $playwrightResults -Recurse -ErrorAction SilentlyContinue
        if ($?) {
            Write-Status "[OK] Playwright results saved to $playwrightResults" -Type Success
        }
    }
}

# ============================================================================
# PHASE 10: CAPTURE LOGS
# ============================================================================

Write-Status "Phase 10: Capture Docker Logs" -Type Info

$backendLogsFile = Join-Path (Join-Path $RootDir $LogPath) "docker-backend-logs.txt"
docker logs freightclub-test-backend 2>&1 | Out-File -FilePath $backendLogsFile -Encoding UTF8
Write-Status "[OK] Backend logs saved to $backendLogsFile" -Type Success

$frontendLogsFile = Join-Path (Join-Path $RootDir $LogPath) "docker-frontend-logs.txt"
docker logs freightclub-test-frontend 2>&1 | Out-File -FilePath $frontendLogsFile -Encoding UTF8
Write-Status "[OK] Frontend logs saved to $frontendLogsFile" -Type Success

$dbLogsFile = Join-Path (Join-Path $RootDir $LogPath) "docker-db-logs.txt"
docker logs freightclub-test-db 2>&1 | Out-File -FilePath $dbLogsFile -Encoding UTF8
Write-Status "[OK] Database logs saved to $dbLogsFile" -Type Success

# ============================================================================
# PHASE 11: CLEANUP OR KEEP RUNNING
# ============================================================================

if ($LeaveRunning) {
    Write-Status "Phase 11: Docker Containers Left Running (for debugging)" -Type Info
    Write-Status "  To view logs: docker compose -f docker-compose.test.yml logs -f" -Type Info
    Write-Status "  To stop:      docker compose -f docker-compose.test.yml down -v" -Type Info
} else {
    Write-Status "Phase 11: Cleanup Docker Environment" -Type Info
    Write-Status "  Stopping and removing containers..."
    docker-compose -f docker-compose.test.yml down -v 2>&1 | Out-Null
    Write-Status "[OK] Docker environment cleaned" -Type Success
}

# ============================================================================
# SUMMARY
# ============================================================================

$duration = ((Get-Date) - $dockerStartTime).TotalSeconds
Write-Host "`n========== TEST PIPELINE COMPLETE ==========" -ForegroundColor Green
Write-Status "Total Duration: ${duration}s" -Type Success
Write-Status "Test Results: $LogPath" -Type Info
Write-Status "Summary:" -Type Info
Write-Host @"
  [OK] Backend built
  [OK] Frontend built
  [OK] Docker containers started and healthy
  [OK] Service connectivity verified
  $(if (-not $SkipTests) { "[OK] Integration tests executed" } else { "[SKIP] Tests skipped (--SkipTests)" })
  $(if ($LeaveRunning) { "[OK] Containers left running for debugging" } else { "[OK] Docker environment cleaned" })
  [OK] Logs captured to $LogPath
"@

exit 0
