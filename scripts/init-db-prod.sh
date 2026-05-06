#!/bin/bash
set -e

echo "=== Initializing Production Database ==="

if [ -z "$DB_URL" ] || [ -z "$DB_USERNAME" ] || [ -z "$DB_PASSWORD" ]; then
  echo "Error: DB_URL, DB_USERNAME, and DB_PASSWORD must be set"
  exit 1
fi

echo "Database URL: $DB_URL"
echo "Running Flyway migrations..."

cd "$(dirname "$0")/.."
export SPRING_PROFILES_ACTIVE=prod

mvn flyway:migrate \
  -Dflyway.url="$DB_URL" \
  -Dflyway.user="$DB_USERNAME" \
  -Dflyway.password="$DB_PASSWORD" \
  -Dflyway.schemas=freightclub

echo "✓ Production migrations completed"
