dev:
  show_sql: true
  debug_logging: true

prod:
  show_sql: false
  strict_validation: true
  tuned_pooling: true

test:
  in_memory_allowed: true
  clean_migrations_required: true