# FreightClub Deployment Guide

This document covers deployment across three environments: Production (Docker on AWS), Test (self-contained), and Development (local).

## Environment Comparison

| Aspect | Development | Test | Production |
|--------|-------------|------|------------|
| Docker | No | No | Yes (ECR) |
| Database | Local PostgreSQL | Local PostgreSQL | AWS RDS |
| Frontend | npm dev (8080) | Compiled (8081) | Nginx (80) |
| Backend | Maven (9090) | JAR (9091) | Docker (9090) |
| Profile | application-dev.yml | application-test.yml | application-prod.yml |

## Development Environment

Start backend:
```bash
cd backend
SPRING_PROFILES_ACTIVE=dev mvn spring-boot:run
# Runs on http://localhost:9090
```

Start frontend:
```bash
cd frontend
npm run dev
# Runs on http://localhost:8080 with Vite proxy to backend
```

Or use Docker Compose:
```bash
docker-compose up -d
# Backend: localhost:9090
# Frontend (via Vite): localhost:8080 (proxied)
# PostgreSQL: localhost:5432
```

## Test Environment

Start:
```bash
bash scripts/test-env-start.sh
# Backend: http://localhost:9091
# Frontend: http://localhost:8081
# Database: localhost:5432/freightclub_test
```

Stop:
```bash
bash scripts/test-env-stop.sh
```

## Production Environment

### Prerequisites
- AWS Account with ECR
- EC2 instance with Docker/Docker Compose
- AWS RDS PostgreSQL (or local PostgreSQL)

### Configure Environment Variables
```bash
export AWS_ECR_REGISTRY=123456789012.dkr.ecr.us-east-1.amazonaws.com
export IMAGE_TAG=v1.0.0
export DB_URL=jdbc:postgresql://rds-endpoint:5432/freightclub
export DB_USERNAME=freightclub_runtime
export DB_PASSWORD=<secure-password>
export JWT_SECRET=<secure-32-char-secret>
export CORS_ALLOWED_ORIGINS=https://freightclub.app
```

### Deploy

Using deployment script (recommended):
```bash
bash scripts/deploy-prod.sh v1.0.0
```

Manual deployment:
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $AWS_ECR_REGISTRY

# Pull and start
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

### Verify
```bash
# Check services
docker-compose -f docker-compose.prod.yml ps

# Backend health
curl http://localhost:9090/actuator/health

# Frontend
curl http://localhost/

# View logs
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Rollback
```bash
export IMAGE_TAG=v0.9.9
docker-compose -f docker-compose.prod.yml down
bash scripts/deploy-prod.sh v0.9.9
```

## CI/CD Pipeline

GitHub Actions workflow in `.github/workflows/build-and-push-ecr.yml`:
- Triggers on: Push tag `v*` or push to main
- Builds Docker images (backend & frontend)
- Pushes to AWS ECR with version and git SHA tags

To trigger:
```bash
git tag v1.0.0
git push origin v1.0.0
```

Then deploy:
```bash
bash scripts/deploy-prod.sh v1.0.0
```

## Database Migrations

Migrations run automatically during deployment via Flyway.

Manual migration (if needed):
```bash
# Development
bash scripts/init-db-dev.sh

# Test
bash scripts/init-db-test.sh

# Production
bash scripts/init-db-prod.sh
```

## Troubleshooting

Backend won't start:
```bash
docker-compose -f docker-compose.prod.yml logs backend
# Check: DB_URL, DB_USERNAME, DB_PASSWORD, PORT 9090 available
```

Frontend shows 404:
```bash
docker-compose -f docker-compose.prod.yml logs frontend
# Check nginx.conf and frontend build
```

Port already in use:
```bash
lsof -i :9090  # Find process
kill -9 <PID>
```

Database connection failed:
```bash
# Verify connectivity
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USERNAME -d freightclub -c "SELECT 1"
```

## Configuration Reference

Environment Variables:
- `.env.example` - Template for all variables
- `JWT_SECRET` - Min 32 chars, securely generated
- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` - Database connection
- `CORS_ALLOWED_ORIGINS` - Allowed origins for frontend
- `SPRING_PROFILES_ACTIVE` - dev, test, or prod
- `PORT` - Backend port (default 9090)

Configuration Files:
- `backend/src/main/resources/application-*.yml` - Spring Boot profiles
- `frontend/.env.*` - Vite environment files
- `docker-compose.yml` - Local development
- `docker-compose.prod.yml` - Production
- `frontend/nginx.conf` - Frontend nginx config
- `frontend/Dockerfile` - Frontend build
- `backend/Dockerfile` - Backend build
