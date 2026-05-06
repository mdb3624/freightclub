# Config Authority System

## Purpose
Eliminate configuration drift using rule-driven generation.

## Workflow

1. Define input:
   examples/input-dev.json

2. Generate config:
   ./scripts/generate.sh examples/input-dev.json

3. Paste Claude output into:
   /generated/

4. Validate:
   ./scripts/validate.sh

## Principles
- Environment-driven config
- No duplication
- Flyway uses datasource implicitly
- Schema defined once

## Failure = regenerate, not patch