# build-all.ps1: Governed Clean Build & Deploy
Write-Host "--- [LIBRARIAN] Initiating Clean Build & Deploy ---" -ForegroundColor Cyan

# Backend: Ensure clean state per compliance rules
Write-Host "Packaging Backend..." -ForegroundColor Yellow
mvn clean package -DskipTests -f backend/pom.xml

# Frontend: Build artifacts
Write-Host "Building Frontend..." -ForegroundColor Yellow
Set-Location -Path frontend
npm run build
Set-Location -Path ..

# Deploy: Launch Infrastructure via Docker
Write-Host "Launching Test Stack..." -ForegroundColor Yellow
docker compose -f docker-compose.test.yml up -d --build

Write-Host "--- [LIBRARIAN] Infrastructure deployed successfully ---" -ForegroundColor Green