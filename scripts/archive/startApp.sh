#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

BACKEND_PORT=9090
FRONTEND_PORT=8080
JAR="backend/target/freightclub-backend-0.0.1-SNAPSHOT.jar"
LOG_DIR="$SCRIPT_DIR/logs"
mkdir -p "$LOG_DIR"

# Load environment variables from .env if present
if [ -f "$SCRIPT_DIR/.env" ]; then
  set -a
  source "$SCRIPT_DIR/.env"
  set +a
fi

echo "=== FreightClub Startup ==="

# --- Kill existing processes on backend port and frontend port range ---
echo "[1/5] Stopping existing services on ports $BACKEND_PORT and $FRONTEND_PORT-$((FRONTEND_PORT + 3))..."
kill_port() {
  local port=$1
  local pid
  pid=$(netstat -ano 2>/dev/null | awk "\$2 ~ /:${port}\$/ && \$4 == \"LISTENING\" {print \$5}" | head -1)
  if [ -n "$pid" ]; then
    echo "  Killing PID $pid on port $port"
    taskkill //F //PID "$pid" || echo "  WARNING: taskkill failed for PID $pid (may need elevated privileges)"
  fi
}

for port in $BACKEND_PORT $FRONTEND_PORT $((FRONTEND_PORT+1)) $((FRONTEND_PORT+2)) $((FRONTEND_PORT+3)); do
  kill_port "$port"
done
sleep 2

# Verify frontend port is free
if netstat -ano 2>/dev/null | awk '$2 ~ /:'"$FRONTEND_PORT"'$/ && $4 == "LISTENING"' | grep -q .; then
  echo "  WARNING: Port $FRONTEND_PORT still occupied. Vite may bind to a fallback port."
fi

# --- Build backend ---
echo "[2/5] Building backend (skip tests)..."
/c/tools/apache-maven-3.9.9/bin/mvn package -Dmaven.test.skip=true -q -f backend/pom.xml
echo "  Build complete."

# --- Start backend ---
echo "[3/5] Starting backend..."
bash -c '"$JAVA_HOME/bin/java" -jar "$JAR" --spring.profiles.active=dev > "$LOG_DIR/backend.log" 2>&1' &
BACKEND_PID=$!
echo "  PID: $BACKEND_PID  |  Log: logs/backend.log"

# --- Wait for backend ---
echo "[4/5] Waiting for backend to be ready..."
sleep 5
for i in $(seq 1 40); do
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$BACKEND_PORT/actuator/health 2>/dev/null | tr -d '\r')
  if [ "$HTTP_STATUS" = "401" ] || [ "$HTTP_STATUS" = "200" ]; then
    echo "  Backend ready (HTTP $HTTP_STATUS)"
    break
  fi
  if [ $i -eq 40 ]; then
    echo "  ERROR: Backend did not start in 80 seconds. Last 20 lines of log:"
    tail -20 "$LOG_DIR/backend.log"
    exit 1
  fi
  printf "."
  sleep 2
done

# --- Start frontend ---
echo "[5/5] Starting frontend..."
cd frontend
nohup npm run dev > "$LOG_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
cd ..
echo "  PID: $FRONTEND_PID  |  Log: logs/frontend.log"

echo ""
echo "Both services running:"
echo "  Backend  → http://localhost:$BACKEND_PORT   (PID $BACKEND_PID)"
echo "  Frontend → http://localhost:$FRONTEND_PORT  (PID $FRONTEND_PID)"
echo ""
echo "To tail logs:"
echo "  tail -f logs/backend.log"
echo "  tail -f logs/frontend.log"
