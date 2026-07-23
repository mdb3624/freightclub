# FreightClub Project Audit — 2026-07-23

Scope: repo hygiene / Claude-efficiency, backend code review, frontend code review. Conducted via direct repo inspection plus two parallel subagent reviews (backend, frontend).

---

## 1. Highest-priority finding

**Broken authorization on `/api/v2/loads/**`** — `backend/src/main/java/com/freightclub/modules/load/infrastructure/rest/LoadController.java` has no `@PreAuthorize` / ownership check on any endpoint. `SecurityConfig.java` only defines rules for `/api/v1/**`; `/api/v2/**` falls through to bare `.anyRequest().authenticated()`. The legacy `/api/v1/loads` controller enforces `@loadService.isOwner(#id)` and role checks — `/api/v2` doesn't. Tenant isolation still holds (repo layer filters `tenantId`), but **within a tenant, any authenticated user — shipper or trucker — can call `publish`, `claim`, `cancel`, `startTrip`, or `deliver` on any load regardless of role or ownership.**

Action: confirm whether `/api/v2/loads` is actually wired to the frontend/live traffic. If yes, this is an active IDOR/privilege-escalation bug and should get a CHG-### and be fixed ahead of anything else in this report. If it's a dead in-progress module, it should not be reachable at all.

---

## 2. Backend code review

**High**
- `/api/v2/loads` authorization gap (§1 above).
- Spring Boot parent pinned at **3.2.5** (`backend/pom.xml:10`, released April 2024) — recommend a dependency-vulnerability scan (`mvn versions:display-dependency-updates` or OWASP dependency-check).

**Medium**
- Two parallel load-write-path implementations coexist: legacy `/api/v1/loads` and a hexagonal/DDD rewrite under `modules/load` (`/api/v2`). If v2 is experimental, it shouldn't be reachable with weaker auth than v1. If it's the real migration target, v1 needs a deprecation/sunset plan — running both indefinitely doubles audit surface.
- Test coverage: ~96 test files against ~293 main files (~33% file-name correspondence). Consistent with the 65% branch floor being met on average while coverage is concentrated unevenly — pull a JaCoCo report to see which packages are thin.

**Low**
- Several `@Entity` classes (`CarrierAvailabilityEntity`, `CarrierEquipmentEntity`, `CarrierLaneEntity`, `CarrierProfileAuditLogEntity`, `PreferredCarrierEntity`, `InvoiceEntity`, `PaymentAccountEntity`, `LoadRecommendationEntity`) omit explicit `@Table(name=...)`, relying on Hibernate's default naming strategy. Works today, but fragile against a naming-strategy change or entity rename — nothing would catch a silent mismatch until runtime.

**Good / resolved since last known state**
- No Lombok anywhere in `src/main` — mandate fully honored.
- No hardcoded secrets or hard-DELETE statements found in sampled/grepped code.
- `freightclub_runtime` had `BYPASSRLS` revoked in production (`V20260721_1405`, story US-857) — RLS is now genuinely enforced for the runtime role, backed by real tenant policies. (Corrected a stale project-memory note — see below.)
- The "duplicate KPI implementation" debt item (`DashboardSummaryService`/old `LoadQueryService` vs `KPISummaryService`) is gone — dead code was removed; current `LoadQueryService` is a live dependency of `KPISummaryService`.
- The "12 orphaned entities without Flyway migrations" item is resolved — all 33 current `@Entity` classes have a corresponding migration-created table.
- Where checked, tenant scoping does explicit `tenantId` filtering in addition to RLS session vars — real defense-in-depth, not RLS-only.

**Architectural note:** the codebase is mid-migration from a flat `controller/service/repository/domain` layout to a modular hexagonal structure (`modules/{carrier,load,payment,shipper}/{domain,application,infrastructure,presentation}`). The load module's dual controllers are the direct consequence. This should be tracked as an explicit migration story with a cutover date rather than left as an indefinite parallel-run — it's the root cause of both the v1/v2 duplication and the auth gap.

---

## 3. Frontend code review

**High**
- **Access token persisted to `localStorage`**, contradicting the documented "JWT in memory only" design. `frontend/src/store/authStore.ts:23-24,31,36-37,42-43,49-50` writes the JWT and user object to `localStorage` on every login/refresh; `AuthInitializer.tsx:18` rehydrates from it on mount. This is an XSS-exposure risk for the access token and should be fixed to match the stated (and presumably threat-modeled) design.
- Shared `Button` primitive (`components/ui/Button.tsx`) is only **partially persona-aware** — calls `usePersonaTheme()` but only branches `borderRadius` and the `ghost` variant's text color on it. `primary`/`secondary`/`danger` variants hardcode shipper cream/bronze gradients unconditionally, meaning they render wrong on carrier's dark mobile UI. Given `usePersonaTheme()` is used in only 16 files total, other shared `ui/*` primitives should get the same spot-check.
- E2E Page Object Model coverage is thin (5 page-object files vs 22 spec files) and confirmed banned selectors are present: text-based `getByText(/.../)` selectors in `e2e/trucker-full-load-lifecycle.spec.ts:230,248,265,269`, plus hits in `shipper-documents-routing.spec.ts`, `trucker-pod-upload.spec.ts`, `design-system/US-845-load-form.spec.ts` — direct violation of the testing standard banning CSS/XPath/text selectors.

**Medium**
- `frontend/src/lib/apiClient.ts:15` logs URL, token-presence, and auth state on every request with no dev/prod gate — noise at best, minor info leak in shared/support browser sessions at worst.
- `ProfilePage.tsx:92-93` and `useUpdateProfile.ts:16-43` use an ad-hoc `localStorage` key (`freightclub_profile_optimistic`) as an optimistic-update cache instead of React Query's `setQueryData`, which is the pattern used elsewhere — inconsistent state strategy for the same concern.
- `frontend/src/features/shipper/pages/ProfilePage.tsx` doesn't use `ShipperPageLayout`/`ShipperPageHeader`, unlike sibling Shipper pages — violates the mandatory template-driven-pages pattern.

**Good / not reproduced**
- The previously-documented `/api/v1/` double-prefix bug does not appear to have recurred — `apiClient.ts` uses a single `baseURL: '/api/v1'` with no per-call re-prefixing found in spot checks.
- The React Hook Form + `forwardRef` gotcha does not appear present in the shared `Input` component — correctly wired `forwardRef<HTMLInputElement, InputProps>`.
- No competing component implementations found for the same concept (no duplicate Modal/Dialog variants, etc).

**Architectural notes**
- Structure is feature-first (`features/{auth,carrier,carriers,dashboard,shipper,shippers,loads,...}`) but has **duplicate-sounding directories** — both `carrier`/`carriers` and `shipper`/`shippers` exist side by side.
- A legacy `pages/` folder still holds thin route-wrapper shims (e.g. `pages/ShipperDashboard.tsx` is a 15-line re-export of `features/shipper/pages/ShipperDashboardPage.tsx`) — signals an incomplete migration from old `pages/`-based routing to the newer `features/*/pages` pattern. Worth consolidating in one pass rather than accreting more wrapper files.
- 39 occurrences of `: any`/`as any` across 13 files — not rampant, concentrated in a few files (`useCreateLoad.ts`, `ActionZone.tsx`, `SprintPlan.tsx`), worth a follow-up sweep.

---

## 4. Repo hygiene / Claude-efficiency audit

These findings are about running this project *with* Claude Code cheaply and reliably — separate from application code quality.

**Disk/context bloat**
- `.claude/worktrees/` contains **33 leftover directories** from past agent sessions. 32 are empty stubs (harmless but cluttering); one, `chg-856-gcs-document-storage`, is a **full ~11.6k-file repo checkout** still on disk. `git worktree list` only recognizes 2 worktrees total — most of these are orphaned outside git's own bookkeeping, so `git worktree prune` won't clean them. **Recommendation:** manually verify `chg-856-gcs-document-storage` isn't in-progress work, then `git worktree remove` it (or delete + `git worktree prune`) and delete the empty stub directories. This is the single biggest disk/clutter item found.
- Root directory has **duplicate/dead planning docs**: `PROJECT_PLAN.md` (0 bytes, dead) vs `PROJECT-PLAN.md` (18.8KB, hyphen variant, same intent) — a naming collision waiting to confuse whoever edits the wrong one. Plus `ROADMAP.md`, `REQUIREMENTS.md`, `FEATURES.md`, `REMEDIATION_PLAN.md`, `BACKEND_COVERAGE_REMEDIATION_ROADMAP.md`, `CONFIGURATION_COMPLIANCE_REVIEW.md` at root — all predate and appear superseded by `docs/project/Sprint_Log.md`/`Story_Map.md`, which your own CLAUDE.md names as the current source of truth. **Recommendation:** archive these (e.g. `docs/archive/`) rather than delete outright, so nothing genuinely load-bearing is lost, but get them out of the root where they compete for attention (and get accidentally read) with the live docs.
- Three **~3.8MB raw build logs** (`backend_task3.log`, `backend_task3_fix.log`, `backend_task4.log`) sit untracked at repo root. Real risk: an agent (or you) `cat`/`tail`s one of these without `grep`-filtering first and blows a huge chunk of context on Maven download noise — exactly the failure mode already called out in `.claude/rules/testing_standards.md`'s "grep first" rule. **Recommendation:** delete or move to a `logs/`-style gitignored path.
- `handoff/Freightclub home page design.zip` (2.8MB) and a duplicate `dashboard/`, `config-authority-system/`, `freight_club_orchestration/` top-level directories exist with unclear ownership/purpose relative to the main app — worth a quick pass to confirm they're not abandoned experiments nobody's tracking.

**Always-loaded instruction budget**
- Every conversation loads: global `CLAUDE.md` (640 words) + project `CLAUDE.md` (1,145 words) + 4 rule files (`postgres-native.md`, `testing_standards.md`, `workflow.md`, `change-request-protocol.md`; 2,326 words combined) + the memory `MEMORY.md` index (now ~1,600 words) — roughly **5,700 words (~7-8K tokens) before you type a single message**, before skills or MCP server instructions are even considered. This is a deliberate governance tradeoff (multi-role SDLC enforcement), not obviously wrong, but it's worth knowing the fixed cost.
- `GEMINI.md` (840 words) and `.clauderules` (317 words) at root appear to be parallel instruction sets for a different agent/tool, largely restating ground `CLAUDE.md` already covers. If nothing actually reads `GEMINI.md`/`.clauderules` anymore, they're pure maintenance debt (two places to update the same policy); if something does, worth confirming they're not drifting out of sync with `CLAUDE.md` (a quick diff shows overlapping-but-not-identical guidance, which is a correctness risk, not just a token one).
- The `context-mode` MCP plugin injects a large `<context_window_protection>` reminder block into the conversation, and in this session it was injected **twice in the same turn** (once at the top level, once again inside the same system-reminder envelope) — that's pure duplicated overhead on every single message this plugin is active for. Worth checking the plugin/hook config for a double-registration.

**Concrete ways to use Claude more efficiently on this project going forward**
1. **Use targeted test runs during TDD iteration, full Docker protocol only for final pre-PR verification** — this is already documented in `.claude/rules/testing_standards.md` but is easy to forget mid-session; it's the single biggest token/time savings available since the full protocol (`docker compose down -v` → build → `up --build` → full suite) is expensive to run repeatedly.
2. **Grep Maven/Docker logs before ever reading them raw** — also already documented, reinforced by the fact that 3.8MB raw logs exist in the repo root right now from a session that apparently didn't do this.
3. **Clean up `.claude/worktrees/` periodically** (e.g. a `postSessionEnd` hook or a manual habit) — each stale worktree is dead weight on `find`/`grep`-across-repo operations and disk, and a background agent doing broad exploration could accidentally wander into the stale full checkout and burn context reading duplicate files.
4. **Consolidate root-level docs into `docs/`** so there's exactly one place to look — reduces the chance an agent (or you) reads a stale `ROADMAP.md` instead of the live `Story_Map.md` and builds an audit/plan on outdated assumptions.
5. **Reconsider whether `GEMINI.md`/`.clauderules` are still live** — if not, delete them; if so, either point them at `CLAUDE.md` instead of duplicating it, or accept the sync burden explicitly.

---

## 5. Project status snapshot

From `docs/project/Story_Map.md`: **25 DONE, 5 IN_PROGRESS, 42 MIGRATION_PENDING** stories. That's a large backlog of designed-but-unbuilt work relative to what's shipped — not itself a problem, but worth knowing when prioritizing the findings above against new feature work.

Most recent Sprint_Log entry (US-858, 2026-07-22) documents a real production incident: `freightclub_runtime`'s DB credentials were pointed at `neondb_owner` (the actual superuser) in production, unconditionally bypassing RLS regardless of role attributes — now fixed (PR #63), along with a stale RLS policy on `document_audit_log` and an unauthenticated `/api/test/**` endpoint that could create/delete arbitrary users in production (now `@Profile("!prod")`-gated). All three were caught and fixed same-day with a real production smoke test, not just CI. This resolves the previously-tracked "RLS bypassed for both roles" memory note — corrected in project memory as part of this audit.

---

## 6. Priority-ordered action list

1. Confirm & fix `/api/v2/loads` authorization gap (§1) — or confirm it's unreachable dead code and remove it.
2. Clean up `.claude/worktrees/` (verify + remove the 33 stale directories).
3. Archive/delete duplicate and stale root-level planning docs; delete the 3.8MB log files.
4. Fix `authStore.ts` writing the JWT to `localStorage`.
5. Make `Button.tsx` (and audit other shared `ui/*` primitives) fully persona-aware.
6. Backfill E2E Page Object Model coverage and remove banned text-selectors in the 4 flagged spec files.
7. Decide the fate of `/api/v1` vs `/api/v2` load controllers — pick one, sunset the other, track as a migration story.
8. Bump Spring Boot parent off 3.2.5 and run a dependency-vulnerability scan.
