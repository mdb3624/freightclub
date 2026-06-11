# Test Environment Setup

## Local Testing (mvn test)

### Prerequisites
1. PostgreSQL running on `localhost:5433` (or configure in `.env.test`)
2. Test database credentials configured in `.env.test`

### Configuration
The test profile (`-Dspring.profiles.active=test`) automatically loads `.env.test`:

```yaml
# application-test.yml
spring:
  config:
    import: optional:file:.env.test  # Loads environment variables
```

### Running Tests Locally
```bash
cd backend
mvn clean test                    # Uses .env.test for DB connection
mvn test -Dtest=YourTestClass   # Run specific test
```

## Docker-Compose Testing

### Setup
```bash
docker compose -f docker-compose.test.yml down -v  # Clean slate
docker compose -f docker-compose.test.yml up -d --build
```

### Services
- **test-db** (port 5433): PostgreSQL 16 with PostGIS
  - Database: `freightclub_test`
  - User: `freightclub_runtime`
  - Password: `freightclub`

- **backend-tester**: Maven container running tests
  - Mounts `./backend` as volume
  - Uses Docker-internal network (`test-db:5432`)
  - Logs accessible via `docker logs freightclub-tester`

- **frontend-test** (port 9090): Vite dev server
  - Live mounts `./frontend` source
  - Connects to backend-test on port 9091

### Running Tests in Docker
```bash
# Tests run automatically on container startup
docker compose -f docker-compose.test.yml up backend-tester

# View test output
docker logs -f freightclub-tester

# Stop and clean
docker compose -f docker-compose.test.yml down -v
```

## Troubleshooting

### "Failed to connect to database"
- **Local:** Verify PostgreSQL is running on port 5433, check `.env.test` credentials
- **Docker:** Ensure `test-db` service is healthy: `docker compose -f docker-compose.test.yml ps`

### ".env.test not found"
- This is **expected** if not running tests locally — the `optional:` prefix allows graceful fallback
- For local testing, ensure `.env.test` exists in project root (NOT in git)

### "Tests run but database is empty"
- Flyway migrations must complete before tests
- Check `docker logs freightclub-test-db` for initialization errors
- Verify `spring.flyway.enabled=true` in `application-test.yml`

## Security

⚠️ **`.env.test` contains credentials and is in `.gitignore` — never commit it to version control.**

Each developer maintains their own `.env.test` with local test database credentials.
