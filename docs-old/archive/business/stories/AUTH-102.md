---
id: AUTH-102
title: Stateless RS256 JWT Authentication & Token Lifecycle
persona: Shipper / Trucker
priority: High
status: 📝 Planned
---

# AUTH-102 — Stateless RS256 JWT Authentication & Token Lifecycle

**As a** Shipper or Trucker,
**I want** to authenticate with my credentials and receive a short-lived RS256 access token and a long-lived HTTP-only refresh cookie,
**so that** my session is stateless, tamper-evident, and scoped to my tenant without requiring server-side session storage.

## Acceptance Criteria
- [ ] `POST /api/v1/auth/login` accepts `{email, password}`; on success returns `{ accessToken, expiresIn }` in the body and sets `Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict` — satisfies **REQ-102**
- [ ] Access token is signed with RSA-256 (`RS256`); payload contains `sub` (userId), `tenantId`, `role`, `iss`, `aud`, `iat`, `exp`; `NimbusJwtDecoder.withPublicKey(rsaPublicKey)` is used for verification in `SecurityConfig`
- [ ] `JwtService` uses an ephemeral `RSAPrivateKey` when `JWT_RSA_PRIVATE_KEY` env var is absent (dev/test only); production must supply both `JWT_RSA_PRIVATE_KEY` (PKCS#8 PEM) and `JWT_RSA_PUBLIC_KEY` (X.509 PEM)
- [ ] `POST /api/v1/auth/refresh` accepts the HTTP-only cookie, validates the refresh token against the `refresh_tokens` table (with `SELECT FOR UPDATE` to prevent replay), and issues a new access token; the old refresh token is rotated atomically
- [ ] `POST /api/v1/auth/logout` invalidates the refresh token by setting `revoked_at = NOW()`; subsequent refresh attempts with the same token return `401`
- [ ] `TenantContextFilter` (infrastructure layer) runs after `BearerTokenAuthenticationFilter`; extracts `tenantId` claim from `JwtAuthenticationToken` and binds it to `TenantContextHolder` — no `ThreadLocal` leakage across requests
- [ ] Auth endpoints (`/api/v1/auth/**`) are rate-limited to 10 requests/minute per IP via `AuthRateLimitFilter` (Bucket4j); exceeding the limit returns `429 Too Many Requests` — satisfies **NFR-501** (complexity ≤ 10)
- [ ] `refresh_tokens` table has `tenant_id` column; RLS enforces per-tenant refresh token isolation — satisfies **REQ-103**

## Related Stories
- SYS-102 (role populated from the role established at tenant invitation)
- INF-103 (RLS must be active on refresh_tokens table)
- AUD-601 (login and logout events must be audit-logged)
