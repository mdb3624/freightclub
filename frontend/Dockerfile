# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Runtime (nginx)
FROM nginx:alpine
RUN apk add --no-cache gettext
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf.template
EXPOSE 8080
RUN echo '#!/bin/sh\nset -e\nexport BACKEND_URL=${BACKEND_URL:-http://localhost:8080}\nexport BACKEND_HOST=${BACKEND_HOST:-localhost:8080}\nenvsubst < /etc/nginx/nginx.conf.template > /etc/nginx/conf.d/default.conf\nnginx -g "daemon off;"' > /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
