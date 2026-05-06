# Google Cloud Production Deployment - READY

## Overview
Complete production deployment infrastructure configured for FreightClub on Google Cloud using Google Artifact Registry, Docker Compose, and Cloud SQL or external PostgreSQL.

## What's Ready

### 1. Environment Configuration System
- Externalized configuration for all environments (dev, test, prod)
- Environment variables using .env files and Spring profiles
- Development: application-dev.yml (no Docker)
- Test: application-test.yml (no Docker)
- Production: application-prod.yml (Google Cloud PostgreSQL)

### 2. Docker Configuration (Production)
- Backend Dockerfile: Multi-stage Maven build to Alpine JRE (8080 -> 9090)
- Frontend Dockerfile: Multi-stage Node build to nginx
- docker-compose.prod.yml: Google Cloud-ready orchestration
- Pulls images from Google Artifact Registry (us-central1-docker.pkg.dev)

### 3. Deployment Automation
- scripts/deploy-prod.sh: One-command production deployment to Google Cloud
- scripts/test-env-start.sh: Self-contained test environment
- scripts/test-env-stop.sh: Test cleanup
- scripts/init-db-prod.sh: Production database initialization
- scripts/init-db-test.sh: Test database initialization

### 4. CI/CD Pipeline (Google Cloud)
- .github/workflows/build-and-push-ecr.yml (now push to Google Artifact Registry)
- Triggers on: git tag (v*) or push to main
- Builds backend and frontend Docker images
- Pushes to Google Artifact Registry with version and SHA tags
- Uses Workload Identity Federation for secure authentication

### 5. Documentation
- DEPLOYMENT.md: Complete deployment guide for all environments
- GCP_DEPLOYMENT_SETUP.md: Google Cloud-specific setup and configuration
- DEPLOYMENT_CHECKLIST.md: Implementation status

## Architecture

Development (Local)
- Maven Backend (9090) + Vite Frontend (8080)
- Local PostgreSQL
- No Docker

Test (Self-Contained)
- Compiled JAR (9091) + Built Frontend (8081)
- Local PostgreSQL (freightclub_test)
- No Docker
- Startup: bash scripts/test-env-start.sh

Production (Google Cloud)
- Docker Backend (9090) from Google Artifact Registry
- Docker Frontend (80) from Google Artifact Registry
- Google Cloud SQL or external PostgreSQL
- Docker Compose Orchestration
- Deployment: bash scripts/deploy-prod.sh v1.0.0

## Current Status

### Backend Docker Build
✓ SUCCESSFUL - Backend compiles to Docker image successfully

### Frontend Docker Build
⚠ NEEDS FRONTEND CODE FIXES
- TypeScript compilation errors prevent build
- Missing 'sonner' dependency
- Unused imports and schema issues
- Must be fixed before production deployment

## Quick Start

### Development
```bash
cd backend && mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
cd frontend && npm run dev
```

### Test Environment
```bash
bash scripts/test-env-start.sh
# Frontend: localhost:8081
# Backend: localhost:9091
bash scripts/test-env-stop.sh
```

### Production (After Frontend Code Fixed)
```bash
# Set up Google Cloud (one-time)
gcloud projects create freightclub-prod
gcloud services enable artifactregistry.googleapis.com
gcloud artifacts repositories create freightclub --repository-format=docker --location=us-central1

# Trigger GitHub Actions deployment
git tag v1.0.0
git push origin v1.0.0

# Or manually deploy
export GCP_PROJECT_ID=freightclub-prod
export GCP_REGISTRY=us-central1-docker.pkg.dev
export DB_URL=jdbc:postgresql://<cloud-sql-ip>:5432/freightclub
export DB_USERNAME=freightclub_runtime
export DB_PASSWORD=<password>
export JWT_SECRET=<secret>

bash scripts/deploy-prod.sh v1.0.0
```

## Files Created/Updated (19 total)

### Configuration (8)
- backend/src/main/resources/application-test.yml
- backend/src/main/resources/application-dev.yml (updated)
- frontend/.env.development
- frontend/.env.test
- frontend/.env.production
- frontend/.env.example
- .env.example (updated for Google Cloud)
- frontend/vite.config.ts (updated)

### Docker (5)
- backend/Dockerfile (updated - port 9090)
- frontend/Dockerfile
- frontend/nginx.conf
- docker-compose.yml (updated)
- docker-compose.prod.yml (updated for Google Cloud)
- .dockerignore

### Scripts (5)
- scripts/deploy-prod.sh (updated for Google Cloud)
- scripts/init-db-prod.sh
- scripts/init-db-test.sh
- scripts/test-env-start.sh
- scripts/test-env-stop.sh

### Automation (1)
- .github/workflows/build-and-push-ecr.yml (updated for Google Cloud)

### Documentation (3)
- DEPLOYMENT.md
- GCP_DEPLOYMENT_SETUP.md (Google Cloud specific)
- DEPLOYMENT_CHECKLIST.md

## Next Steps

### 1. Fix Frontend Code
- Fix TypeScript compilation errors in src/features/carrier/
- Install missing 'sonner' dependency
- Resolve unused import warnings
- Ensure npm run build succeeds

### 2. Google Cloud Setup (One-time)
```bash
# Create project
gcloud projects create freightclub-prod
gcloud config set project freightclub-prod

# Enable APIs
gcloud services enable artifactregistry.googleapis.com cloudbuild.googleapis.com

# Create Artifact Registry repository
gcloud artifacts repositories create freightclub \
  --repository-format=docker \
  --location=us-central1

# Create Cloud SQL PostgreSQL instance
gcloud sql instances create freightclub-prod \
  --database-version=POSTGRES_16 \
  --tier=db-f1-micro \
  --region=us-central1
```

### 3. Configure GitHub Actions Secrets
Add to GitHub repository settings:
```
GCP_PROJECT_ID=freightclub-prod
GCP_WORKLOAD_IDENTITY_PROVIDER=<from GCP setup>
GCP_SERVICE_ACCOUNT=github-actions@freightclub-prod.iam.gserviceaccount.com
```

### 4. Test Locally
- Development: mvn spring-boot:run + npm run dev
- Test: bash scripts/test-env-start.sh

### 5. Deploy to Google Cloud
```bash
git tag v1.0.0
git push origin v1.0.0
# GitHub Actions builds and pushes to Google Artifact Registry
bash scripts/deploy-prod.sh v1.0.0
```

## Architecture Migration from AWS to Google Cloud

Changed from:
- AWS ECR → Google Artifact Registry
- AWS RDS → Google Cloud SQL or external PostgreSQL
- AWS EC2 → Google Cloud Compute Engine or Cloud Run
- AWS IAM + OIDC → Google Cloud Workload Identity Federation

All deployment scripts and documentation updated to use Google Cloud.

## Environment Variables (Google Cloud)

Database:
- DB_URL=jdbc:postgresql://<cloud-sql-ip>:5432/freightclub?sslmode=require
- DB_USERNAME=freightclub_runtime
- DB_PASSWORD=<secure-password>

Google Cloud:
- GCP_PROJECT_ID=freightclub-prod
- GCP_REGION=us-central1
- GCP_REGISTRY=us-central1-docker.pkg.dev

Application:
- JWT_SECRET=<32+ character secure secret>
- CORS_ALLOWED_ORIGINS=https://freightclub.app

## Support

- See GCP_DEPLOYMENT_SETUP.md for detailed Google Cloud setup
- See DEPLOYMENT.md for general deployment documentation
- Check scripts/ for individual environment setup
- Review docker-compose*.yml for orchestration details

## Deployment Flow

1. Frontend code is fixed (TypeScript compilation)
2. Push version tag: git tag v1.0.0 && git push origin v1.0.0
3. GitHub Actions:
   - Builds backend Docker image
   - Builds frontend Docker image
   - Authenticates with Google Cloud via Workload Identity
   - Pushes to Google Artifact Registry
4. Manual deployment on VPS/Compute Engine:
   - bash scripts/deploy-prod.sh v1.0.0
   - Runs database migrations
   - Pulls images from Google Artifact Registry
   - Starts services via docker-compose.prod.yml
   - Verifies health checks
