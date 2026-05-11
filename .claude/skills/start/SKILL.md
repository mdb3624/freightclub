# Start Application

Start FreightClub for the specified environment: `dev`, `test`, or `prod`.

**Usage:** `/start dev` | `/start test` | `/start prod`

**Port assignments:**
- **dev:** Backend = 8080, Frontend (Vite) = 9090
- **test:** Backend container = 9091
- **prod:** Google Cloud Run (no local ports)

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

## PROD Environment (Google Cloud Run)

**Usage:** `/start prod`

Deploys new images to Google Cloud Run. Database is external Neon — no local containers.

Constants (sourced from `.env.prod`):
- `GCP_REGISTRY=us-central1-docker.pkg.dev/freight-club-495117/freightclub-repo`
- `GCP_PROJECT=freight-club-495117`
- `GCP_REGION=us-central1`

1. **Verify `.env.prod` exists** and load it:
   ```
   test -f /c/projects/freightclub/.env.prod && echo "Found .env.prod" || echo "MISSING .env.prod"
   set -a && source /c/projects/freightclub/.env.prod && set +a
   ```
   Stop if file is missing.

2. **Verify gcloud authentication**:
   ```
   powershell -ExecutionPolicy Bypass -command "gcloud auth list --filter=status:ACTIVE --format='value(account)'"
   ```
   If no active account, tell the user to run: `! gcloud auth login`
   Note: always use `powershell -ExecutionPolicy Bypass -command "gcloud ..."` — direct `gcloud` calls fail in Git Bash due to Python path mangling, and plain `powershell` fails due to execution policy.

3. **Build backend JAR** (skip tests):
   ```
   /c/tools/apache-maven-3.9.9/bin/mvn package -Dmaven.test.skip=true -Djacoco.skip=true -q -f /c/projects/freightclub/backend/pom.xml
   ```

4. **Configure Docker for Artifact Registry**:
   ```
   powershell -ExecutionPolicy Bypass -command "gcloud auth configure-docker us-central1-docker.pkg.dev --quiet"
   ```

5. **Build and push backend image**:
   ```
   docker build -t ${GCP_REGISTRY}/freightclub-backend:${IMAGE_TAG:-latest} -f /c/projects/freightclub/backend/Dockerfile /c/projects/freightclub/backend
   docker push ${GCP_REGISTRY}/freightclub-backend:${IMAGE_TAG:-latest}
   ```

6. **Build and push frontend image**:
   ```
   docker build -t ${GCP_REGISTRY}/freightclub-frontend:${IMAGE_TAG:-latest} -f /c/projects/freightclub/frontend/Dockerfile /c/projects/freightclub/frontend
   docker push ${GCP_REGISTRY}/freightclub-frontend:${IMAGE_TAG:-latest}
   ```

7. **Deploy backend to Cloud Run** (image-only — env vars/secrets already configured on the service):
   ```
   powershell -ExecutionPolicy Bypass -command "gcloud run deploy freightclub-backend --image=${GCP_REGISTRY}/freightclub-backend:${IMAGE_TAG:-latest} --region=us-central1 --project=freight-club-495117 --platform=managed --quiet"
   ```

8. **Deploy frontend to Cloud Run** (port 8080 — nginx listens on 8080 for Cloud Run):
   ```
   powershell -ExecutionPolicy Bypass -command "gcloud run deploy freightclub-frontend --image=${GCP_REGISTRY}/freightclub-frontend:${IMAGE_TAG:-latest} --region=us-central1 --project=freight-club-495117 --platform=managed --port=8080 --allow-unauthenticated --quiet"
   ```

9. **Get deployed service URLs**:
   ```
   gcloud run services describe freightclub-backend --region=us-central1 --project=freight-club-495117 --format="value(status.url)"
   gcloud run services describe freightclub-frontend --region=us-central1 --project=freight-club-495117 --format="value(status.url)"
   ```

10. **Verify backend health** using the returned URL:
    ```
    powershell -command "(Invoke-WebRequest -Uri '<backend-url>/actuator/health' -UseBasicParsing).StatusCode"
    ```
    Expect **200**.

11. **Report status** — print both Cloud Run URLs and confirm backend health check passed.
