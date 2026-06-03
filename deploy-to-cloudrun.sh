#!/bin/bash
set -e

# Cloud Run deployment script for freightclub
# Deploys latest images from Google Artifact Registry to Cloud Run

PROJECT_ID=$(grep GCP_PROJECT_ID .env.prod | cut -d'=' -f2)
GCP_REGISTRY=$(grep GCP_REGISTRY .env.prod | cut -d'=' -f2)
REGION="us-central1"

BACKEND_SERVICE="freightclub-backend"
FRONTEND_SERVICE="freightclub-frontend"
BACKEND_IMAGE="${GCP_REGISTRY}/freightclub-backend:latest"
FRONTEND_IMAGE="${GCP_REGISTRY}/freightclub-frontend:latest"

echo "Deploying to Cloud Run..."
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# Deploy backend
echo "Deploying backend service..."
gcloud run deploy $BACKEND_SERVICE \
  --image=$BACKEND_IMAGE \
  --platform=managed \
  --region=$REGION \
  --project=$PROJECT_ID \
  --allow-unauthenticated \
  --set-env-vars="SPRING_PROFILES_ACTIVE=prod" \
  --update-secrets="DB_URL=DB_URL:latest,DB_USERNAME=DB_USERNAME:latest,DB_PASSWORD=DB_PASSWORD:latest,APP_JWT_SECRET=APP_JWT_SECRET:latest" \
  --memory=1Gi \
  --cpu=1 \
  --timeout=3600 \
  --max-instances=10

BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE --platform=managed --region=$REGION --project=$PROJECT_ID --format='value(status.url)')
echo "Backend deployed: $BACKEND_URL"
echo ""

# Deploy frontend
echo "Deploying frontend service..."
gcloud run deploy $FRONTEND_SERVICE \
  --image=$FRONTEND_IMAGE \
  --platform=managed \
  --region=$REGION \
  --project=$PROJECT_ID \
  --allow-unauthenticated \
  --set-env-vars="BACKEND_URL=${BACKEND_URL},BACKEND_HOST=$(echo $BACKEND_URL | sed 's|https://||')" \
  --memory=512Mi \
  --cpu=1 \
  --timeout=3600 \
  --max-instances=10

FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE --platform=managed --region=$REGION --project=$PROJECT_ID --format='value(status.url)')
echo "Frontend deployed: $FRONTEND_URL"
echo ""

# Smoke tests
echo "Running smoke tests..."
echo "Backend health check..."
curl -s "$BACKEND_URL/actuator/health" | jq .

echo ""
echo "Frontend availability check..."
curl -s -I "$FRONTEND_URL" | head -1

echo ""
echo "✅ Deployment complete!"
echo "Backend: $BACKEND_URL"
echo "Frontend: $FRONTEND_URL"
