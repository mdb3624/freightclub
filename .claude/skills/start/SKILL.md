# Start Application

Start the FreightClub full stack (backend on 9090, frontend on 8080).

## Steps

1. **Kill port 8080** (frontend/Vite):
   ```
   netstat -ano | findstr :8080
   ```
   For each PID found, run: `taskkill /PID <pid> /F`

2. **Kill port 9090** (backend/Spring Boot):
   ```
   netstat -ano | findstr :9090
   ```
   For each PID found, run: `taskkill /PID <pid> /F`

3. **Build the backend** (skip tests for speed):
   ```
   /c/tools/apache-maven-3.9.9/bin/mvn package -Dmaven.test.skip=true -q -f backend/pom.xml
   ```

4. **Start the backend** in the background:
   ```
   "$JAVA_HOME/bin/java" -jar backend/target/freightclub-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev &
   ```

5. **Wait for backend to be ready** — poll until it responds with any HTTP status (even 401 = secured but alive):
   ```
   until curl -s -o /dev/null -w "%{http_code}" http://localhost:9090/actuator/health | grep -qE "^[0-9]"; do sleep 2; done
   ```
   Note: `/actuator/health` is secured, so expect **401**, not 200. Any HTTP response means Spring Boot is up.

6. **Start the frontend** in the background:
   ```
   cd frontend && npm run dev &
   ```

7. **Verify both services** are responding:
   - Backend: `curl -s -o /dev/null -w "%{http_code}" http://localhost:9090/actuator/health` — expect **401** (secured = alive)
   - Frontend: `curl -s -o /dev/null -w "%{http_code}" http://localhost:8080` — expect **200**

8. **Report status** — confirm both are up. For backend, 401 is the expected success status (Spring Security is active). Only treat it as a failure if the connection is refused or times out.
