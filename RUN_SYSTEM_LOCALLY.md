# Running FreightClub Locally - Manual Setup & Testing

## Option 1: Docker Compose (Easiest)

### Start Everything with Docker Compose

```bash
cd C:/projects/freightclub

# Start backend, frontend, and PostgreSQL
docker-compose up -d

# Verify services are running
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

**Access:**
- Frontend: http://localhost:8080
- Backend API: http://localhost:9090/actuator/health
- PostgreSQL: localhost:5432

**Stop everything:**
```bash
docker-compose down
```

---

## Option 2: Manual Development Setup (Local Maven + npm)

### Prerequisites

- Java 21 (Eclipse Adoptium)
- Maven 3.9+
- Node.js 20+
- PostgreSQL 16

### 1. Set Up PostgreSQL

On Windows, you can use one of:
- **WSL2 + PostgreSQL** (recommended)
- **Docker just for PostgreSQL:** `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16`
- **Local PostgreSQL installation**

**Create database:**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE freightclub_db;
\q
```

### 2. Start Backend (Port 9090)

**Terminal 1:**
```bash
cd C:/projects/freightclub/backend

# Run with dev profile (uses localhost PostgreSQL)
$env:SPRING_PROFILES_ACTIVE = "dev"
$env:DB_URL = "jdbc:postgresql://localhost:5432/freightclub_db?currentSchema=freightclub"
$env:DB_USERNAME = "postgres"
$env:DB_PASSWORD = "postgres"
$env:JWT_SECRET = "dev-secret-change-in-production-min-32-chars"

# Build and run
mvn clean spring-boot:run
```

**Expected output:**
```
2026-05-03 21:45:23.123 INFO ... Freightclub.FreightClubApplication : Started in 12.345 seconds
2026-05-03 21:45:23.456 INFO ... Tomcat.TomcatWebServer : Tomcat started on port(s): 9090
```

**Test backend:**
```bash
curl http://localhost:9090/actuator/health
# Should return: {"status":"UP"}
```

### 3. Start Frontend (Port 8080)

**Terminal 2:**
```bash
cd C:/projects/freightclub/frontend

# Install dependencies (if not done)
npm install

# Start Vite dev server
$env:VITE_API_URL = "http://localhost:9090"
$env:VITE_PORT = "8080"
npm run dev
```

**Expected output:**
```
VITE v5.X.X  ready in XXX ms

➜  Local:   http://localhost:8080/
➜  Network: http://192.168.1.XXX:8080/
```

### 4. Access the Application

**Open in browser:**
- Frontend: http://localhost:8080
- Vite automatically proxies `/api` → `http://localhost:9090`

---

## Option 3: Test Environment (Self-Contained)

Isolated testing with compiled binaries on different ports (9091, 8081):

```bash
cd C:/projects/freightclub

# Start test environment
bash scripts/test-env-start.sh

# Output shows:
# Backend: http://localhost:9091
# Frontend: http://localhost:8081
# Database: localhost:5432/freightclub_test

# Stop test environment
bash scripts/test-env-stop.sh
```

---

## Testing Checklist

### 1. Backend Health

```bash
curl http://localhost:9090/actuator/health

# Expected: {"status":"UP","components":{"db":{"status":"UP"},...}}
```

### 2. Frontend Loads

```bash
curl http://localhost:8080

# Expected: HTML with <html>, <body>, etc.
```

### 3. API Request from Frontend

In browser console (http://localhost:8080):
```javascript
fetch('/api/v1/loads')
  .then(r => r.json())
  .then(d => console.log(d))
```

### 4. Database Connectivity

From terminal:
```bash
psql -U postgres -d freightclub_db -c "SELECT 1"
# Expected: 1
```

### 5. Login Flow (Manual)

1. Open http://localhost:8080
2. Register a new account
3. Create a shipper/carrier profile
4. View loads (empty initially, but should load without errors)

---

## Troubleshooting

### Backend won't start

**Error: "Migration validation failed"**
- Solution: Backend needs fresh PostgreSQL for first run
- Run: `psql -U postgres -d freightclub_db -c "DROP SCHEMA IF EXISTS freightclub CASCADE"`
- Restart backend

**Error: "Port 9090 already in use"**
```bash
# Find and kill process
netstat -ano | findstr :9090
taskkill /PID <PID> /F

# Or change port:
set PORT=9091
mvn spring-boot:run
```

**Error: "Cannot connect to PostgreSQL"**
- Verify PostgreSQL is running
- Check credentials in application-dev.yml
- Test: `psql -U postgres -c "SELECT 1"`

### Frontend won't start

**Error: "Cannot find module"**
- Run: `npm install`

**Error: "VITE_API_URL not set"**
- The proxy in vite.config.ts defaults to `http://localhost:9090`
- Or set env var: `$env:VITE_API_URL = "http://localhost:9090"`

**Error: "Port 8080 already in use"**
```bash
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### API calls fail from frontend

Check browser console for CORS errors:
- Verify `/api` proxy in vite.config.ts points to backend URL
- Check backend `application-dev.yml` CORS settings

---

## Development Workflow

### Code Changes

**Frontend:**
- Changes auto-reload (Vite HMR)
- Save file → browser updates automatically

**Backend:**
- Stop Maven (Ctrl+C)
- Make changes
- Restart: `mvn spring-boot:run`
- Or enable live reload in Spring Boot DevTools

### Database Changes

If you modify schema in migrations:
```bash
# Drop and recreate database
psql -U postgres -d freightclub_db -c "DROP SCHEMA freightclub CASCADE"

# Restart backend (Flyway will run migrations)
```

### Testing API

Use curl, Postman, or VSCode REST Client:

```bash
# Get loads (as shipper)
curl -X GET http://localhost:9090/api/v1/loads \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"

# Create load
curl -X POST http://localhost:9090/api/v1/loads \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"origin": "NYC", "destination": "LA", "weightLbs": 5000}'
```

---

## Logs & Debugging

### View backend logs

```bash
# While running (in same terminal)
# Logs show automatically

# Or from docker-compose
docker-compose logs -f backend
```

### View frontend logs

1. Browser DevTools (F12)
2. Console tab shows Vite + app logs
3. Network tab shows API calls

### View database logs

```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version()"
```

---

## Clean Up

```bash
# Stop all services
docker-compose down

# Or manually:
# Terminal 1: Ctrl+C (backend)
# Terminal 2: Ctrl+C (frontend)

# Delete volumes
docker volume rm freightclub_postgres_data freightclub_uploads_data

# Delete test database
psql -U postgres -c "DROP DATABASE freightclub_test"
```

---

## Next Steps

1. **Run locally** using Option 1 (Docker Compose) or Option 2 (manual)
2. **Test the UI** - Register, create loads, browse loads
3. **Test the API** - Use curl or Postman
4. **When ready for production** - Follow GOOGLE_CLOUD_DEPLOYMENT_READY.md
