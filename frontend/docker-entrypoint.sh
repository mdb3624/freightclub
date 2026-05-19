#!/bin/sh
set -e

# Set default backend URL if not provided
export BACKEND_URL=${BACKEND_URL:-http://localhost:8080}
export BACKEND_HOST=${BACKEND_HOST:-localhost:8080}

echo "=== Frontend Container Startup ==="
echo "Backend URL: $BACKEND_URL"
echo "Backend Host: $BACKEND_HOST"
echo ""

# Generate config from template
# Use awk for safe variable substitution
echo "Generating nginx config..."
awk -v backend_url="$BACKEND_URL" -v backend_host="$BACKEND_HOST" \
  '{
    gsub(/\$\{BACKEND_URL\}/, backend_url);
    gsub(/\$\{BACKEND_HOST\}/, backend_host);
    print;
  }' \
  /etc/nginx/nginx.conf.template > /etc/nginx/conf.d/default.conf

if [ ! -s /etc/nginx/conf.d/default.conf ]; then
  echo "ERROR: Failed to generate config (empty file)"
  exit 1
fi

# Verify config syntax
echo "Verifying nginx config..."
if ! nginx -t 2>&1; then
  echo "ERROR: Invalid nginx configuration"
  echo "Config content:"
  cat /etc/nginx/conf.d/default.conf
  exit 1
fi

echo "✓ Configuration valid"
echo "Starting nginx..."

# Start nginx
exec nginx -g "daemon off;"
