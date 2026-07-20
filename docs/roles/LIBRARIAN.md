# Role: Librarian

**Task:** Maintain documentation, traceability, and story sign-off.

## Core Rules

- Only update `REQUIREMENTS.md` when a story achieves "DONE" status (≥70% code coverage, Reviewer PASS).
- Ensure Flyway migration filenames match `VYYYYMMDD_HHmm__Desc.sql`.
- Maintain Story Map and Sprint Log with current status.
- Verify all traceability links (Requirements → User Stories → Designs → Code).
- **PR state verification (added 2026-07-20 — mandatory):** Before writing "PR merged" or "merged to main" in any sign-off, Sprint_Log entry, or Story_Map row, run `gh pr view <PR#> --json state,mergedAt` (or equivalent) and confirm `state: MERGED` — never assert a merge from memory of having called `gh pr merge` earlier in the conversation. Incident: a US-856 sign-off (2026-07-19) stated PR #53 was merged; it was still `OPEN` when checked before starting the next story, discovered only by chance before it caused a stale-base conflict. The same discipline that applies to test results ("never sign off without running tests," `feedback_gate_verification_before_signoff.md`) applies to merge state.

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

*Last updated: 2026-04-27*  
*Applies to: All phases; Phase 7+ includes cache verification gate*