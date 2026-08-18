# RACI Matrix — Resilience Logistics Platform (FreightClub)

Derived from the role definitions in `docs/roles/*.md` and the Sequential Lock Protocol in `CLAUDE.md`. This is a reference document, not a governed one — it is not listed in `docs/standards/Document_Ownership.md`, so it may be updated by any role/tool as the process evolves; the Librarian is the natural owner of keeping it in sync with role docs.

## Legend

- **R** — Responsible (does the work)
- **A** — Accountable (owns the outcome, signs off; exactly one A per row)
- **C** — Consulted (two-way input before/during the work)
- **I** — Informed (notified after the fact)

## Roles

| Abbreviation | Role | Source |
|---|---|---|
| BA | Business Analyst | `docs/roles/BUSINESS_ANALYST.md` |
| ARCH | Solution Architect | `docs/roles/ARCHITECT.md` |
| HFD | Human Factors Designer | `docs/roles/HUMAN_FACTORS_DESIGNER.md` |
| CODE | Coder | `docs/roles/CODER.md` |
| REV | Reviewer | `docs/roles/REVIEWER.md` |
| LIB | Librarian | `docs/roles/LIBRARIAN.md` |
| DIR | Director (Michael, the User) | External stakeholder — Gate 1 AC approval, Tier A financial/compliance calls |

---

## SDLC Activities

| Activity | BA | ARCH | HFD | CODE | REV | LIB | DIR |
|---|---|---|---|---|---|---|---|
| Write user story + Gherkin AC | **A/R** | I | I | I | I | I | C |
| INVEST self-check | **A/R** | - | - | - | - | - | - |
| Gate 1 functional approval (AC sign-off) | R | I | I | I | I | I | **A** |
| Tier A ambiguity (financial/compliance) | R | - | - | - | - | - | **A** |
| Tier B ambiguity (non-financial) | **A/R** | I | I | I | - | I | I |
| Jira story creation + US↔FREIG mapping | **A/R** | - | - | - | - | C | - |
| Field Contract Table — populate UI Field / Scope flag | **A/R** | C | C | I | - | - | - |
| Input Acceptance Gate (validate BA story) | C | **A/R** | - | - | - | - | - |
| Domain model / DB schema design (DDL, RLS, ERD) | I | **A/R** | - | C | - | - | - |
| Field Contract Table — fill API Param / DB Column / Type | - | **A/R** | C | C | - | - | - |
| Platform Reuse Check (domain-service + capability dedup) | - | **A/R** | - | C | C | - | - |
| Input Acceptance Gate (validate ARCH design) | - | C | - | **A/R** | - | - | - |
| UI/UX wireframe + interactive mockup | I | C | **A/R** | C | - | - | - |
| Style Guide ingestion + citation | - | - | **A/R** | - | C | - | - |
| Visual Fidelity Audit / No-Drift Certification | - | C | **A/R** | I | C | - | - |
| Field Contract Table validation (HFD gate) | I | C | **A/R** | - | - | - | - |
| Shell & Widget context compliance | - | C | **A/R** | I | C | - | - |
| Handoff Manifest → READY_FOR_CODER | I | I | **A/R** | I | - | I | - |
| Input Acceptance Gate (validate HFD spec) | - | - | C | **A/R** | - | - | - |
| Pre-Implementation Plan Gate (existing-tooling check, verification plan) | - | C | - | **A/R** | - | - | - |
| Service/Endpoint Reuse Check | - | C | - | **A/R** | C | - | - |
| Feature implementation (TDD Red-Green-Refactor) | I | C | C | **A/R** | - | - | - |
| Unit + integration tests, JaCoCo coverage | - | - | - | **A/R** | C | - | - |
| HFE visual parity self-check before submission | - | - | C | **A/R** | C | - | - |
| External config/secret wiring verification | - | C | - | **A/R** | C | - | - |
| Code + security + hard-gate audit | - | C | - | I | **A/R** | - | - |
| Field Contract Table traceability audit (UI→API→DB) | I | I | I | I | **A/R** | - | - |
| Visual evidence audit (screenshot vs. HFD mockup) | - | - | C | I | **A/R** | - | - |
| CI status verification (`gh pr checks`) | - | - | - | I | **A/R** | - | - |
| Review verdict (APPROVED / REJECTED / TECH DEBT) | I | I | I | I | **A/R** | I | - |
| Escalation on backward/impossible input (any role) | C | C | C | C | C | **A/R** | I |
| Change Request (CHG-###) decision (Option A/B) | I | I | I | I | I | **A/R** | I |
| Sprint_Log.md / Story_Map.md maintenance | I | I | I | I | I | **A/R** | I |
| Traceability verification (Req → Story → Design → Code) | C | C | C | C | C | **A/R** | - |
| Story DONE sign-off | I | I | I | I | C | **A/R** | I |
| Technical Debt Ledger logging | C | C | C | C | C | **A/R** | I |
| Branch enforcement / PR governance | - | - | - | R | R | **A** | - |
| Governed doc regeneration sign-off (`ARCHITECTURE.md`) | - | **A/R** | - | - | - | C | I |
| Governed doc regeneration sign-off (`PROJECT-PLAN.md`) | - | C | - | - | - | **A/R** | I |
| Governed doc regeneration (`FEATURES.md`, `REQUIREMENTS.md`) | C | I | I | I | I | **A/R** | I |

---

## Notes

- **Exactly one A per row** reflects the Sequential Lock Protocol: each phase has one owning role, and downstream roles cannot reopen an upstream role's accepted input — they escalate to LIBRARIAN (the CHG protocol) instead of going back to the C column directly mid-work.
- **DIR (Director)** only appears as A on Gate 1 AC approval and Tier A financial/compliance calls (`docs/roles/BUSINESS_ANALYST.md` §Autonomous Decision-making Protocol) — everything else in the SDLC is designed to run without Director involvement.
- **LIBRARIAN as A on escalations/CHG/DONE** reflects its role as the only forward-escalation target and the only role authorized to update `Sprint_Log.md`/`Story_Map.md`.
- Rows for governed-document regeneration mirror `docs/standards/Document_Ownership.md` exactly — that file remains the source of truth if the two ever diverge.

---

**Last Updated:** 2026-07-23
**Derived From:** `docs/roles/*.md`, `CLAUDE.md` (Sequential Lock Protocol), `docs/standards/Document_Ownership.md`
