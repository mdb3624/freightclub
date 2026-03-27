# Restart Application

Kill all running FreightClub processes and restart the full stack.

## Steps

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

5. **Follow the `/start` skill** to rebuild and restart both services.
