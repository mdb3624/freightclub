#!/bin/bash
set -e

PROJECT_ID="freight-club-495117"
REGION="us-central1"
REGISTRY="us-central1-docker.pkg.dev"
REPO="$REGISTRY/$PROJECT_ID/freightclub-repo"
IMAGE_TAG="latest"

echo "=== FreightClub US-757 Production Deployment ==="
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo ""

echo "Deploying backend..."
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
  --set-env-vars "SPRING_PROFILES_ACTIVE=prod,DB_URL=jdbc:postgresql://ep-lively-tree-amv4cqt0.c-5.us-east-1.aws.neon.tech/freightclub_db?sslmode=require&currentSchema=freightclub,DB_USERNAME=neondb_owner,DB_PASSWORD=npg_H0O3SomrgjPK,APP_JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970,JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970,JWT_ISSUER=freightclub,JWT_AUDIENCE=freightclub-api,JWT_ACCESS_EXPIRY_MS=900000,JWT_REFRESH_EXPIRY_MS=604800000,CORS_ALLOWED_ORIGINS=https://freightclub.app|https://freightclub-frontend-404925591110.us-central1.run.app" \
  --quiet

echo "✓ Backend deployed"

BACKEND_URL=$(gcloud run services describe freightclub-backend --region=$REGION --project=$PROJECT_ID --format='value(status.url)')
BACKEND_HOST=$(echo $BACKEND_URL | sed 's|https://||')

echo "Backend URL: $BACKEND_URL"
echo ""

echo "Deploying frontend..."
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
  --set-env-vars="BACKEND_URL=$BACKEND_URL,BACKEND_HOST=$BACKEND_HOST" \
  --quiet

echo "✓ Frontend deployed"

FRONTEND_URL=$(gcloud run services describe freightclub-frontend --region=$REGION --project=$PROJECT_ID --format='value(status.url)')

echo ""
echo "=== Deployment Complete ==="
echo "Backend:  $BACKEND_URL"
echo "Frontend: $FRONTEND_URL"
echo ""
echo "Next: Test login with carrier@test.com / N1kk101!"
