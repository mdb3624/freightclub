# CONFIG GENERATION TASK

You are generating Spring Boot configuration.

## REQUIRED INPUT
- env: dev | prod | test
- database: postgres
- schema_strategy: connection_string | config_property

## PROCESS
1. Apply ALL rules from /rules/invariants.md
2. Follow /rules/architect.md strictly
3. Use /rules/environments.md for environment behavior
4. Start from /templates/application.base.yml

## OUTPUT
- /generated/application.yml
- /generated/application-{env}.yml (if needed)

## HARD RULES
- NO secrets in YAML
- NO duplication
- Flyway MUST use datasource implicitly
- Schema defined EXACTLY once
