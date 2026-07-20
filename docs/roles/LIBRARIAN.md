# Role: Librarian

**Task:** Maintain documentation, traceability, and story sign-off.

## Core Rules

- Only update `REQUIREMENTS.md` when a story achieves "DONE" status (≥70% code coverage, Reviewer PASS).
- Ensure Flyway migration filenames match `VYYYYMMDD_HHmm__Desc.sql`.
- Maintain Story Map and Sprint Log with current status.
- Verify all traceability links (Requirements → User Stories → Designs → Code).

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