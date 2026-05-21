#!/bin/bash
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== FreightClub Integration Test Suite ===${NC}"

# Function to cleanup on exit
cleanup() {
  echo -e "${YELLOW}Cleaning up Docker containers...${NC}"
  docker-compose -f docker-compose.test.yml down --remove-orphans 2>/dev/null || true
}
trap cleanup EXIT

# Start containers
echo -e "${YELLOW}Starting Docker containers...${NC}"
docker-compose -f docker-compose.test.yml down --remove-orphans 2>/dev/null || true
docker-compose -f docker-compose.test.yml up -d

# Wait for services to be healthy
echo -e "${YELLOW}Waiting for services to be healthy...${NC}"
max_attempts=60
attempt=0
while [ $attempt -lt $max_attempts ]; do
  db_health=$(docker-compose -f docker-compose.test.yml ps db-test 2>/dev/null | grep healthy || echo "")
  backend_health=$(docker-compose -f docker-compose.test.yml ps backend-test 2>/dev/null | grep healthy || echo "")
  frontend_health=$(docker-compose -f docker-compose.test.yml ps frontend-test 2>/dev/null | grep healthy || echo "")

  if [ ! -z "$db_health" ] && [ ! -z "$backend_health" ] && [ ! -z "$frontend_health" ]; then
    echo -e "${GREEN}✓ All services are healthy${NC}"
    break
  fi

  attempt=$((attempt + 1))
  if [ $((attempt % 10)) -eq 0 ]; then
    echo "Still waiting... ($attempt/${max_attempts})"
  fi
  sleep 1
done

if [ $attempt -eq $max_attempts ]; then
  echo -e "${RED}✗ Services failed to reach healthy state${NC}"
  docker-compose -f docker-compose.test.yml logs
  exit 1
fi

sleep 5

# Run backend integration tests
echo -e "${YELLOW}Running backend integration tests...${NC}"
cd "$PROJECT_ROOT/backend"
mvn clean test -Dspring.profiles.active=test 2>&1 | tail -100 || {
  echo -e "${RED}✗ Backend tests failed${NC}"
  cd "$PROJECT_ROOT"
  docker-compose -f docker-compose.test.yml logs backend-test
  exit 1
}
echo -e "${GREEN}✓ Backend tests passed${NC}"
cd "$PROJECT_ROOT"

# Run frontend unit tests
echo -e "${YELLOW}Running frontend unit tests...${NC}"
cd "$PROJECT_ROOT/frontend"
npm test 2>&1 | tail -50 || {
  echo -e "${RED}✗ Frontend unit tests failed${NC}"
  exit 1
}
echo -e "${GREEN}✓ Frontend unit tests passed${NC}"
cd "$PROJECT_ROOT"

# Run Puppeteer verification
echo -e "${YELLOW}Running Puppeteer integration verification...${NC}"
if [ -f "$PROJECT_ROOT/frontend/verify-fixes.cjs" ]; then
  cd "$PROJECT_ROOT/frontend"
  node verify-fixes.cjs 2>&1 || {
    echo -e "${RED}✗ Puppeteer verification failed${NC}"
    exit 1
  }
  echo -e "${GREEN}✓ Puppeteer verification passed${NC}"
  cd "$PROJECT_ROOT"
else
  echo -e "${YELLOW}⚠ Puppeteer script not found at verify-fixes.cjs${NC}"
fi

echo -e "${GREEN}=== All integration tests passed ===${NC}"
