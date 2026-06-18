# Clean rebuild (no cache) and deploy
$ProjectID = "freight-club-495117"
$Region = "us-central1"
$Registry = "us-central1-docker.pkg.dev"
$ImageRepo = "$Registry/$ProjectID/freightclub-repo"
$ImageTag = "build-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

Write-Host "Clean rebuild (--no-cache) with tag: $ImageTag" -ForegroundColor Cyan
docker build --no-cache -f frontend/Dockerfile -t "$ImageRepo/freightclub-frontend:$ImageTag" -t "$ImageRepo/freightclub-frontend:latest" frontend/

Write-Host "Pushing image..." -ForegroundColor Cyan
docker push "$ImageRepo/freightclub-frontend:$ImageTag"
docker push "$ImageRepo/freightclub-frontend:latest"

Write-Host "Deploying..." -ForegroundColor Cyan
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
  --set-env-vars="BACKEND_URL=https://freightclub-backend-5gecbdg27a-uc.a.run.app,BACKEND_HOST=freightclub-backend-5gecbdg27a-uc.a.run.app" `
  --quiet

$FrontendURL = & gcloud run services describe freightclub-frontend --region=$Region --project=$ProjectID --format='value(status.url)'
Write-Host "✓ Deployed: $FrontendURL" -ForegroundColor Green
Write-Host "Image tag: $ImageTag" -ForegroundColor Green
