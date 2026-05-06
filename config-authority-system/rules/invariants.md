1. Flyway MUST NOT define url/user/password
2. Datasource is the ONLY DB connection source
3. Schema must exist in exactly ONE place
4. No secrets in config files
5. All environment values must come from env vars
6. No duplication across YAML, CLI, or env
7. application.yml must be environment-agnostic
8. Profiles may not redefine infrastructure