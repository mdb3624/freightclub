#!/bin/bash
set -e

echo "=== Initializing Test Database ==="

# Create test database if it doesn't exist
PGPASSWORD=${DB_PASSWORD:-postgres} psql -h localhost -U ${DB_USERNAME:-postgres} -tc "SELECT 1 FROM pg_database WHERE datname = 'freightclub_test'" | grep -q 1 || \
  PGPASSWORD=${DB_PASSWORD:-postgres} psql -h localhost -U ${DB_USERNAME:-postgres} -c "CREATE DATABASE freightclub_test"

echo "✓ Test database created/verified"

# Run Flyway migrations
cd "$(dirname "$0")/.."
export SPRING_PROFILES_ACTIVE=test
export PORT=9091

echo "Running Flyway migrations for test environment..."
mvn flyway:migrate \
  -Dflyway.url="jdbc:postgresql://localhost:5432/freightclub_test?currentSchema=freightclub" \
  -Dflyway.user=${DB_USERNAME:-postgres} \
  -Dflyway.password=${DB_PASSWORD:-postgres} \
  -Dflyway.schemas=freightclub

echo "✓ Migrations completed"
