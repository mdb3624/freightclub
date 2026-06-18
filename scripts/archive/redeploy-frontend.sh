#!/bin/bash
set -e

PROJECT_ID="freight-club-495117"
REGION="us-central1"
REPO="us-central1-docker.pkg.dev/$PROJECT_ID/freightclub-repo"
IMAGE_TAG="latest"

echo "=== Redeploying Frontend Service ==="

# Get current backend URL
BACKEND_URL="https://freightclub-backend-5gecbdg27a-uc.a.run.app"
BACKEND_HOST=$(echo $BACKEND_URL | sed 's|https://||')

echo "Backend URL: $BACKEND_URL"
echo "Backend Host: $BACKEND_HOST"
echo ""

# Delete and redeploy frontend
echo "Clearing previous frontend service..."
gcloud run services delete freightclub-frontend --region=$REGION --project=$PROJECT_ID --quiet 2>/dev/null || true

sleep 3

echo "Deploying frontend service..."
gcloud run deploy freightclub-frontend \
  --image=$REPO/freightclub-frontend:$IMAGE_TAG \
  --platform=managed \
  --region=$REGION \
  --project=$PROJECT_ID \
  --memory=512Mi \
  --cpu=1 \
  --timeout=120 \
  --max-instances=10 \
  --allow-unauthenticated \
  --set-env-vars="BACKEND_URL=$BACKEND_URL,BACKEND_HOST=$BACKEND_HOST"

echo "✓ Frontend deployed"

sleep 5
FRONTEND_URL=$(gcloud run services describe freightclub-frontend --region=$REGION --project=$PROJECT_ID --format='value(status.url)')

echo ""
echo "=== Frontend Deployment Complete ==="
echo "Frontend: $FRONTEND_URL"
echo ""
echo "Test: $FRONTEND_URL/login"
