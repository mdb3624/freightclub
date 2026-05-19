#!/bin/sh
set -e

# Set default backend URL if not provided
export BACKEND_URL=${BACKEND_URL:-http://localhost:8080}
export BACKEND_HOST=${BACKEND_HOST:-localhost:8080}

echo "=== Frontend Container Startup ==="
echo "Backend URL: $BACKEND_URL"
echo "Backend Host: $BACKEND_HOST"
echo ""

# Generate config from template, substituting BACKEND_URL and BACKEND_HOST
# Escape special characters in URLs for sed
echo "Generating nginx config..."
BACKEND_URL_ESCAPED=$(printf '%s\n' "$BACKEND_URL" | sed -e 's/[\/&]/\\&/g')
BACKEND_HOST_ESCAPED=$(printf '%s\n' "$BACKEND_HOST" | sed -e 's/[\/&]/\\&/g')

cat /etc/nginx/nginx.conf.template | \
  sed "s|\${BACKEND_URL}|$BACKEND_URL_ESCAPED|g" | \
  sed "s|\${BACKEND_HOST}|$BACKEND_HOST_ESCAPED|g" > /etc/nginx/conf.d/default.conf || {
  echo "ERROR: Failed to generate nginx config"
  exit 1
}

# Debug: show generated config
echo ""
echo "Generated nginx configuration:"
head -35 /etc/nginx/conf.d/default.conf | tail -20

# Verify config syntax
echo ""
echo "Verifying nginx config..."
if ! nginx -t 2>&1; then
  echo "ERROR: Invalid nginx configuration"
  echo "Full config:"
  cat /etc/nginx/conf.d/default.conf
  exit 1
fi

echo "✓ Configuration ready"
echo "Starting nginx..."

# Start nginx
exec nginx -g "daemon off;"
