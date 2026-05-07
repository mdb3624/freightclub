# AxleStack / FreightClub — Architecture Audit
**Date:** 2026-05-07 | **Auditor:** Senior Systems Architect (AI-assisted) | **Scope:** Full-stack, Infrastructure, Roadmap

---

## 1. Current State Summary

### Platform Identity
FreightClub is a multi-tenant SaaS load board. Shippers post freight loads; owner-operator truckers browse, claim, and deliver them. The backend is a Spring Boot 3.2.5 / Java 21 monolith deployed to GCP Cloud Run. The frontend is a React 18 / TypeScript / Vite SPA. The database is PostgreSQL 16 (Neon) with Row-Level Security enforcing tenant isolation.

### Phase Progress (Story Map)
| Status | Count | Coverage |
|---|---|---|
| ✅ COMPLETED | ~15 | Phases 1, 1.1, 1.2, 2 + US-701 |
| 🔄 IN_PROGRESS | 2 | Phase 1 (US-102), Phase 3 (US-308) |
| 🟡 PARTIAL | 9 | Phases 3, 4, 7 |
| ⚠️ MIGRATION_PENDING | 63 | Phases 3–9 |
| **TOTAL** | **80** | — |

**Effective completion: ~19% of the full roadmap.** The platform has a solid, working core (auth, load lifecycle, notifications, document upload, ratings, carrier profiles) but the majority of the feature surface — payments, messaging, bidding, compliance, financial intelligence, admin tools — is unstarted.

### What Works in Production
- Multi-tenant registration, JWT (RS256), refresh token rotation
- Full load lifecycle: DRAFT → OPEN → CLAIMED → PICKED_UP → DELIVERED
- Load board with filtering, claiming with pessimistic locking
- BOL generation, document upload (S3), POD photo workflow (partial)
- Email + in-app notifications
- Bidirectional ratings (partial)
- EIA diesel pricing with 6-hour cache
- Carrier profiles (equipment, lanes, availability)
- GCP Cloud Run deployment with Neon PostgreSQL

---

## 2. Core Architecture Assessment

### 2.1 Monolith vs. Distributed Monolith

**Finding: Controlled drift — not yet a problem, but the window to correct it is now.**

The codebase contains two parallel structural layers:

| Layer | Package | State |
|---|---|---|
| Legacy | `com.freightclub.{controller,service,repository,domain}` | Active — handles all live features |
| Hexagonal modules | `com.freightclub.modules.*` | Emerging — load module partially migrated |

The `modules/load` application layer still imports `com.freightclub.domain.EquipmentType` from the legacy root. This cross-layer coupling means the two architectures are not isolated — they share domain types. The `SecurityIntegrationTest` explicitly `@MockBean`s the legacy `LoadService` to boot the context, confirming both service layers are simultaneously live.

**Verdict:** Single deployable unit (not microservices). The hexagonal refactor is partially in flight but not enforced as a hard gate. If left unmanaged, every new feature risks landing in the legacy layer instead of the modules layer, deepening the dual-service coupling.

**Recommendation:** Declare a migration deadline. Retire the legacy `LoadService` within 30 days by completing the modules migration. Enforce via a package-cycle check in the Maven build (ArchUnit or `maven-enforcer`).

### 2.2 PostgreSQL Migration Health

**Finding: Migration is complete and correct. Several PostgreSQL-native capabilities are underutilized.**

- RLS is enabled on all core tables and enforced via `app.current_tenant_id` session variable. ✅
- JSONB is used in `document_audit_log.metadata`. ✅
- Soft deletes (`deleted_at`) and composite indexes on `(tenant_id, deleted_at)` are present. ✅
- Outbox pattern (`message_outbox`) is implemented and wired to `LoadPublishedEvent`, `LoadClaimedEvent`, `LoadDeliveredEvent`. ✅

**Untapped optimizations:**
1. **UUID native type** — The `postgres-native.md` standard calls for UUID primary keys, but the schema uses `VARCHAR(36)`. UUID columns are 16 bytes vs. 36 bytes for VARCHAR, giving ~2× index density on large tables. This is a schema inconsistency between the constitution and implementation.
2. **Full-text search** — `LoadSpecification` uses `LIKE 'city%'` (B-tree prefix scan). The debt ledger flags `tsvector + GIN` as a future optimization. This will become a visible performance issue when load volume grows.
3. **`SKIP LOCKED`** — The outbox relay could use `SELECT FOR UPDATE SKIP LOCKED` for concurrent relay workers without contention.

---

## 3. Infrastructure & Tooling Assessment

### 3.1 Docker & Environment Parity

**Finding: Three Compose files exist (`docker-compose.yml`, `docker-compose.prod.yml`, `docker-compose.test.yml`). Parity is partially maintained.**

- Local dev uses Vite dev server (port 9090) proxied to Spring Boot (port 8080).
- Production is GCP Cloud Run — no Docker container runtime, Cloud Run manages the container lifecycle directly.
- The `docker-compose.prod.yml` likely targets a different runtime model than Cloud Run, which means the "prod compose" may not reflect actual production behavior.

**Risk:** Developers testing locally with `docker-compose.prod.yml` may not be validating against the actual Cloud Run execution environment (no persistent filesystem, cold start behavior, PORT env var injection). There is no evidence of a CI/CD pipeline (`/.github/workflows/` appears empty or absent).

**Recommendation:** Add a GitHub Actions workflow for: build → test → JaCoCo gate → Docker build → Cloud Run deploy (staging). Without CI, every deployment is a manual operation and the JaCoCo 80% branch coverage gate is only enforced locally.

### 3.2 EIA API Resilience

**Finding: Caching is implemented (6-hour TTL via Bucket4j + Spring Cache). Resilience for API downtime is not confirmed.**

The EIA integration satisfies the basic NFR-504 caching requirement. However, there is no logged evidence of:
- A **fallback value** (last known price) when EIA is unreachable
- A **circuit breaker** (Resilience4j) to prevent cascading timeouts
- **Alerting** when the EIA price becomes stale beyond a threshold

If the EIA API goes down for > 6 hours, truckers see a stale or null diesel price — a UX failure during load profitability calculation.

**Recommendation:** Add a Resilience4j circuit breaker with a last-known-price fallback stored in the DB. Cost: ~2 hours of work.

---

## 4. Development Workflow Assessment

### 4.1 Claude Code / Project Constitution Effectiveness

**Finding: The governance system is functioning but requires manual enforcement at the margins.**

The `CLAUDE.md` role-based constitution (Architect, Coder, Reviewer, BA, Librarian) is well-structured and enforces real gates — no code without a user story, no story marked DONE without Reviewer PASS, Flyway naming convention. The Technical Debt Ledger (`learnings.md`) is actively maintained with `[DEBT:AUTO]` entries.

**Gaps observed:**
- The `modules` migration has no enforced architectural gate in the build (no ArchUnit). Standards exist in documentation but are not machine-verifiable.
- The PARTIAL/MIGRATION_PENDING stories outnumber COMPLETED by 4:1. This suggests sprint planning isn't forcing story completion before opening new ones — a velocity risk.
- No CI pipeline means the constitution's test coverage gate (`mvn verify` with JaCoCo) is opt-in locally.

### 4.2 Maven Dependency Health

**Finding: Spring Boot 3.2.5 is behind current. One known library issue is logged.**

| Library | Current | Status |
|---|---|---|
| Spring Boot | 3.2.5 | Behind — 3.3.x / 3.4.x available with security patches |
| JJWT | 0.12.6 | Current ✅ |
| Java | 21 (LTS) | Current ✅ |
| Bucket4j | (via Boot BOM) | Verify version |

Spring Boot 3.2.5 has reached its OSS end-of-support window. The 3.3.x line includes CVE patches for Spring Security. Upgrading to 3.3.x is a low-risk, high-value action.

**Known issue (High — from debt ledger):** `JwtService` generates an ephemeral RSA key pair at startup when `JWT_RSA_PRIVATE_KEY` / `JWT_RSA_PUBLIC_KEY` env vars are absent. In production, if these env vars are misconfigured, all tokens become invalid on restart and there is no revocation path. No JWKS endpoint is exposed, preventing third-party resource servers from validating tokens.

---

## 5. Gap Analysis: Backend API vs. Frontend Requirements

### What Backend Has vs. What Frontend Needs (Next 3 Phases)

| Domain | Backend | Frontend | Gap |
|---|---|---|---|
| Auth / Registration | ✅ Complete | ✅ Complete | None |
| Load Lifecycle | ✅ Complete | ✅ Complete | None |
| Notifications | ✅ Complete | ✅ Complete | None |
| Document upload (BOL/POD) | ✅ Partial (US-305 MIGRATION_PENDING) | Partial | POD UI incomplete — blocks Phase 7b IFTA |
| Ratings | ✅ Partial | ✅ Partial | Reputation badge on load board (US-405) not wired |
| Carrier Profiles (equipment/lanes) | ✅ Complete | ✅ Complete (partial features) | US-702–706 PARTIAL |
| **Payments (Phase 5)** | ❌ Not started | ❌ Not started | Entire phase — Stripe/ACH blocked |
| **Messaging (Phase 6)** | ❌ Not started | ❌ Not started | Entire phase — WebSocket broker blocked |
| **Shipper/Trucker onboarding** | ❌ Not started | ❌ Not started | US-713/714 just created — READY_FOR_DESIGN |
| DOT compliance (Phase 7A) | ❌ Not started | ❌ Not started | Insurance/CDL/USDOT verification |
| Financial intelligence (Phase 7b) | ❌ Not started | ❌ Not started | Entire phase |
| HOS widget | ❌ Stubbed | ❌ Stubbed | Not in roadmap |

**Summary:** Backend is ahead of frontend in all completed features. The frontend has feature-sliced architecture and the pattern is correct; it simply needs populated feature slices for Phases 5–9.

---

## 6. Technical Debt Heatmap

| Severity | Area | Item | Blast Radius |
|---|---|---|---|
| 🔴 HIGH | Security | No JWKS endpoint; ephemeral key fallback in dev — production key misconfiguration = full token invalidation, no revocation | All users |
| 🔴 HIGH | Architecture | Dual-service layer (legacy + modules) — `LoadService` exists in both; integration test structurally coupled to legacy service | All load features |
| 🟠 MEDIUM | Schema | `VARCHAR(36)` IDs vs. native `UUID` type — index bloat as tables grow; inconsistent with `postgres-native.md` standard | DB performance at scale |
| 🟠 MEDIUM | Architecture | `modules/load` imports `EquipmentType` from legacy `com.freightclub.domain` — hexagonal boundary violation | Module isolation |
| 🟠 MEDIUM | Resilience | No circuit breaker or last-known-price fallback for EIA API | Trucker profitability UX |
| 🟠 MEDIUM | Dependencies | Spring Boot 3.2.5 EOL — missing downstream CVE patches from 3.3.x | Security posture |
| 🟡 LOW | Search | Full-text load search uses `LIKE 'city%'` — no `tsvector + GIN` index | Search performance at scale |
| 🟡 LOW | CI/CD | No GitHub Actions pipeline — coverage gate and deployment are manual | Deployment reliability |
| 🟡 LOW | Testing | Frontend has only 17 Vitest tests covering ~5% of feature surface | Frontend regression risk |

---

## 7. Top 3 Go-Live Risks

### Risk 1 — JWT Key Management (Security / P0)
**Description:** Production RSA keys (`JWT_RSA_PRIVATE_KEY` / `JWT_RSA_PUBLIC_KEY`) are stored as env vars with no rotation mechanism and no JWKS endpoint. A compromised key requires a full service restart to invalidate tokens. There is no out-of-band validation path for future integrations.

**Probability:** Medium. **Impact:** Critical — full auth failure.

**Mitigation:** Expose `/.well-known/jwks.json` via Spring Security OAuth2; store key pair in GCP Secret Manager with versioned rotation. Estimated effort: 1 sprint.

---

### Risk 2 — Payments Not Started (Revenue / P0)
**Description:** All 7 Phase 5 stories (Stripe/ACH integration, invoice generation, settlement workflow) are MIGRATION_PENDING with a "BLOCKER: Payment processor" dependency. The platform's core value proposition — paying truckers for completed loads — cannot be delivered without this. Onboarding a payment processor (Stripe Connect) takes 2–4 weeks including KYC/compliance review.

**Probability:** High (it simply hasn't started). **Impact:** Critical — platform is non-commercial without it.

**Mitigation:** Begin Stripe Connect application immediately (independent of dev work). Start US-502 architecture in parallel.

---

### Risk 3 — Feature Breadth vs. Depth (Delivery / P1)
**Description:** 63 of 80 stories are MIGRATION_PENDING and 9 are PARTIAL. With the current pattern of opening stories across multiple phases simultaneously, there is a risk of arriving at Go-Live with many features "partially working" rather than a smaller set that are fully hardened.

**Probability:** High. **Impact:** High — alpha users encountering half-finished flows churn immediately.

**Mitigation:** Declare an Alpha Scope freeze. Identify the minimum viable flow (register → post load → claim → deliver → rate) and ensure every story in that path is COMPLETED with 80%+ coverage before opening new phases.

---

## 8. Prioritized 30-Day Action Plan (Dev → Stable Alpha)

### Week 1 — Harden the Foundation
| # | Action | Owner | Effort | Risk Reduced |
|---|---|---|---|---|
| 1 | Upgrade Spring Boot 3.2.5 → 3.3.x | Coder | 0.5d | CVE exposure |
| 2 | Expose `/.well-known/jwks.json`; move RSA keys to GCP Secret Manager | Coder/Infra | 1d | Risk 1 (JWT) |
| 3 | Add Resilience4j circuit breaker to EIA fetcher with DB-backed last-known-price fallback | Coder | 0.5d | EIA downtime |
| 4 | Create GitHub Actions CI workflow: build → test → JaCoCo gate → Cloud Run staging deploy | Infra | 1d | Manual ops |

### Week 2 — Close the Partial Stories
| # | Action | Owner | Effort | Risk Reduced |
|---|---|---|---|---|
| 5 | Complete US-702 (Preferred Lanes) + US-703 (Availability) — both PARTIAL | Coder | 2d | Phase 7 gap |
| 6 | Complete US-305 (POD Upload UI) — blocks Phase 7b IFTA and financial intelligence | Coder | 1d | Phase 7b BLOCKER |
| 7 | Complete US-401–403 (Ratings) — currently PARTIAL; required for US-501 invoice dependency | Coder | 1.5d | Phase 5 gate |
| 8 | Complete US-713/714 (Shipper Profile Setup + Trucker Onboarding) — READY_FOR_DESIGN | Architect → Coder | 2d | UX gap |

### Week 3 — Architecture Integrity
| # | Action | Owner | Effort | Risk Reduced |
|---|---|---|---|---|
| 9 | Retire legacy `LoadService` — complete `modules/load` migration; remove legacy coupling from integration tests | Coder | 2d | Risk (dual-service) |
| 10 | Add ArchUnit test enforcing no imports from `com.freightclub.domain` within `com.freightclub.modules.*` | Coder | 0.5d | Architectural drift |
| 11 | Migrate `EquipmentType` to `modules/load/domain` (shared kernel); remove legacy domain import | Coder | 0.5d | Module boundary |

### Week 4 — Payments Foundation & Alpha Scope Lock
| # | Action | Owner | Effort | Risk Reduced |
|---|---|---|---|---|
| 12 | Submit Stripe Connect platform application (KYC/compliance — external process, start now) | Business | 0.5d admin | Risk 2 (Payments) |
| 13 | Architect US-501 (Auto Invoice Generation) — design only, no code | Architect | 1d | Payment path |
| 14 | Declare Alpha Scope: lock story list to minimum viable load-lifecycle flow; mark all others DEFERRED | BA/Librarian | 0.5d | Risk 3 (breadth) |
| 15 | Expand frontend Vitest coverage to ≥ 40 tests covering golden-path flows | Coder | 1.5d | Frontend regressions |

---

## Appendix: Key Metrics Snapshot

| Metric | Value |
|---|---|
| Backend Java files | ~130+ |
| Backend test count | 109+ (JaCoCo ≥ 70% branch) |
| Frontend test count | 17 (Vitest) |
| Flyway migrations | ~18+ (all PostgreSQL) |
| Story completion | 19% (15/80) |
| Spring Boot version | 3.2.5 (behind) |
| Java version | 21 LTS ✅ |
| Database | PostgreSQL 16 / Neon ✅ |
| Auth | RS256 JWT + HTTP-only refresh cookie ✅ |
| Multi-tenancy | RLS via `app.current_tenant_id` ✅ |

---

*Audit based on static analysis of source tree, Flyway migrations, Story Map, Technical Debt Ledger, POM, and ADR records. Dynamic runtime profiling and load testing not in scope.*
