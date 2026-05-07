# Start Application

Start FreightClub for the specified environment: `dev`, `test`, or `prod`.

**Usage:** `/start dev` | `/start test` | `/start prod`

**Port assignments:**
- **dev:** Backend = 8080, Frontend (Vite) = 9090
- **test:** Backend container = 9091
- **prod:** Backend container = 8080, Frontend container = 80

---

## DEV Environment (Native JVM + Frontend)

**Usage:** `/start dev`

1. **Kill port 8080** (backend/Spring Boot):
   ```
   netstat -ano | findstr :8080
   ```
   For each PID found, run: `taskkill /PID <pid> /F`

2. **Kill port 9090** (frontend/Vite):
   ```
   netstat -ano | findstr :9090
   ```
   For each PID found, run: `taskkill /PID <pid> /F`

3. **Remove VITE_API_URL from `.env.local`** if present — dev proxies to localhost, not Cloud Run.

4. **Load environment variables** from `.env.local`:
   ```
   set -a && source /c/projects/freightclub/.env.local && set +a
   ```

5. **Verify native PostgreSQL is running** on `localhost:5432` (dev uses native PostgreSQL — NO Docker):
   ```
   powershell -command "try { $c = New-Object System.Net.Sockets.TcpClient('localhost', 5432); $c.Close(); 'PostgreSQL UP' } catch { 'PostgreSQL NOT running' }"
   ```
   If not running, ask the user to start their native PostgreSQL service.

6. **Build the backend** (skip tests for speed):
   ```
   /c/tools/apache-maven-3.9.9/bin/mvn package -Dmaven.test.skip=true -Djacoco.skip=true -q -f /c/projects/freightclub/backend/pom.xml
   ```

7. **Start the backend** in the background:
   ```
   "$JAVA_HOME/bin/java" -jar /c/projects/freightclub/backend/target/freightclub-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev &
   ```

8. **Wait for backend to be ready** — poll until port 8080 responds:
   ```
   for i in 1 2 3 4 5 6 7 8 9 10; do
     STATUS=$(powershell -command "try { (Invoke-WebRequest -Uri 'http://localhost:8080/actuator/health' -UseBasicParsing -ErrorAction Stop).StatusCode } catch { \$_.Exception.Response.StatusCode.Value__ }" 2>/dev/null)
     [ -n "$STATUS" ] && echo "Backend ready (HTTP $STATUS)" && break
     sleep 5
   done
   ```
   Expect **200** (actuator/health is public). Connection refused means still starting.

9. **Start the frontend** in the background:
   ```
   cd /c/projects/freightclub/frontend && npm run dev &
   ```

10. **Verify both services** are responding:
    - Backend: `powershell -command "(Invoke-WebRequest -Uri 'http://localhost:8080/actuator/health' -UseBasicParsing).StatusCode"` — expect **200**
    - Frontend: `powershell -command "(Invoke-WebRequest -Uri 'http://localhost:9090' -UseBasicParsing).StatusCode"` — expect **200**

11. **Report status** — confirm both are up.

---

## TEST Environment (Docker QA Deployment)

**Usage:** `/start test`

1. **Stop any existing containers**:
   ```
   docker compose -f /c/projects/freightclub/docker-compose.test.yml down
   ```

2. **Start the test environment** with both backend and database containers:
   ```
   docker compose -f /c/projects/freightclub/docker-compose.test.yml up -d
   ```

3. **Wait for backend to be ready** — poll until port 9091 responds:
   ```
   for i in 1 2 3 4 5 6 7 8 9 10; do
     STATUS=$(powershell -command "try { (Invoke-WebRequest -Uri 'http://localhost:9091/actuator/health' -UseBasicParsing -ErrorAction Stop).StatusCode } catch { \$_.Exception.Response.StatusCode.Value__ }" 2>/dev/null)
     [ -n "$STATUS" ] && echo "Backend ready (HTTP $STATUS)" && break
     sleep 5
   done
   ```
   Expect **401** (Spring Security active = alive).

4. **Verify services**:
   - Backend: `powershell -command "try { (Invoke-WebRequest -Uri 'http://localhost:9091/actuator/health' -UseBasicParsing).StatusCode } catch { \$_.Exception.Response.StatusCode.Value__ }"` — expect **401**
   - Containers: `docker compose -f /c/projects/freightclub/docker-compose.test.yml ps` — both should be running

5. **Report status** — confirm backend and database are up.

---

## PROD Environment (Docker with External Neon Database)

**Usage:** `/start prod`

1. **Stop any existing containers**:
   ```
   docker compose -f /c/projects/freightclub/docker-compose.prod.yml down
   ```

2. **Verify .env.prod exists** with real Neon credentials:
   ```
   test -f /c/projects/freightclub/.env.prod && echo "Found .env.prod" || echo "MISSING: Create .env.prod from .env.prod.example with real Neon credentials"
   ```
   Stop if file is missing.

3. **Start the production environment** with frontend and backend (no internal DB):
   ```
   docker compose -f /c/projects/freightclub/docker-compose.prod.yml --env-file /c/projects/freightclub/.env.prod up -d
   ```

4. **Wait for backend to be ready** — poll until port 9090 responds:
   ```
   for i in 1 2 3 4 5 6 7 8 9 10; do
     STATUS=$(powershell -command "try { (Invoke-WebRequest -Uri 'http://localhost:9090/actuator/health' -UseBasicParsing -ErrorAction Stop).StatusCode } catch { \$_.Exception.Response.StatusCode.Value__ }" 2>/dev/null)
     [ -n "$STATUS" ] && echo "Backend ready (HTTP $STATUS)" && break
     sleep 5
   done
   ```
   Expect **401** (Spring Security active = alive).

5. **Verify services**:
   - Backend: `powershell -command "try { (Invoke-WebRequest -Uri 'http://localhost:9090/actuator/health' -UseBasicParsing).StatusCode } catch { \$_.Exception.Response.StatusCode.Value__ }"` — expect **401**
   - Frontend: `powershell -command "(Invoke-WebRequest -Uri 'http://localhost:80' -UseBasicParsing).StatusCode"` — expect **200**
   - Containers: `docker compose -f /c/projects/freightclub/docker-compose.prod.yml ps` — both should be running

6. **Report status** — confirm frontend and backend are up (database is external Neon, not visible in Docker).
