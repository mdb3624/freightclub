#!/bin/sh
set -e

# Set defaults
BACKEND_URL=${BACKEND_URL:-http://localhost:8080}
BACKEND_HOST=${BACKEND_HOST:-localhost:8080}

echo "Frontend starting..."
echo "Backend: $BACKEND_URL"

# Copy template and substitute variables
if [ -f /etc/nginx/nginx.conf.template ]; then
  cp /etc/nginx/nginx.conf.template /etc/nginx/conf.d/default.conf

  # Use sed with careful escaping
  sed -i "s|\${BACKEND_URL}|$BACKEND_URL|g" /etc/nginx/conf.d/default.conf
  sed -i "s|\${BACKEND_HOST}|$BACKEND_HOST|g" /etc/nginx/conf.d/default.conf
else
  echo "ERROR: nginx.conf.template not found"
  exit 1
fi

# Test config
if ! nginx -t >/dev/null 2>&1; then
  echo "ERROR: nginx config invalid"
  nginx -t
  exit 1
fi

# Start nginx
exec nginx -g "daemon off;"
