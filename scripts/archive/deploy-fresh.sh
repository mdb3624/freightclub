#!/bin/bash
set -e

PROJECT_ID="freight-club-495117"
REGION="us-central1"
REPO="us-central1-docker.pkg.dev/$PROJECT_ID/freightclub-repo"
IMAGE_TAG="latest"

echo "=== FreightClub US-757 Production Deployment ==="

# Delete existing service to clear old config
echo "Clearing previous backend service..."
gcloud run services delete freightclub-backend --region=$REGION --project=$PROJECT_ID --quiet 2>/dev/null || true
sleep 2

# Deploy fresh backend
echo "Deploying fresh backend service..."
gcloud run deploy freightclub-backend \
  --image=$REPO/freightclub-backend:$IMAGE_TAG \
  --platform=managed \
  --region=$REGION \
  --project=$PROJECT_ID \
  --memory=1Gi \
  --cpu=1 \
  --timeout=3600 \
  --max-instances=10 \
  --allow-unauthenticated \
  --set-env-vars='SPRING_PROFILES_ACTIVE=prod,DB_USERNAME=neondb_owner,DB_PASSWORD=npg_H0O3SomrgjPK,APP_JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970,JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970,JWT_ISSUER=freightclub,JWT_AUDIENCE=freightclub-api,JWT_ACCESS_EXPIRY_MS=900000,JWT_REFRESH_EXPIRY_MS=604800000,CORS_ALLOWED_ORIGINS=https://freightclub.app|https://freightclub-frontend-404925591110.us-central1.run.app' \
  --set-env-vars='DB_URL=jdbc:postgresql://ep-lively-tree-amv4cqt0.c-5.us-east-1.aws.neon.tech/freightclub_db?sslmode=require&currentSchema=freightclub'

echo "✓ Backend deployed"

sleep 5
BACKEND_URL=$(gcloud run services describe freightclub-backend --region=$REGION --project=$PROJECT_ID --format='value(status.url)')
BACKEND_HOST=$(echo $BACKEND_URL | sed 's|https://||')

echo "Backend URL: $BACKEND_URL"
echo ""

# Delete and redeploy frontend
echo "Clearing previous frontend service..."
gcloud run services delete freightclub-frontend --region=$REGION --project=$PROJECT_ID --quiet 2>/dev/null || true
sleep 2

echo "Deploying fresh frontend service..."
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
echo "=== Deployment Complete ==="
echo "Backend:  $BACKEND_URL"
echo "Frontend: $FRONTEND_URL"
echo ""
echo "Test: curl $BACKEND_URL/actuator/health"
