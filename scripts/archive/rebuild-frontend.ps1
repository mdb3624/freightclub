# Rebuild and deploy frontend with header fix
$ProjectID = "freight-club-495117"
$Region = "us-central1"
$Registry = "us-central1-docker.pkg.dev"
$ImageRepo = "$Registry/$ProjectID/freightclub-repo"
$ImageTag = "latest"

Write-Host "Building frontend Docker image..." -ForegroundColor Cyan
docker build -f frontend/Dockerfile -t "$ImageRepo/freightclub-frontend:$ImageTag" frontend/

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Frontend image built successfully" -ForegroundColor Green

    Write-Host "Pushing frontend image to registry..." -ForegroundColor Cyan
    docker push "$ImageRepo/freightclub-frontend:$ImageTag"

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Frontend image pushed successfully" -ForegroundColor Green

        Write-Host "Deploying frontend service to Cloud Run..." -ForegroundColor Cyan
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

        if ($LASTEXITCODE -eq 0) {
            $FrontendURL = & gcloud run services describe freightclub-frontend --region=$Region --project=$ProjectID --format='value(status.url)'
            Write-Host "✓ Frontend deployed successfully" -ForegroundColor Green
            Write-Host "Frontend URL: $FrontendURL" -ForegroundColor Green
        }
    }
}
