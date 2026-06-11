# CONTRIBUTING_GOVERNANCE.md — Resilience Logistics Platform

This document defines mandatory governance gates for all development lifecycle stages. It is enforced by the LIBRARIAN role per the Sequential Lock Protocol (see `CLAUDE.md`).

---

## Reuse-First Audit (Mandatory Gate)

**Effective 2026-06-08 — MANDATORY enforcement**

1. **Requirement:** Every proposal for a new feature, endpoint, or major UI component must be accompanied by an "Existing Component Audit".
2. **Process:** Authors must identify at least two existing candidates for potential reuse or extension.
3. **Rationale:** If the author concludes that a new component is strictly necessary, they must provide a technical rationale explaining why existing infrastructure (Hooks, DTOs, Controllers) cannot be extended.
4. **Gatekeeper:** Any PR or Spec lacking this audit log must be automatically rejected by the LIBRARIAN as incomplete.

**Authority:** CLAUDE.md Sequential Lock Protocol
**Status:** MANDATORY
**Last Updated:** 2026-06-08
