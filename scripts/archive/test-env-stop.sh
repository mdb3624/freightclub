#!/bin/bash

echo "=== Stopping Test Environment ==="

# Kill processes from PID files
if [ -f /tmp/freightclub-test-backend.pid ]; then
  BACKEND_PID=$(cat /tmp/freightclub-test-backend.pid)
  kill $BACKEND_PID 2>/dev/null || true
  rm /tmp/freightclub-test-backend.pid
  echo "✓ Stopped backend ($BACKEND_PID)"
fi

if [ -f /tmp/freightclub-test-frontend.pid ]; then
  FRONTEND_PID=$(cat /tmp/freightclub-test-frontend.pid)
  kill $FRONTEND_PID 2>/dev/null || true
  rm /tmp/freightclub-test-frontend.pid
  echo "✓ Stopped frontend ($FRONTEND_PID)"
fi

# Fallback: kill by port
pkill -f "port 9091" || true
pkill -f "port 8081" || true

echo "=== Test Environment Stopped ==="
