# [LOCAL OVERRIDE]
# This file contains environment-specific settings for Michael's Windows 11 machine.

## 💻 System Configuration
- **OS**: Windows 11
- **Shell**: Git Bash (Standard Linux-style pathing: /c/...)
- **Java**: `/c/Program Files/Eclipse Adoptium/jdk-21.0.10.7-hotspot/bin/java`
- **Maven**: `/c/tools/apache-maven-3.9.9/bin/mvn`

## 🛠 Command Overrides
- **Build**: Always use the system Maven path: `/c/tools/apache-maven-3.9.9/bin/mvn package -Dmaven.test.skip=true -f backend/pom.xml`.
- **Process Management**: When killing stuck ports (9090 or 8080), use Git Bash syntax: `taskkill //F //PID <pid>`.
- **Frontend Startup**: Run `npm run dev` from the `frontend/` directory (Port 8080).
- **Backend Startup**: Run the JAR with the dev profile: `"$JAVA_HOME/bin/java" -jar backend/target/freightclub-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev`.
- **Flyway Info**: `/c/tools/apache-maven-3.9.9/bin/mvn flyway:info -f backend/pom.xml -Dflyway.url="jdbc:postgresql://ep-long-sea-anphps1j-pooler.c-6.us-east-1.aws.neon.tech/freightclub?sslmode=require" -Dflyway.user="neondb_owner" -Dflyway.password="npg_tHg45nQPqLpV"`.

## 🗄️ Database & Connection (Neon PostgreSQL)
- **Host**: `ep-long-sea-anphps1j-pooler.c-6.us-east-1.aws.neon.tech`
- **Database**: `freightclub`
- **User**: `neondb_owner`
- **SSL**: Required (`sslmode=require`)
- **Flyway**: Migrations must be run against this Neon endpoint.

## 🚀 Personal Workflow Preferences
- **Ports**: 
  - Backend API: http://localhost:9090
  - Frontend UI: http://localhost:8080
- **Storage**: Local uploads are saved to `${user.home}/freightclub-uploads`.
- **CORS**: Local dev allows `http://localhost:8080` and Tailscale host `http://mikebarnes.tail67dcb4.ts.net:8080`.
- **EIA Integration**: API Key is configured; ensure EIA service is enabled for fuel price caching.
