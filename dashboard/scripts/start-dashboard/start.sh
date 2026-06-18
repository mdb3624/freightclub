#!/bin/bash

# Agile Dashboard Startup Script
# Starts both backend (3001) and frontend (3000) in parallel

set -e

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/../../.." && pwd )"

# Check if we're in the right directory
if [ ! -d "$PROJECT_ROOT/dashboard" ]; then
    echo "❌ Error: 'dashboard' directory not found"
    echo "Make sure you're running this from the project root directory"
    exit 1
fi

BACKEND_DIR="$PROJECT_ROOT/dashboard/backend"
FRONTEND_DIR="$PROJECT_ROOT/dashboard/frontend"

echo "🚀 Starting Agile Dashboard..."
echo ""

# Check and install backend dependencies if needed
if [ ! -d "$BACKEND_DIR/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd "$BACKEND_DIR"
    npm install > /dev/null 2>&1
    echo "✅ Backend dependencies installed"
else
    echo "✅ Backend dependencies ready"
fi

# Check and install frontend dependencies if needed
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd "$FRONTEND_DIR"
    npm install > /dev/null 2>&1
    echo "✅ Frontend dependencies installed"
else
    echo "✅ Frontend dependencies ready"
fi

echo ""
echo "🔧 Starting servers..."
echo ""

# Start backend in background
cd "$BACKEND_DIR"
npm run dev > "$PROJECT_ROOT/dashboard/backend.log" 2>&1 &
BACKEND_PID=$!
echo "✅ Backend server running on http://localhost:3001 (PID: $BACKEND_PID)"

# Start frontend in background
cd "$FRONTEND_DIR"
npm run dev > "$PROJECT_ROOT/dashboard/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo "✅ Frontend dashboard running on http://localhost:3000 (PID: $FRONTEND_PID)"

echo ""
echo "🌐 Opening dashboard in browser..."

# Try to open browser (cross-platform)
if command -v open &> /dev/null; then
    # macOS
    open "http://localhost:3000" 2>/dev/null || true
elif command -v xdg-open &> /dev/null; then
    # Linux
    xdg-open "http://localhost:3000" 2>/dev/null || true
elif command -v start &> /dev/null; then
    # Windows
    start "http://localhost:3000" 2>/dev/null || true
else
    echo "⚠️  Could not auto-open browser. Navigate to: http://localhost:3000"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✨ Dashboard is ready!"
echo ""
echo "Backend:  http://localhost:3001"
echo "Frontend: http://localhost:3000"
echo ""
echo "To stop both servers, run:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "Server logs are saved to:"
echo "  Backend:  $PROJECT_ROOT/dashboard/backend.log"
echo "  Frontend: $PROJECT_ROOT/dashboard/frontend.log"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Keep script running so servers stay alive
# User can Ctrl+C to stop both
wait
