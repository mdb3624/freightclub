# Story Map — FreightClub Load Board

This document maps user stories to their acceptance criteria, technical implementation, and test coverage.

---

## Navigation

- **[USER_STORIES.md](USER_STORIES.md)** — Story index and quick reference
- **[stories/](stories/)** — Detailed story definitions (one file per story)
- **[REQUIREMENTS.md](REQUIREMENTS.md)** — Phase-by-phase requirements mapping

---

## Story Catalog

### Phase 1: Core Load Lifecycle

#### US-102: Multi-Tenant Context & JWT Authentication
- **Epic:** Module 1 – Onboarding & Identity
- **Category:** Technical Infrastructure
- **Priority:** Blocker
- **Status:** Backlog
- **File:** [stories/US-102.md](US-102.md)
- **Acceptance Criteria:** AC-1 through AC-7
  - AC-1: TenantContextHolder Thread-Safety
  - AC-2: JwtAuthenticationFilter Context Initialization
  - AC-3: Context Cleanup in Finally Block
  - AC-4: No-Lombok Policy Compliance
  - AC-5: Spring Security Integration
  - AC-6: JWT Claim Validation
  - AC-7: Documentation & Traceability
- **Implementation Files:**
  - `backend/src/main/java/com/freightclub/security/TenantContextHolder.java`
  - `backend/src/main/java/com/freightclub/security/JwtAuthenticationFilter.java`
- **Test Files:** (To be created)
  - `backend/src/test/java/com/freightclub/security/TenantContextHolderTest.java`
  - `backend/src/test/java/com/freightclub/security/JwtAuthenticationFilterTest.java`

---

## How to Add a New Story

1. Create a new Markdown file in `stories/US-xxx.md`
2. Follow the template from [stories/US-102.md](US-102.md)
3. Include sections:
   - User Story statement
   - Acceptance Criteria (AC-1 through AC-N)
   - Definition of Done
   - Technical Notes & Constraints
   - Related Artifacts
4. Update [USER_STORIES.md](USER_STORIES.md) with entry
5. Update this map with story details

---

## Coverage Tracking

| Story | ACs | Tests | Coverage | Status |
|---|---|---|---|---|
| US-102 | 7 | Pending | Pending | Backlog |

---

## Related Documents

- **Business Requirements:** [REQUIREMENTS.md](REQUIREMENTS.md)
- **Architecture:** [ARCHITECTURE.md](ARCHITECTURE.md)
- **Technical Debt:** `.claude/learnings.md`
- **Project Constitution:** [PROJECT_CONSTITUTION.md](PROJECT_CONSTITUTION.md)
