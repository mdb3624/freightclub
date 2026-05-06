# Definition of Done (DoD)
All features must pass these gates before being marked "DONE".

## 🏗️ Architectural Gate
- IDs must be `VARCHAR(36)`.
- RLS must be enabled with a tenant isolation policy.
- `deleted_at` column must be present.

## 💻 Coding Gate
- No Lombok annotations.
- 80% branch coverage (Unit tests included).
- Flyway migration naming: `VYYYYMMDD_HHmm__Desc.sql`.

## 🛡️ Security Gate
- No sensitive data (PII) in logs.
- RLS context is verified in the Service layer.