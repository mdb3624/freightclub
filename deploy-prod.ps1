# FreightClub US-757 Production Deployment Script
# Deploys backend and frontend to Google Cloud Run

$ProjectID = "freight-club-495117"
$Region = "us-central1"
$Registry = "us-central1-docker.pkg.dev"
$ImageRepo = "$Registry/$ProjectID/freightclub-repo"
$ImageTag = "latest"

# Load environment from .env.prod
$env:SPRING_PROFILES_ACTIVE = "prod"
$env:PORT = "8080"
$env:DB_URL = "jdbc:postgresql://ep-lively-tree-amv4cqt0-pooler.c-5.us-east-1.aws.neon.tech/freightclub_db?sslmode=require&currentSchema=freightclub"
$env:DB_USERNAME = "neondb_owner"
$env:DB_PASSWORD = "npg_H0O3SomrgjPK"
$env:APP_JWT_SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"
$env:JWT_SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"
$env:JWT_ISSUER = "freightclub"
$env:JWT_AUDIENCE = "freightclub-api"
$env:JWT_ACCESS_EXPIRY_MS = "900000"
$env:JWT_REFRESH_EXPIRY_MS = "604800000"
$env:CORS_ALLOWED_ORIGINS = "https://freightclub.app,https://freightclub-frontend-404925591110.us-central1.run.app"

Write-Host "=== FreightClub US-757 Production Deployment ===" -ForegroundColor Green
Write-Host "Project: $ProjectID"
Write-Host "Region: $Region"
Write-Host "Image Tag: $ImageTag"
Write-Host ""

# Deploy Backend
Write-Host "Deploying Backend Service..." -ForegroundColor Cyan

# Build env vars with proper escaping for CORS_ALLOWED_ORIGINS
# NOTE: PORT is reserved in Cloud Run and automatically set - do not include
$EnvVars = @(
  "SPRING_PROFILES_ACTIVE=prod",
  "DB_URL=$($env:DB_URL)",
  "DB_USERNAME=$($env:DB_USERNAME)",
  "DB_PASSWORD=$($env:DB_PASSWORD)",
  "APP_JWT_SECRET=$($env:APP_JWT_SECRET)",
  "JWT_SECRET=$($env:JWT_SECRET)",
  "JWT_ISSUER=$($env:JWT_ISSUER)",
  "JWT_AUDIENCE=$($env:JWT_AUDIENCE)",
  "JWT_ACCESS_EXPIRY_MS=$($env:JWT_ACCESS_EXPIRY_MS)",
  "JWT_REFRESH_EXPIRY_MS=$($env:JWT_REFRESH_EXPIRY_MS)",
  "CORS_ALLOWED_ORIGINS=https://freightclub.app;https://freightclub-frontend-404925591110.us-central1.run.app"
) -join ","

gcloud run deploy freightclub-backend `
  --image="$ImageRepo/freightclub-backend:$ImageTag" `
  --platform=managed `
  --region=$Region `
  --project=$ProjectID `
  --memory=1Gi `
  --cpu=1 `
  --timeout=3600 `
  --max-instances=10 `
  --allow-unauthenticated `
  --set-env-vars=$EnvVars `
  --quiet

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend deployed successfully" -ForegroundColor Green

    # Get backend URL
    $BackendURL = & gcloud run services describe freightclub-backend --region=$Region --project=$ProjectID --format='value(status.url)'
    $BackendHost = $BackendURL -replace "https://", ""
    Write-Host "Backend URL: $BackendURL"
    Write-Host ""

    # Deploy Frontend
    Write-Host "Deploying Frontend Service..." -ForegroundColor Cyan
    gcloud run deploy freightclub-frontend `
      --image="$ImageRepo/freightclub-frontend:$ImageTag" `
      --platform=managed `
      --region=$Region `
      --project=$ProjectID `
      --memory=512Mi `
      --cpu=1 `
      --timeout=120 `
      --max-instances=10 `
      --allow-unauthenticated `
      --set-env-vars="BACKEND_URL=$BackendURL,BACKEND_HOST=$BackendHost" `
      --quiet

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Frontend deployed successfully" -ForegroundColor Green

        $FrontendURL = & gcloud run services describe freightclub-frontend --region=$Region --project=$ProjectID --format='value(status.url)'
        Write-Host "Frontend URL: $FrontendURL"
        Write-Host ""
        Write-Host "=== Deployment Complete ===" -ForegroundColor Green
        Write-Host "Backend: $BackendURL"
        Write-Host "Frontend: $FrontendURL"
        Write-Host ""
        Write-Host "Next Steps:" -ForegroundColor Yellow
        Write-Host "1. Wait 2 minutes for Flyway migrations to complete"
        Write-Host "2. Test login: carrier@test.com / N1kk101!"
        Write-Host "3. Verify cost profile section loads"
        Write-Host "4. Run: npm run test:e2e"
    }
} else {
    Write-Host "✗ Backend deployment failed" -ForegroundColor Red
    exit 1
}
