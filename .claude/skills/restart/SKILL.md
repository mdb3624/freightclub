# Restart Application

Kill all running FreightClub processes for the specified environment and restart it.

**Usage:** `/restart dev` | `/restart test` | `/restart prod`

---

## DEV Environment

**Usage:** `/restart dev`

1. **Kill all Java processes** (backend):
   ```
   taskkill //F //IM java.exe 2>&1; echo "java killed"
   ```

2. **Kill all Node processes** (frontend/Vite):
   ```
   taskkill //F //IM node.exe 2>&1; echo "node killed"
   ```

3. **Wait briefly** for ports to release:
   ```
   sleep 3
   ```

4. **Verify ports 8080 and 9090 are free**:
   ```
   netstat -ano | findstr ":8080\|:9090"
   ```
   If any PIDs remain, kill them: `taskkill //F //PID <pid>`

5. **Follow the `/start dev` skill** to rebuild and restart.

---

## TEST Environment

**Usage:** `/restart test`

1. **Stop and remove test containers**:
   ```
   docker compose -f /c/projects/freightclub/docker-compose.test.yml down -v
   ```
   The `-v` flag removes volumes to ensure a clean state.

2. **Follow the `/start test` skill** to restart the QA environment.

---

## PROD Environment

**Usage:** `/restart prod`

1. **Stop and remove production containers** (keep volumes to preserve uploads):
   ```
   docker compose -f /c/projects/freightclub/docker-compose.prod.yml down
   ```

2. **Follow the `/start prod` skill** to restart the production environment.
