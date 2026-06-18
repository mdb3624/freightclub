#!/bin/bash
set -e

GCP_REGISTRY=$(grep GCP_REGISTRY .env.prod | cut -d'=' -f2)
IMAGE_TAG="latest"

echo "🔨 Building and pushing Docker images..."
echo "Registry: $GCP_REGISTRY"
echo ""

# Configure Docker for Artifact Registry
echo "Configuring Docker authentication..."
gcloud auth configure-docker us-central1-docker.pkg.dev

# Build and push backend
echo ""
echo "📦 Building backend image..."
docker build --no-cache -t ${GCP_REGISTRY}/freightclub-backend:${IMAGE_TAG} -f backend/Dockerfile backend/

echo "📤 Pushing backend image..."
docker push ${GCP_REGISTRY}/freightclub-backend:${IMAGE_TAG}
echo "✅ Backend image pushed"

# Build and push frontend
echo ""
echo "📦 Building frontend image..."
docker build --no-cache -t ${GCP_REGISTRY}/freightclub-frontend:${IMAGE_TAG} -f frontend/Dockerfile frontend/

echo "📤 Pushing frontend image..."
docker push ${GCP_REGISTRY}/freightclub-frontend:${IMAGE_TAG}
echo "✅ Frontend image pushed"

echo ""
echo "🎉 All images built and pushed successfully!"
