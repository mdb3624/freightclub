#!/bin/sh
set -e

# Set default backend URL if not provided
export BACKEND_URL=${BACKEND_URL:-http://localhost:8080}
export BACKEND_HOST=${BACKEND_HOST:-localhost:8080}

echo "=== Frontend Container Startup ==="
echo "Backend URL: $BACKEND_URL"
echo "Backend Host: $BACKEND_HOST"
echo ""

# Generate config from template, substituting only BACKEND_URL and BACKEND_HOST
echo "Generating nginx config..."
envsubst '$BACKEND_URL $BACKEND_HOST' < /etc/nginx/nginx.conf.template > /etc/nginx/conf.d/default.conf || {
  echo "ERROR: Failed to generate nginx config"
  exit 1
}

# Verify config syntax
echo "Verifying nginx config..."
nginx -t || {
  echo "ERROR: Invalid nginx configuration"
  cat /etc/nginx/conf.d/default.conf
  exit 1
}

echo "✓ Configuration ready"
echo "Starting nginx..."

# Start nginx
exec nginx -g "daemon off;"
