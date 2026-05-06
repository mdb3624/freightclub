# Google Cloud Deployment Setup

FreightClub is configured for production deployment on Google Cloud using Google Artifact Registry (GAR) for container images and Google Cloud PostgreSQL or external PostgreSQL for the database.

## Prerequisites

1. Google Cloud Account with:
   - Active billing enabled
   - Artifact Registry API enabled
   - Compute Engine or Cloud Run enabled

2. Local Setup:
   - gcloud CLI installed and authenticated
   - Docker installed
   - GitHub repository

## Step 1: Create Google Cloud Project

```bash
gcloud projects create freightclub-prod --name="FreightClub Production"
gcloud config set project freightclub-prod
```

## Step 2: Enable APIs

```bash
gcloud services enable   artifactregistry.googleapis.com   container.googleapis.com   cloudbuild.googleapis.com   run.googleapis.com   sqladmin.googleapis.com
```

## Step 3: Create Artifact Registry

```bash
gcloud artifacts repositories create freightclub   --repository-format=docker   --location=us-central1
```

## Step 4: Set Up GitHub Actions Authentication

Option A: Service Account with Key
```bash
gcloud iam service-accounts create github-actions --display-name="GitHub Actions"
gcloud projects add-iam-policy-binding freightclub-prod   --member="serviceAccount:github-actions@freightclub-prod.iam.gserviceaccount.com"   --role="roles/artifactregistry.writer"
```

Option B: Workload Identity Federation (Recommended)
See GCP_DEPLOYMENT_SETUP.md for detailed instructions.

## Step 5: Configure GitHub Secrets

Add to repository settings:
- GCP_PROJECT_ID=freightclub-prod
- GCP_WORKLOAD_IDENTITY_PROVIDER=<provider from Step 4>
- GCP_SERVICE_ACCOUNT=github-actions@freightclub-prod.iam.gserviceaccount.com

## Step 6: Create PostgreSQL Database

Option A: Cloud SQL (Managed)
```bash
gcloud sql instances create freightclub-prod --database-version=POSTGRES_16 --tier=db-f1-micro
gcloud sql databases create freightclub --instance=freightclub-prod
gcloud sql users create freightclub_runtime --instance=freightclub-prod
```

Option B: Self-hosted PostgreSQL
Use your own PostgreSQL instance and provide DB_URL, DB_USERNAME, DB_PASSWORD.

## Step 7: Deploy

Automatic via GitHub Actions:
```bash
git tag v1.0.0
git push origin v1.0.0
```

Manual deployment:
```bash
export GCP_PROJECT_ID=freightclub-prod
export GCP_REGION=us-central1
export GCP_REGISTRY=us-central1-docker.pkg.dev
export DB_URL=jdbc:postgresql://<ip>:5432/freightclub
export DB_USERNAME=freightclub_runtime
export DB_PASSWORD=<password>
export JWT_SECRET=<secret>

bash scripts/deploy-prod.sh v1.0.0
```

## Environment Variables

Database (Cloud SQL):
- DB_URL=jdbc:postgresql://<instance-ip>:5432/freightclub?currentSchema=freightclub&sslmode=require
- DB_USERNAME=freightclub_runtime
- DB_PASSWORD=<secure-password>

Google Cloud:
- GCP_PROJECT_ID=freightclub-prod
- GCP_REGION=us-central1
- GCP_REGISTRY=us-central1-docker.pkg.dev

Application:
- JWT_SECRET=<32+ character secure secret>
- CORS_ALLOWED_ORIGINS=https://freightclub.app

## Verify Deployment

Backend:
```bash
curl https://your-backend.run.app/actuator/health
```

Frontend:
```bash
curl https://your-frontend.run.app/
```

## Monitoring

View logs:
```bash
gcloud logging read "resource.type=cloud_run_revision" --limit=50
```

## Cleanup

```bash
gcloud run services delete freightclub-backend --region=us-central1
gcloud sql instances delete freightclub-prod
gcloud artifacts repositories delete freightclub --location=us-central1
```
