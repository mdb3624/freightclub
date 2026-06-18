# build-simple.ps1
$ErrorActionPreference = 'SilentlyContinue'

Write-Host "--- Phase 4: Backend Build ---" -ForegroundColor Cyan
cd backend
mvn clean package -DskipTests
if ($LASTEXITCODE -ne 0) { Write-Host "Backend build failed"; exit 1 }
cd ..

Write-Host "--- Phase 5: Frontend Build ---" -ForegroundColor Cyan
cd frontend
# Use standard npm ci with forced error suppression
$env:NODE_OPTIONS = "--no-deprecation"
npm ci --legacy-peer-deps --silent
if ($LASTEXITCODE -ne 0) { 
    Write-Host "npm ci failed, attempting clean install..." -ForegroundColor Yellow
    npm install --legacy-peer-deps --silent
}
npm run build --silent
if ($LASTEXITCODE -ne 0) { Write-Host "Frontend build failed"; exit 1 }
cd ..

Write-Host "--- Build Successful! ---" -ForegroundColor Green