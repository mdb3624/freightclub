# Debugging Registration Error

## Step 1: Check Backend Logs

Look in **Terminal 1 (Backend)** for error messages. Common issues:

### Error: "Cannot resolve symbol" or "Compilation failed"
- Backend needs to compile first
- Wait for "Started FreightClubApplication" message

### Error: "Connection refused" or "Database connection failed"  
- PostgreSQL not running
- Run: `docker ps | grep postgres`
- If not there, restart it:
  ```powershell
  docker run -d --name freightclub-dev-db -p 5432:5432 -e POSTGRES_DB=freightclub_db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres postgres:15-alpine
  ```

### Error: "Flyway migration failed"
- Database schema needs initialization
- Backend will auto-run migrations on first start
- Check for actual SQL error in backend logs

## Step 2: Check Frontend Console

1. Open http://localhost:8080
2. Press **F12** to open DevTools
3. Click **Console** tab
4. Try to register again
5. Look for error messages showing:
   - Network error (red X on Network tab)
   - JavaScript error
   - CORS error

## Step 3: Test Backend Directly

Open PowerShell and test the API:

```powershell
# Check backend is responding
$response = Invoke-WebRequest -Uri "http://localhost:9090/actuator/health" -UseBasicParsing
$response.Content | ConvertFrom-Json

# Should return: {"status":"UP",...}
```

## Step 4: Check Database

```powershell
# Connect to database
docker exec freightclub-dev-db psql -U postgres -d freightclub_db -c "SELECT 1"

# Should return: 1
```

## Common Registration Errors

| Error | Cause | Fix |
|-------|-------|-----|
| "Network Error" | Backend not running | Start backend in Terminal 1 |
| "Failed to fetch" | Vite proxy not working | Check vite.config.ts proxy target |
| "CORS error" | Backend CORS not configured | Check application-dev.yml CORS settings |
| "Validation failed" | Missing required fields | Check form fields |
| "User already exists" | Email already registered | Use different email |
| "Internal Server Error" | Database/backend bug | Check backend logs for full error |

## Quick Checklist

- [ ] PostgreSQL is running: `docker ps`
- [ ] Backend started successfully: "Started FreightClubApplication" in Terminal 1
- [ ] Frontend is running: Terminal 2 shows Vite output
- [ ] Can access http://localhost:8080
- [ ] Browser console (F12) shows no CORS/network errors
- [ ] Backend health check works: http://localhost:9090/actuator/health

## If Still Stuck

Share:
1. Exact error message from browser console
2. Backend terminal output (last 20 lines)
3. Network tab error details (F12 → Network → find failed request → click it)
