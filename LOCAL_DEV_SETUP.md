# Local Development Setup (No Docker)

## Prerequisites

### 1. PostgreSQL (Windows)

**Option A: Use Windows Installer (Easiest)**
1. Download from https://www.postgresql.org/download/windows/
2. Run installer, choose version 15
3. Set password: `postgres` (or remember your password)
4. Port: 5432
5. Install PgAdmin (optional, for GUI)

**Option B: Already Have PostgreSQL**
- Verify: Open PowerShell and run `psql --version`
- Should show version 15 or higher

### 2. Java 21
- Download from https://adoptium.net (Eclipse Adoptium JDK 21)
- Install and verify: `java -version`

### 3. Maven 3.9+
- Usually comes with Java or download from https://maven.apache.org/download.cgi
- Verify: `mvn -version`

### 4. Node.js 20+
- Download from https://nodejs.org
- Verify: `node --version` and `npm --version`

---

## Setup Development Database

### Create Database

Open PowerShell and connect to PostgreSQL:

```powershell
# Connect to PostgreSQL (will prompt for password)
psql -U postgres

# Inside psql, create database:
CREATE DATABASE freightclub_db;
\q
```

### Verify Database

```powershell
psql -U postgres -d freightclub_db -c "SELECT 1"
# Should return: 1
```

---

## Start Development Environment

### Terminal 1: Backend (Port 9090)

```powershell
cd C:\projects\freightclub\backend

# Set environment variables
$env:SPRING_PROFILES_ACTIVE = "dev"
$env:DB_URL = "jdbc:postgresql://localhost:5432/freightclub_db?currentSchema=freightclub"
$env:DB_USERNAME = "postgres"
$env:DB_PASSWORD = "postgres"
$env:JWT_SECRET = "dev-secret-32-chars-minimum-required"

# Start backend (first time will download dependencies)
mvn clean spring-boot:run
```

**Wait for:**
```
... Started FreightClubApplication in XX.XXX seconds
... Tomcat started on port(s): 9090
```

**Health check:**
```powershell
# In another PowerShell window:
Invoke-WebRequest -Uri "http://localhost:9090/actuator/health" -UseBasicParsing
# Should return: 200 OK
```

### Terminal 2: Frontend (Port 8080)

```powershell
cd C:\projects\freightclub\frontend

# First time only: install dependencies
npm install

# Start dev server
$env:VITE_API_URL = "http://localhost:9090"
$env:VITE_PORT = "8080"
npm run dev
```

**Wait for:**
```
➜  Local:   http://localhost:8080/
```

---

## Access Application

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:9090/actuator/health
- **Database**: Connect with `psql -U postgres -d freightclub_db`

---

## Troubleshooting

### "Connection refused" on port 5432
```powershell
# Check if PostgreSQL is running
netstat -ano | findstr :5432

# If not running, start PostgreSQL service
# On Windows, it should auto-start as a service
# Or manually: pg_ctl -D "C:\Program Files\PostgreSQL\15\data" start
```

### "Maven build failed"
```powershell
# Clear Maven cache and rebuild
mvn clean install -DskipTests
mvn spring-boot:run
```

### "Port 9090 already in use"
```powershell
# Find and kill process
netstat -ano | findstr :9090
taskkill /PID <PID> /F

# Or use different port:
$env:PORT = "9091"
mvn spring-boot:run
```

### "CORS error" on registration
- Frontend can't reach backend
- Check: http://localhost:9090/actuator/health works
- Check application-dev.yml CORS settings

### "Flyway migration failed"
- Database schema issue
- Solution: Drop and recreate database
```powershell
psql -U postgres -c "DROP DATABASE freightclub_db"
psql -U postgres -c "CREATE DATABASE freightclub_db"
# Restart backend, it will run migrations
```

---

## Development Workflow

### Code Changes
**Frontend**: 
- Edit `.tsx` files in `frontend/src`
- Vite auto-reloads browser automatically (HMR)
- No need to restart

**Backend**:
- Edit Java files in `backend/src`
- Stop backend (Ctrl+C) and restart to see changes
- Or enable Spring DevTools for live reload

### Database Changes
**Add new migration:**
1. Create file: `backend/src/main/resources/db/migration/V20260503__Description.sql`
2. Add SQL
3. Restart backend (migrations run automatically)

**Query database:**
```powershell
psql -U postgres -d freightclub_db -c "SELECT * FROM \"user\";"
```

---

## Performance Tips

- **Maven**: First run downloads ~500MB of dependencies (takes ~5 min)
- **npm**: First run downloads ~600MB of packages (takes ~2 min)
- Subsequent runs are much faster
- Keep both terminals running for best experience
- Terminal 1 (backend): Shows API logs
- Terminal 2 (frontend): Shows Vite rebuild logs

---

## Stop Development

```powershell
# Terminal 1: Ctrl+C (backend)
# Terminal 2: Ctrl+C (frontend)
# PostgreSQL: Runs as service (can stop in Windows Services)
```

---

## Next Steps

1. Install PostgreSQL locally
2. Create `freightclub_db` database
3. Start backend in Terminal 1
4. Start frontend in Terminal 2
5. Open http://localhost:8080
6. Try registering a new account
