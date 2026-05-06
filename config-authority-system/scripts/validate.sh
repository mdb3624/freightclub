#!/bin/bash

FILE="generated/application.yml"

echo "=== Validating configuration ==="

fail() {
  echo "❌ $1"
  exit 1
}

# Rule checks
grep -q "spring.flyway.url" $FILE && fail "Flyway must not define url"
grep -q "spring.flyway.user" $FILE && fail "Flyway must not define user"
grep -q "spring.flyway.password" $FILE && fail "Flyway must not define password"

grep -q "password: .*[^}]" $FILE && fail "Hardcoded password detected"

COUNT=$(grep -c "schema" $FILE)
[ "$COUNT" -gt 1 ] && fail "Multiple schema definitions detected"

echo "✅ Configuration is valid"