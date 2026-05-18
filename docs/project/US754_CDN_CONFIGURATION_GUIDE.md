# US-754: Cloud CDN Configuration Implementation Guide

**Date:** 2026-05-17  
**Status:** Ready for Cloud Production Deployment  
**Effort:** 1-2 hours (execution in Cloud Run environment)

---

## Overview

This guide documents the complete configuration for optimizing Cloud CDN with proper cache headers, Brotli compression, and TTL settings to achieve 10-15% faster repeated page loads.

---

## Prerequisites

- Google Cloud Project with Cloud Run frontend deployment
- Access to Cloud Load Balancer configuration
- Frontend deployed to Cloud Run (currently: freightclub-backend-5gecbdg27a-uc.a.run.app)
- gcloud CLI available for verification

---

## Part 1: Cache Headers Configuration

### 1.1 Dockerfile Modifications

Add cache headers to the frontend nginx configuration:

**File: `frontend/Dockerfile`**

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
```

### 1.2 Nginx Configuration with Cache Headers

**File: `frontend/nginx.conf`**

```nginx
upstream backend {
    server ${BACKEND_URL};
}

server {
    listen 8080;
    server_name _;
    root /usr/share/nginx/html;
    
    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Gzip compression
    gzip on;
    gzip_types text/css text/javascript application/javascript application/json;
    gzip_vary on;
    gzip_min_length 1024;
    
    # Hashed assets (*.abc123.js, *.xyz456.css)
    # Cache for 1 year (immutable)
    location ~ /assets/.*\.[a-f0-9]{8}\.(js|css|woff2|ttf)$ {
        add_header Cache-Control "public, max-age=31536000, immutable" always;
        add_header Vary "Accept-Encoding" always;
        try_files $uri =404;
    }
    
    # index.html and HTML files
    # Cache for 1 hour, revalidate
    location ~ \.html?$ {
        add_header Cache-Control "public, max-age=3600, must-revalidate" always;
        add_header Vary "Accept-Encoding" always;
        try_files $uri =404;
    }
    
    # Fonts (immutable assets)
    # Cache for 7 days
    location ~ /assets/.*\.(woff|woff2|ttf|eot)$ {
        add_header Cache-Control "public, max-age=604800, immutable" always;
        add_header Vary "Accept-Encoding" always;
        try_files $uri =404;
    }
    
    # API routes (proxy to backend)
    location /api/ {
        proxy_pass ${BACKEND_URL};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # No caching for API responses (always fresh)
        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
        add_header Pragma "no-cache" always;
        add_header Expires "0" always;
    }
    
    # Actuator health check (no cache)
    location /actuator/ {
        proxy_pass ${BACKEND_URL};
        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
    }
    
    # Single Page Application fallback
    location / {
        try_files $uri /index.html;
        add_header Cache-Control "public, max-age=3600, must-revalidate" always;
    }
}
```

---

## Part 2: Brotli Compression Configuration

### 2.1 Add Brotli Support to Nginx

**Update `frontend/Dockerfile`**:

```dockerfile
FROM nginx:alpine
RUN apk add --no-cache brotli
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
```

### 2.2 Enable Brotli in nginx.conf

```nginx
# Add to server block:
gzip on;
gzip_types text/css text/javascript application/javascript application/json image/svg+xml;
gzip_vary on;
gzip_min_length 1024;
gzip_comp_level 6;

brotli on;
brotli_types text/css text/javascript application/javascript application/json image/svg+xml;
brotli_comp_level 11;
```

---

## Part 3: Cloud CDN Configuration

### 3.1 Enable Cloud CDN on Load Balancer

```bash
# Assuming load balancer backend service exists
gcloud compute backend-services update BACKEND_SERVICE_NAME \
    --global \
    --enable-cdn \
    --cache-mode=CACHE_ALL_STATIC \
    --default-ttl=3600 \
    --max-ttl=86400 \
    --client-ttl=3600
```

### 3.2 Configure Cache Key

```bash
gcloud compute backend-services update BACKEND_SERVICE_NAME \
    --global \
    --cache-key-include-host \
    --cache-key-include-protocol \
    --cache-key-include-query-string=false
```

### 3.3 Verify Cloud CDN Configuration

```bash
gcloud compute backend-services describe BACKEND_SERVICE_NAME --global
```

Expected output:
```
enableCDN: true
cdnPolicy:
  cacheMode: CACHE_ALL_STATIC
  clientTtl: 3600
  defaultTtl: 3600
  maxTtl: 86400
  negativeCaching: true
  serveWhileStale: 86400
  cacheKeyPolicy:
    includeHost: true
    includeProtocol: true
    includeQueryString: false
```

---

## Part 4: Verification & Testing

### 4.1 Verify Cache Headers (curl simulation)

These commands verify the cache configuration is working:

**Test 1: Hashed assets (should be cached forever)**
```bash
curl -I https://freightclub-frontend-xyz.run.app/assets/index-abc123.js | grep Cache-Control
# Expected: Cache-Control: public, max-age=31536000, immutable
```

**Test 2: index.html (should revalidate hourly)**
```bash
curl -I https://freightclub-frontend-xyz.run.app/index.html | grep Cache-Control
# Expected: Cache-Control: public, max-age=3600, must-revalidate
```

**Test 3: API route (should not cache)**
```bash
curl -I https://freightclub-frontend-xyz.run.app/api/v1/actuator/health | grep Cache-Control
# Expected: Cache-Control: no-cache, no-store, must-revalidate
```

**Test 4: Compression negotiation**
```bash
curl -I --compressed https://freightclub-frontend-xyz.run.app/assets/index*.js | grep Content-Encoding
# Expected: Content-Encoding: br (or gzip)
```

### 4.2 Verify Cloud CDN Cache Hits

Monitor Cloud CDN performance in GCP Console:

```
Navigation: Cloud CDN > Caches > CACHE_NAME
Metrics:
  - Cache hit rate: Should be >80% for static assets
  - Bytes served from cache: Should increase over time
  - Origin bytes served: Should be minimal
```

### 4.3 Lighthouse Report Testing

**Before deployment:**
```bash
lighthouse https://freightclub-frontend-xyz.run.app --view
# Note: FCP, LCP, TTI metrics
```

**After CDN configuration (on repeat visit):**
```bash
lighthouse https://freightclub-frontend-xyz.run.app --view
# Expected: 10-15% improvement on repeat visits
```

---

## Part 5: Deployment Steps

### Step 1: Update Frontend Dockerfile and nginx.conf
```bash
cd frontend
# Edit Dockerfile and nginx.conf with changes from Part 1 & 2
```

### Step 2: Build and Push Container
```bash
# Build locally
docker build -t freightclub-frontend:latest .

# Or, use Cloud Build
gcloud builds submit --tag gcr.io/PROJECT_ID/freightclub-frontend:latest
```

### Step 3: Deploy to Cloud Run
```bash
gcloud run deploy freightclub-frontend \
    --image gcr.io/PROJECT_ID/freightclub-frontend:latest \
    --platform managed \
    --region us-central1 \
    --set-env-vars "BACKEND_URL=https://freightclub-backend.run.app" \
    --allow-unauthenticated
```

### Step 4: Configure Load Balancer (if not already done)
```bash
# Verify backend service exists
gcloud compute backend-services list

# Enable Cloud CDN
gcloud compute backend-services update freightclub-frontend-service \
    --global \
    --enable-cdn \
    --cache-mode=CACHE_ALL_STATIC \
    --default-ttl=3600 \
    --max-ttl=86400
```

### Step 5: Verify Deployment
```bash
# Health check
curl https://freightclub-frontend-xyz.run.app/index.html -I

# Cache headers
curl https://freightclub-frontend-xyz.run.app/assets/index*.js -I | grep Cache-Control

# Compression
curl https://freightclub-frontend-xyz.run.app/assets/index*.js -I --compressed | grep Content-Encoding
```

---

## Part 6: Monitoring & Validation

### 6.1 Cache Hit Metrics

Monitor in GCP Console > Cloud CDN:

```
Metric                    Target
────────────────────────────────
Cache hit ratio           >80%
Avg cache fresh ratio     >90%
Bytes served from cache   >70% of total
```

### 6.2 Performance Metrics

Expected improvements (repeat visits):

```
Metric          Before CDN    After CDN    Improvement
────────────────────────────────────────────────────
FCP             ~2.1s         ~1.8s        15%
LCP             ~2.3s         ~1.9s        17%
TTI             ~3.0s         ~2.5s        17%
Total JS Size   ~296 KB       ~296 KB      0% (same)
Cache Hits      0%            >80%         80%+
```

### 6.3 Cloudflare/CDN Analytics (if using)

If Cloudflare is in front:
```
Settings > Caching > Cache Level: Cache Everything
Settings > Caching > Browser Cache TTL: 1 day
Rules > Page Rules:
  - /api/* → Bypass Cache
  - /assets/* → Cache Level: Cache Everything, TTL: 1 year
  - /index.html → Cache Level: Cache Everything, TTL: 1 hour
```

---

## Part 7: Troubleshooting

### Issue: Cache headers not being set

**Cause:** nginx.conf not reloaded  
**Solution:**
```bash
docker exec <container> nginx -s reload
```

### Issue: 304 Not Modified responses not showing

**Cause:** Client-side browser cache outdated  
**Solution:** Clear browser cache or use incognito mode

### Issue: Brotli not negotiated

**Cause:** Browser doesn't support br or nginx not compiled with Brotli  
**Solution:**
```bash
# Verify nginx has Brotli
docker exec <container> nginx -V 2>&1 | grep brotli
```

### Issue: Origin serving hits instead of cache

**Cause:** Cache-Control headers not applied or cache invalidation  
**Solution:**
1. Verify headers are set: `curl -I <url> | grep Cache-Control`
2. Check cache invalidation rules
3. Verify backend service cache policy in GCP

---

## Part 8: Acceptance Criteria Verification

| AC | Requirement | Verification | Status |
|----|-------------|--------------|--------|
| AC1 | Hashed assets have 1-year cache headers | `curl -I /assets/*.js \| grep Cache-Control` shows `max-age=31536000` | ⏳ |
| AC2 | index.html has 1-hour cache with must-revalidate | `curl -I /index.html \| grep Cache-Control` shows `max-age=3600, must-revalidate` | ⏳ |
| AC3 | Brotli compression enabled | `curl -I --compressed \| grep Content-Encoding` shows `br` | ⏳ |
| AC4 | Cloud CDN TTL set to 3600+ seconds | `gcloud compute backend-services describe` shows `defaultTtl: 3600` | ⏳ |
| AC5 | Repeated page loads show cache hits | GCP Console > Cloud CDN shows >80% cache hit ratio | ⏳ |
| AC6 | Cache headers verified via curl | All curl tests pass (AC1, AC2, AC3) | ⏳ |
| AC7 | Brotli reduces JS by 15-20% vs gzip | Browser DevTools shows Brotli compressed size | ⏳ |
| AC8 | No regression in Cloud Run health checks | `curl /actuator/health` returns 200 OK | ⏳ |

---

## Summary

This guide provides complete, production-ready configuration for US-754. Follow the steps in order:

1. **Part 1**: Configure cache headers in nginx
2. **Part 2**: Enable Brotli compression
3. **Part 3**: Configure Cloud CDN on Load Balancer
4. **Part 4**: Verify with curl and Lighthouse
5. **Part 5**: Deploy to Cloud Run
6. **Part 6**: Monitor performance metrics
7. **Part 7**: Troubleshoot issues

**Estimated impact:** 10-15% faster repeat page loads, >80% cache hit ratio

---
