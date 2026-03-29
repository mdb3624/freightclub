# User Stories — Phase 1.2: Security & Stability Hardening

## Race Condition Fixes

- **As the platform**, I want load claiming to use a row-level lock (`SELECT FOR UPDATE`) so that two truckers cannot simultaneously claim the same load when both read `OPEN` status before either write completes.
- **As the platform**, I want refresh token rotation to use a row-level lock so that two simultaneous refresh requests cannot both receive valid tokens from the same refresh token.

## Authentication Rate Limiting

- **As the platform**, I want login and registration endpoints to enforce a token-bucket rate limit (max 10 requests per IP per minute) so that brute force and credential stuffing attacks are throttled with a 429 response.

## JWT Hardening

- **As the platform**, I want every issued JWT to include `iss` (issuer) and `aud` (audience) claims so that tokens are bound to FreightClub and cannot be replayed against other services using the same key material.
- **As the platform**, I want the JWT filter to validate `iss` and `aud` on every request so that tokens not intended for this API are rejected.

## Secrets & Configuration

- **As the platform**, I want the JWT secret moved out of `application-dev.yml` and into an environment variable so that the secret is not committed to source history and cannot be extracted from the repository.
- **As the platform**, I want developer-specific hostnames (e.g. Tailscale domains) removed from `vite.config.ts` and replaced with environment variables so that personal infrastructure is never committed to the codebase.
- **As the platform**, I want CORS `allowedHeaders` to use an explicit whitelist (`Authorization`, `Content-Type`, `X-Requested-With`) instead of `*` so that the API does not blindly accept arbitrary headers from any origin.

## Data Integrity Fixes

- **As the platform**, I want the `claims` table to be written on every load claim and release so that the authoritative claim audit trail exists and Phases 2, 4, and 8 can depend on it.
- **As the platform**, I want every load status transition to write a row to `load_events` so that the event log is populated and Phase 2 notifications and timeline features have a data source.
- **As the platform**, I want server-side validation to reject loads where weight exceeds 80,000 lbs without `overweightAcknowledged = true` so that the frontend checkbox is not the only safeguard.

## Frontend Stability

- **As a user**, I want the application to show a meaningful error screen instead of a blank page when a render error occurs so that I know something went wrong and can take action.
- **As a trucker**, I want load board equipment type filter params to be validated against known enum values before use so that invalid URL params cannot cause silent filter failures.
- **As a shipper**, I want date validation in the load form to compare actual `Date` objects so that cross-field date comparisons are correct regardless of datetime string format.

## Infrastructure

- **As an operator**, I want a `/actuator/health` endpoint so that load balancers and uptime monitors can verify the backend is running.
- **As an operator**, I want a production environment config (`application-prod.yml`) with environment variable placeholders for all secrets so that deployments never require modifying committed files.
- **As an operator**, I want structured request logs with correlation IDs so that I can trace a specific request across log lines when debugging production issues.

## Testing Coverage

- **As a developer**, I want `AuthService` covered by unit tests (register, login, refresh, logout) so that the security-critical auth flow has a safety net against regressions.
- **As a developer**, I want `RefreshTokenService` covered by unit tests (rotation, revocation) so that the race condition fix is verified to hold.
- **As a developer**, I want `JwtAuthenticationFilter` covered by unit tests (token extraction, validation, rejection) so that the full auth chain is tested end-to-end.
- **As a developer**, I want a concurrency integration test for `claimLoad` so that the race condition fix is proven to hold under simultaneous requests, not just in theory.
- **As a developer**, I want frontend smoke tests for the claim flow (claim button renders, mutation fires, toast appears) so that the most critical trucker action has automated coverage.
