# Phase 1.2 — Security & Stability Hardening ✅ Complete

Identified during a post-Phase 1.1 security and architecture review. These issues were resolved before Phase 2 began — two were race conditions that corrupt core data, and the untested auth surface was a prerequisite for any work that depends on the auth flow being correct.

## Critical Security (Data Corruption Risk)

| Issue | Area | Detail |
|-------|------|--------|
| Race condition — load claiming | `LoadService.claimLoad` | Two truckers can pass the `OPEN` status check simultaneously and both claim the same load. Fix: `SELECT FOR UPDATE` on the load row, or a DB-level unique partial index on `(load_id) WHERE status = 'CLAIMED'` |
| Race condition — refresh token rotation | `RefreshTokenService` | Two simultaneous refresh requests can both pass `!isRevoked()`, each receiving a valid token. Fix: `SELECT FOR UPDATE` on the refresh token row |
| No rate limiting on `/api/v1/auth/**` | Security | Login and register are fully open with no throttle. Add Spring Security rate limiting or a servlet filter with a token bucket |
| JWT missing `iss`/`aud` claims | `JwtService` | Tokens have no issuer or audience binding — valid in any future service context. Add `issuer` and `audience` claims on generation; validate on parsing |

## Critical Security (Secrets & Configuration)

| Issue | Area | Detail |
|-------|------|--------|
| JWT secret committed to Git | `application-dev.yml` | Hex secret is in source history. Move to environment variable / secrets manager before any production use |
| Developer Tailscale domain hardcoded | `vite.config.ts` | Personal infrastructure in repo. Replace with environment variable |
| CORS `allowedHeaders: ["*"]` | `SecurityConfig` | Permit-all headers. Replace with explicit whitelist: `Authorization`, `Content-Type`, `X-Requested-With` |

## High — Known Bugs

| Issue | Area | Detail |
|-------|------|--------|
| `claims` table never written | `LoadService.claimLoad` | Migration exists; service never inserts. Required for Phase 4 ratings, Phase 2 cancellation notifications, and Phase 8 bidding |
| `load_events` table never written | `LoadService` | Migration exists; no status transition writes to it. Required for Phase 2 timeline and notifications |
| Date comparison uses string ordering | `LoadForm.tsx` | Cross-field date validation compares `datetime-local` strings lexicographically — brittle. Must use `new Date()` comparison |
| URL filter params cast to enum without validation | `TruckerDashboard.tsx` | `searchParams.get('equip') as EquipmentType` passes any string into the filter. Add enum guard before cast |
| Overweight load — backend has no validation | `LoadService` | Frontend checkbox is the only guard. Add server-side weight validation |
| HOS widget state lost on page refresh | Frontend | All HOS values are React-only state; lost on reload. Add backend persistence endpoint |

## Infrastructure (Minimum Viable)

| Issue | Detail |
|-------|--------|
| React `<ErrorBoundary>` missing | Any render error produces a blank screen. Add to `App.tsx` |
| Spring Boot Actuator absent | Add dependency; expose `/health` and `/info` at minimum |
| No production environment config | Create `application-prod.yml` with environment variable placeholders for all secrets and environment-specific values |
| Structured logging | Add a logging format with correlation IDs for request tracing |

## Testing (Minimum Viable)

| Scope | Detail |
|-------|--------|
| `AuthService` — register, login, refresh, logout | Security-critical; zero coverage today |
| `RefreshTokenService` — rotation, revocation | Covers the race condition fix |
| `JwtAuthenticationFilter` — token extraction, validation | Covers the auth chain |
| Integration test — claim load concurrency | Proves the race condition fix actually holds |
| Frontend smoke tests for claim flow | At minimum: claim button renders, claim mutation fires, toast appears |
