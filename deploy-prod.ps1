# FreightClub Production Deployment Script
# Deploys backend and frontend to Google Cloud Run
#
# PRE-REQUISITE: Images must already be built (--no-cache) and pushed to Artifact
# Registry as freightclub-backend:latest / freightclub-frontend:latest before running
# this script. This script only deploys; it does not build. Sequence:
#   1. mvn clean package -DskipTests            (backend/)
#   2. npm run build                             (frontend/)
#   3. docker build --no-cache -t $ImageRepo/freightclub-backend:latest ./backend
#      docker build --no-cache -t $ImageRepo/freightclub-frontend:latest ./frontend
#   4. docker push $ImageRepo/freightclub-backend:latest
#      docker push $ImageRepo/freightclub-frontend:latest
#   5. .\deploy-prod.ps1
#
# --no-cache is mandatory: a cached `docker build` can silently redeploy stale
# application code even when the image tag and gcloud output look correct.
#
# Secrets are pulled from Secret Manager at deploy time — never hardcode
# credentials in this file. (2026-05-19 -> 2026-07-11: this script previously had
# DB_PASSWORD/APP_JWT_SECRET/JWT_SECRET hardcoded in plaintext and committed to git.
# Those values must be rotated; see project security follow-up.)

$ProjectID = "freight-club-495117"
$Region = "us-central1"
$Registry = "us-central1-docker.pkg.dev"
$ImageRepo = "$Registry/$ProjectID/freightclub-repo"
$ImageTag = "latest"

Write-Host "=== FreightClub Production Deployment ===" -ForegroundColor Green
Write-Host "Project: $ProjectID"
Write-Host "Region: $Region"
Write-Host "Image Tag: $ImageTag"
Write-Host ""

# Secrets are bound as live Secret Manager references (--set-secrets), never
# resolved to plaintext and baked into the revision spec.
$SecretRefs = "DB_URL=DB_URL:latest,DB_USERNAME=DB_USERNAME:latest,DB_PASSWORD=DB_PASSWORD:latest,APP_JWT_SECRET=APP_JWT_SECRET:latest,JWT_SECRET=APP_JWT_SECRET:latest"

$BackendUrl = "freightclub-backend-5gecbdg27a-uc.a.run.app"
$BackendUrlAlt = "freightclub-backend-404925591110.us-central1.run.app"
$FrontendUrl = "freightclub-frontend-5gecbdg27a-uc.a.run.app"
$FrontendUrlAlt = "freightclub-frontend-404925591110.us-central1.run.app"

# CORS_ALLOWED_ORIGINS contains commas -> must use --env-vars-file, not --set-env-vars
# (a bare --set-env-vars with comma-joined origins silently corrupts the value)
$BackendEnvVarsContent = @"
SPRING_PROFILES_ACTIVE: prod
CORS_ALLOWED_ORIGINS: https://freightclub.app,https://$FrontendUrl,https://$FrontendUrlAlt
"@
$BackendEnvVarsFile = "$env:TEMP\freightclub-backend-env.txt"
[System.IO.File]::WriteAllText($BackendEnvVarsFile, $BackendEnvVarsContent)

Write-Host "Deploying Backend Service..." -ForegroundColor Cyan
gcloud run deploy freightclub-backend `
  --image="$ImageRepo/freightclub-backend:$ImageTag" `
  --platform=managed `
  --region=$Region `
  --project=$ProjectID `
  --memory=2Gi `
  --cpu=1 `
  --timeout=600 `
  --max-instances=10 `
  --allow-unauthenticated `
  --set-secrets=$SecretRefs `
  --env-vars-file=$BackendEnvVarsFile `
  --quiet

Remove-Item -Force $BackendEnvVarsFile

if ($LASTEXITCODE -ne 0) {
    Write-Host "Backend deployment failed" -ForegroundColor Red
    exit 1
}

Write-Host "Backend deployed successfully" -ForegroundColor Green
$BackendServiceUrl = & gcloud run services describe freightclub-backend --region=$Region --project=$ProjectID --format='value(status.url)'
Write-Host "Backend URL: $BackendServiceUrl"
Write-Host ""

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
  --quiet

if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend deployment failed" -ForegroundColor Red
    exit 1
}

Write-Host "Frontend deployed successfully" -ForegroundColor Green
$FrontendServiceUrl = & gcloud run services describe freightclub-frontend --region=$Region --project=$ProjectID --format='value(status.url)'
Write-Host "Frontend URL: $FrontendServiceUrl"
Write-Host ""

Write-Host "=== Deployment Complete ===" -ForegroundColor Green
Write-Host "Backend: $BackendServiceUrl"
Write-Host "Frontend: $FrontendServiceUrl"
Write-Host ""

# Smoke test
Write-Host "Running health check..." -ForegroundColor Yellow
$HealthUrl = "https://freightclub-backend-5gecbdg27a-uc.a.run.app/actuator/health"
try {
    $response = Invoke-WebRequest -Uri $HealthUrl -UseBasicParsing -TimeoutSec 15
    Write-Host "Health check passed (HTTP $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}
