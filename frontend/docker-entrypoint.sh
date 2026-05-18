#!/bin/sh
set -e

# Set default backend URL if not provided
export BACKEND_URL=${BACKEND_URL:-http://localhost:8080}
export BACKEND_HOST=${BACKEND_HOST:-localhost:8080}

# Generate config from template, substituting only BACKEND_URL and BACKEND_HOST
envsubst '$BACKEND_URL $BACKEND_HOST' < /etc/nginx/nginx.conf.template > /etc/nginx/conf.d/default.conf

# Verify config syntax
nginx -t || { echo "nginx config error"; cat /etc/nginx/conf.d/default.conf; exit 1; }

# Start nginx
exec nginx -g "daemon off;"
