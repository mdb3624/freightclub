#!/bin/bash
set -e

echo "=== Starting Test Environment ==="

# Start PostgreSQL if not running
if ! pgrep -x "postgres" > /dev/null; then
  echo "Starting PostgreSQL..."
  pg_ctl -D /usr/local/var/postgres start
  sleep 5
fi

# Initialize test database
export DB_USERNAME=${DB_USERNAME:-postgres}
export DB_PASSWORD=${DB_PASSWORD:-postgres}
bash scripts/init-db-test.sh

# Kill any existing processes on test ports
pkill -f "port 9091" || true
pkill -f "port 8081" || true
sleep 2

# Build backend if needed
if [ ! -f "backend/target/freightclub-backend-*.jar" ]; then
  echo "Building backend..."
  cd backend
  JAVA_HOME="/usr/libexec/java_home" mvn package -DskipTests -q
  cd ..
fi

# Build frontend if needed
if [ ! -d "frontend/dist" ]; then
  echo "Building frontend..."
  cd frontend
  npm ci
  npm run build
  cd ..
fi

# Start backend on port 9091
echo "Starting backend on port 9091..."
export SPRING_PROFILES_ACTIVE=test
export PORT=9091
export DB_URL="jdbc:postgresql://localhost:5432/freightclub_test?currentSchema=freightclub"
java -jar backend/target/freightclub-backend-*.jar \
  --spring.profiles.active=test \
  --server.port=9091 \
  > /tmp/freightclub-backend-test.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to be ready
echo "Waiting for backend to be ready..."
for i in {1..30}; do
  if curl -s http://localhost:9091/actuator/health > /dev/null 2>&1; then
    echo "✓ Backend is ready"
    break
  fi
  echo "Attempt $i/30..."
  sleep 1
done

# Start frontend on port 8081
echo "Starting frontend on port 8081..."
cd frontend
export VITE_API_URL=http://localhost:9091
export VITE_PORT=8081
npm run preview -- --port 8081 > /tmp/freightclub-frontend-test.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"
cd ..

# Wait for frontend
sleep 3

echo ""
echo "=== Test Environment Ready ==="
echo "Backend: http://localhost:9091"
echo "Frontend: http://localhost:8081"
echo "Database: localhost:5432/freightclub_test"
echo ""
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "To stop, run: bash scripts/test-env-stop.sh"
echo "Or: kill $BACKEND_PID $FRONTEND_PID"

# Save PIDs to file
echo "$BACKEND_PID" > /tmp/freightclub-test-backend.pid
echo "$FRONTEND_PID" > /tmp/freightclub-test-frontend.pid
