#!/bin/bash
set -e

IMAGE_TAG=${1:-latest}
GCP_PROJECT_ID=${GCP_PROJECT_ID}
GCP_REGION=${GCP_REGION:-us-central1}
GCP_REGISTRY=${GCP_REGISTRY:-us-central1-docker.pkg.dev}
DEPLOYMENT_ENV=${DEPLOYMENT_ENV:-production}

if [ -z "$GCP_PROJECT_ID" ]; then
  echo "Error: GCP_PROJECT_ID environment variable not set"
  exit 1
fi

echo "=== FreightClub Production Deployment (Google Cloud) ==="
echo "Image Tag: $IMAGE_TAG"
echo "Registry: $GCP_REGISTRY/$GCP_PROJECT_ID"
echo "Environment: $DEPLOYMENT_ENV"
echo ""

# Pre-deployment checks
echo "Running pre-deployment checks..."

# Check database connectivity
if ! pg_isready -h ${DB_HOST:-localhost} -p 5432 > /dev/null 2>&1; then
  echo "Error: Cannot connect to database at ${DB_HOST:-localhost}:5432"
  exit 1
fi
echo "✓ Database connectivity verified"

# Check required environment variables
required_vars=("DB_URL" "DB_USERNAME" "DB_PASSWORD" "JWT_SECRET")
for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "Error: Required environment variable $var is not set"
    exit 1
  fi
done
echo "✓ All required environment variables set"

# Authenticate with Google Cloud
echo ""
echo "Authenticating with Google Cloud..."
gcloud auth configure-docker $GCP_REGION-docker.pkg.dev
echo "✓ Authenticated with Google Cloud"

# Run database migrations
echo ""
echo "Running database migrations..."
bash scripts/init-db-prod.sh

# Pull latest images from Google Artifact Registry
echo ""
echo "Pulling images from Google Artifact Registry..."
docker pull $GCP_REGISTRY/$GCP_PROJECT_ID/freightclub-backend:${IMAGE_TAG}
docker pull $GCP_REGISTRY/$GCP_PROJECT_ID/freightclub-frontend:${IMAGE_TAG}
echo "✓ Images pulled"

# Set image tag for docker-compose
export GCP_REGISTRY=$GCP_REGISTRY/$GCP_PROJECT_ID
export IMAGE_TAG=${IMAGE_TAG}

# Deploy
echo ""
echo "Deploying services..."
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

echo "✓ Services started"

# Wait for health checks
echo ""
echo "Waiting for services to be healthy..."
sleep 10

for i in {1..30}; do
  if docker-compose -f docker-compose.prod.yml ps | grep -E "(backend|frontend)" | grep -q "healthy"; then
    echo "✓ Services are healthy"
    break
  fi
  echo "Waiting... ($i/30)"
  sleep 2
done

# Run smoke tests
echo ""
echo "Running smoke tests..."
BACKEND_URL="http://localhost:9090"
FRONTEND_URL="http://localhost"

if curl -f ${BACKEND_URL}/actuator/health > /dev/null 2>&1; then
  echo "✓ Backend health check passed"
else
  echo "Warning: Backend health check failed"
fi

if curl -f ${FRONTEND_URL} > /dev/null 2>&1; then
  echo "✓ Frontend responds"
else
  echo "Warning: Frontend check failed"
fi

echo ""
echo "=== Deployment Complete ==="
echo "Backend: ${BACKEND_URL}"
echo "Frontend: ${FRONTEND_URL}"
echo ""
echo "To view logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "To rollback: git checkout docker-compose.prod.yml && docker-compose -f docker-compose.prod.yml pull && docker-compose -f docker-compose.prod.yml up -d"
