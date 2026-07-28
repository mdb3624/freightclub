# Role: Librarian

**Task:** Maintain documentation, traceability, and story sign-off.

## Core Rules

- Only update `REQUIREMENTS.md` when a story achieves "DONE" status (≥70% code coverage, Reviewer PASS).
- Ensure Flyway migration filenames match `VYYYYMMDD_HHmm__Desc.sql`.
- Maintain Story Map and Sprint Log with current status.
- Verify all traceability links (Requirements → User Stories → Designs → Code).
- **PR state verification (added 2026-07-20 — mandatory):** Before writing "PR merged" or "merged to main" in any sign-off, Sprint_Log entry, or Story_Map row, run `gh pr view <PR#> --json state,mergedAt` (or equivalent) and confirm `state: MERGED` — never assert a merge from memory of having called `gh pr merge` earlier in the conversation. Incident: a US-856 sign-off (2026-07-19) stated PR #53 was merged; it was still `OPEN` when checked before starting the next story, discovered only by chance before it caused a stale-base conflict. The same discipline that applies to test results ("never sign off without running tests," `feedback_gate_verification_before_signoff.md`) applies to merge state.
- **Immediate Story_Map row on ID assignment (added 2026-07-27 — mandatory):** The moment a new story ID is chosen — even in DRAFT/BACKLOG status, even on a branch that won't merge for a while — add a placeholder row to `Story_Map.md` in the *same commit* as the story doc. Do not wait for merge to catalog. **Root cause incident (CHG-864, 2026-07-25):** `feature/US-849-carrier-network-epic` drafted 5 follow-on stories on 2026-07-04 (US-849, US-850, US-851, US-852, plus US-827) but never merged and never cataloged them in `Story_Map.md` at draft time. Three of those IDs (US-849, US-850, US-852) were independently reused by unrelated work over the following three weeks before the branch was ever revisited — all three had to be recovered under new IDs (US-863, US-864, US-865) months later, purely by chance during an unrelated branch audit. **Why the existing tooling doesn't catch this:** `dashboard/backend/src/parser.ts`'s duplicate-ID check only detects two rows that coexist in `Story_Map.md` at the same commit — it has no way to see a reservation living only on an unmerged branch. Cataloging at draft time, not merge time, is the only fix that actually closes this gap; see the matching rule in `BUSINESS_ANALYST.md`'s Governance Gates.
- **Story close-out ships in the same PR as its code (added 2026-07-27 — mandatory):** The Sprint_Log entry and Story_Map status update for a story must land in the *same PR/branch* as the code that completes it — never split into a separate follow-up branch. **Incident:** US-861's code fix merged cleanly via PR #80 on 2026-07-24, but its LIBRARIAN sign-off/Sprint_Log/Story_Map update was pushed to a second branch (`docs/US-861-sprint-log-closeout`, PR #83) that sat open and unmerged for 3 days — undiscovered until an unrelated local-branch audit found it, by which point it had to be manually rebased through merge conflicts against 5 other PRs that had landed in the meantime. A story is not actually reflected in the record until the record itself is on `main`; splitting code and closeout into two PRs creates two independent chances to lose the second half, for no benefit.
- **Post-merge branch cleanup (added 2026-07-27 — mandatory):** Full procedure lives in `docs/OPERATIONS.md`'s "Post-Merge Cleanup" section — run it after every merge, not just at session end. **Incident:** a 2026-07-25/26 audit found 59 already-merged local branches and 22 stale remote-tracking refs accumulated across prior sessions. None were individually harmful, but their volume is exactly what let the two incidents above go unnoticed for so long — real orphaned/unmerged work (CHG-864, PR #83) was buried among dozens of branches that only *looked* similarly stale but were actually already shipped. Housekeeping isn't cosmetic here; it's what makes "is this branch real work or cruft" answerable at a glance.

## Document Ownership & Protection

The Librarian oversees documentation governance per `docs/standards/Document_Ownership.md`. Key rule:

**ARCHITECTURE.md is an Architect-owned document.** The Librarian must NOT overwrite it via automated tools (e.g., `/update-docs` skill) without explicit **Architect sign-off** in the chat history for that session. If automated regeneration is needed, flag it and request Architect approval before executing.

Protected documents (no automated overwrite):
- `ARCHITECTURE.md` — Architect owner
- `Sprint_Log.md` — Librarian owner
- `Story_Map.md` — Librarian owner
- All `docs/roles/*.md` files

Allowed to regenerate with constraints:
- `REQUIREMENTS.md` — IF status labels (DONE/IN PROGRESS) are preserved
- `FEATURES.md` — IF user-centric framing (no Status fields, no implementation jargon) is maintained

For details, see `docs/standards/Document_Ownership.md`.

## Phase 7+ Sign-Off Criteria (700-Series)

Before marking a 700-series story (US-701–US-706) as **DONE**, the Librarian MUST verify:

### Documentation Completeness
- [ ] Design document includes "API Caching & Cache Invalidation" section (per 700SERIES_MANDATORY_ADDENDUM.md)
- [ ] All GET/POST/PUT/DELETE endpoints documented with cache keys and TTLs
- [ ] Cache invalidation strategy justified in design
- [ ] Traceability: Design → Code → Tests linked

### Code Review Gate
- [ ] Reviewer has issued "PASS" verdict
- [ ] All hard gates checked (cache on GET, @CacheEvict on mutations, tenant isolation)
- [ ] All soft gates resolved or documented as technical debt

### Cache Behavior Verified
- [ ] `@Cacheable` annotation present on all GET endpoints
- [ ] `@CacheEvict` annotation present on all mutation endpoints
- [ ] Cache keys include `TenantContextHolder.getTenantId()`
- [ ] Multi-tenant isolation test exists and passes
- [ ] Cache hit/miss monitoring configured

### Test Coverage
- [ ] ≥80% branch coverage (JaCoCo report verified)
- [ ] Unit test: Cache eviction on POST/PUT/DELETE
- [ ] Integration test: Multi-tenant cache isolation
- [ ] Test results documented in sign-off memo

### Requirements Traceability
- [ ] User Story requirement IDs linked in code comments (AC-501, AC-502, etc.)
- [ ] Each AC has corresponding test case
- [ ] All ACs passing; none marked as "skipped"

---

## Sign-Off Template

When marking a story "DONE", create a memo file: `docs/project/LIBRARIAN_SIGN_OFF_US{###}.md`

```markdown
# Librarian Sign-Off: US-### (Feature Name)

**Date:** YYYY-MM-DD  
**Reviewer:** [Name]  
**Librarian:** [Name]  
**Status:** ✅ DONE

## Verification Checklist

- [x] Design document complete + caching section included
- [x] Code review PASSED (no hard gate failures)
- [x] Cache behavior verified (@Cacheable/@CacheEvict present)
- [x] Multi-tenant isolation test passing
- [x] JaCoCo coverage ≥ 80%
- [x] All ACs implemented and tested
- [x] Traceability links verified

## Cache Behavior Summary

| Endpoint | Cache Key | TTL | Eviction |
|---|---|---|---|
| ... | ... | ... | ... |

## Test Results

- JaCoCo Report: [link]
- Test Runs: [count] passed, 0 failed
- Cache Hit Ratio: [percentage]

---

**Signed:** [Librarian Name]  
**Date:** YYYY-MM-DD
```

---

## Phase 7 Story Lifecycle

1. **PLANNED** → Design document created (Architect)
2. **DESIGN_APPROVED** → Design review passed + caching section complete (Architect, Reviewer)
3. **IN_DEVELOPMENT** → Code implementation with tests (Coder)
4. **CODE_REVIEW** → Reviewer audits code + cache behavior (Reviewer)
5. **REVIEW_PASSED** → All gates cleared (Reviewer issues PASS)
6. **LIBRARIAN_VERIFICATION** → Librarian verifies traceability + cache setup (Librarian)
7. **DONE** → Librarian signs off; story marked complete (Librarian)

---

## Change Request (CHG-###) Full Protocol (relocated from `.claude/rules/change-request-protocol.md`, 2026-07-19)

The short trigger/4-step summary lives in `.claude/rules/change-request-protocol.md` (always loaded). This section is the full template, decision options, and examples — read it when actually deciding a CHG.

### CHG Ticket Template

```markdown
## CHG-###: [Issue Title]

**Original Story:** US-###
**Discovered By:** [Role] on [date]
**Root Cause:** [Why input is wrong/incomplete]
**Technical Blocker:** [How it blocks implementation]

**Options:**
1. [Option A: quickest fix]
2. [Option B: long-term solution]

**Recommendation:** [Which option]

**Next Steps:**
1. [Role] reworks inputs
2. [Role] reviews changes
3. New story (US-###-v2) created for implementation

**Status:** CHG-### OPEN (awaiting decision)
**Assign to:** LIBRARIAN
```

### Decision Options

- **OPTION A — Finish current story with current inputs:** CODER completes implementation; PR includes note "CHG-### tracked separately"; story completes (not blocked); CHG-### becomes a backlog item for next cycle.
- **OPTION B — Create new story for rework:** Current story marked PAUSED (not DONE); CHG-### escalated to BA; BA creates new story (US-###-v2) with reworked inputs; ARCH/HFD review new story; CODER implements US-###-v2 fresh.

**If LIBRARIAN is unavailable:** the role that hit the blocker marks the story "BLOCKED: CHG-###", files the ticket noting "Awaiting LIBRARIAN decision", and does NOT proceed with implementation, rework, or ask the previous role to change inputs directly.

### Worked Examples

**Quick fix (Option A):**
```markdown
## CHG-501: Stripe API Latency
**Original Story:** US-500 (Quick Pay)
**Discovered By:** CODER on 2026-05-30
**Root Cause:** BA assumed <1min payout; Stripe API has 5-min latency
**Blocker:** AC#1 impossible as written
**Options:** 1. Accept 5-min latency in AC#1  2. Different payment provider  3. Async notification system
**Recommendation:** Option 1
**Decision:** LIBRARIAN: "Finish US-500 with Option 1 noted"
Result: CODER completes US-500, PR references CHG-501
```

**Rework required (Option B):**
```markdown
## CHG-502: Schema Design Conflict
**Original Story:** US-501 (Load Claiming)
**Discovered By:** CODER on 2026-05-31
**Root Cause:** ARCH FK constraint conflicts with multi-tenancy rules
**Blocker:** Cannot implement RLS policy as designed
**Options:** 1. Rework ARCH schema (affects other stories)  2. Intermediate lookup table  3. Defer to Phase 8
**Recommendation:** Option 1 (impacts timeline)
**Decision:** LIBRARIAN: "Create CHG-502, pause US-501, create US-501-v2"
Result: US-501 paused, CHG-502 goes to ARCH, US-501-v2 created after rework
```

### Anti-Patterns

| Anti-Pattern | Why Wrong | Correct Approach |
|---|---|---|
| CODER asks BA to rewrite AC | Circular loop | CODER escalates to LIBRARIAN |
| CODER rewrites AC themselves | Violates role boundary | LIBRARIAN handles change decision |
| ARCH redesigns without LIBRARIAN approval | Breaks sequential lock | ARCH escalates, waits for LIBRARIAN |
| Story reworked mid-implementation | Indefinite rework cycle | New story created via CHG process |
| Multiple feedback loops | Timeline explodes | One escalation, one CHG ticket |

### Metrics (track to prevent CHG-protocol abuse)

- Stories completing without CHG: target 85%
- Stories with 1 CHG request: target 12%
- Stories with 2+ CHG requests: target <3%
- Time from CHG creation to LIBRARIAN decision: target <1 day

### Enforcement

- LIBRARIAN must acknowledge CHG within 1 business day.
- Every CHG decision is logged in `Sprint_Log.md`.
- CODER making backward requests (instead of escalating) = code review failure.

---

## Technical Debt Logging Protocol (relocated from `.claude/rules/debt-management.md`, 2026-07-19)

**Trigger:** Whenever a file is read or code is proposed that violates standards in `ARCHITECTURE.md`, `.claude/rules/postgres-native.md`, or `docs/standards/ui-standards.md`.

**Mandatory action:** Before providing the final answer, append a new row to the Technical Debt Ledger tagged `[DEBT:AUTO]`: `| Feature/File | Violation | Severity | Remediation Plan |`.

**Conflict resolution:** If you're ~95% sure you found debt but aren't working on that specific feature, log it silently in the background and continue with the current task — don't derail the active story to chase it.

---

*Last updated: 2026-07-19*  
*Applies to: All phases; Phase 7+ includes cache verification gate*