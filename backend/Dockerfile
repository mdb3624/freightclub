# Stage 1: Build
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn package -DskipTests -q

# Stage 1.5: Test
FROM maven:3.9-eclipse-temurin-21 AS test
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn clean test -q --fail-at-end
RUN mvn jacoco:report -q

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

RUN groupadd --system appgroup && useradd --system --gid appgroup --home-dir /app appuser
RUN mkdir -p /app/uploads && chown -R appuser:appgroup /app
USER appuser

COPY --from=build /app/target/freightclub-backend-*.jar app.jar

EXPOSE 9090

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=5 \
  CMD curl -f http://localhost:9091/actuator/health || curl -f http://localhost:9090/actuator/health || exit 1

ENTRYPOINT exec java -jar app.jar
