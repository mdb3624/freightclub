#!/bin/sh
set -e

BACKEND_URL=${BACKEND_URL:-http://localhost:8080}
BACKEND_HOST=${BACKEND_HOST:-localhost:8080}

echo "Frontend starting: $BACKEND_URL"

# Generate nginx config directly without any template file or sed
cat > /etc/nginx/conf.d/default.conf << 'NGINX_CONFIG'
server {
    listen 8080;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/css text/javascript application/javascript application/json;
    gzip_vary on;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Spring Security handles all CORS including OPTIONS preflight
    location /api/ {
        proxy_pass BACKEND_URL_PLACEHOLDER/api/;
        proxy_set_header Host BACKEND_HOST_PLACEHOLDER;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Service worker kill-switch: must never be cached, so browsers with a
    # stale service worker from a previous site on this domain can actually
    # fetch the replacement and unregister it. Exact-match locations take
    # priority over the regex asset-caching block below.
    location = /sw.js {
        add_header Cache-Control "no-cache";
    }
    location = /service-worker.js {
        add_header Cache-Control "no-cache";
    }
    location = /serviceworker.js {
        add_header Cache-Control "no-cache";
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINX_CONFIG

# Now substitute the variables using sed
sed -i "s|BACKEND_URL_PLACEHOLDER|$BACKEND_URL|g" /etc/nginx/conf.d/default.conf
sed -i "s|BACKEND_HOST_PLACEHOLDER|$BACKEND_HOST|g" /etc/nginx/conf.d/default.conf

# Verify config
if ! nginx -t >/dev/null 2>&1; then
  echo "ERROR: Invalid nginx config"
  nginx -t
  exit 1
fi

echo "Starting nginx..."
exec nginx -g "daemon off;"
