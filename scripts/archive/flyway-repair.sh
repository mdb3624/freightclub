env $(grep -v '^#' .env | xargs) mvn -f backend/pom.xml flyway:repair \
  "-Dflyway.url=$DB_URL" \
  "-Dflyway.user=$FLYWAY_USER" \
  "-Dflyway.password=$FLYWAY_PASSWORD" \
  -Dflyway.schemas=freightclub \
  -Dflyway.defaultSchema=freightclub
