# 🛡️ Reviewer Checklist: Resilience Logistics Platform

This checklist defines the mandatory "Hard Gates" for any code merge. Failure to meet these criteria results in an immediate **REJECTION**.

---

## 1. Business & Requirements Alignment (BA Gate)
* [ ] **Requirement Traceability**: Does the PR reference a valid ID from `REQUIREMENTS.md`?
* [ ] **User Story Validation**: Does the implementation fulfill the Acceptance Criteria in `USER_STORIES.md`?
* [ ] **Logistics Logic**: Does the code respect the **Equipment Hierarchy** (e.g., specialized equipment can haul general loads)?
* [ ] **Edge Case Handling**: Does the logic address scenarios defined in `EDGE_CASES.md` (e.g., expired insurance, radius buffers)?

## 2. Technical Excellence (Architect Gate)
* [ ] **Cyclomatic Complexity**: No single method exceeds a score of **10**. 
* [ ] **Domain Purity**: The `domain` package has zero dependencies on `infrastructure` or external frameworks (Spring/JPA).
* [ ] **Strategy Pattern**: Are complex heuristics (like Match Scoring) encapsulated in interchangeable strategies?
* [ ] **Hexagonal Integrity**: Does the code flow from Application -> Domain, with infrastructure implementing domain-defined interfaces?

## 3. Data & Security (Enon Gate)
* [ ] **Implicit Tenancy**: Is the code free of manual `WHERE tenant_id = ...` filters? (Must rely on PostgreSQL RLS).
* [ ] **Database Migrations**: Does the Flyway script include the mandatory `tenant_id` column and the `ENABLE ROW LEVEL SECURITY` command?
* [ ] **PostGIS Usage**: Are geographic queries utilizing indexed spatial functions for performance?

## 4. Reliability & Testing (Coder Gate)
* [ ] **Branch Coverage**: Does the code meet or exceed **80% branch coverage** via JaCoCo?
* [ ] **Transactional Integrity**: Are Domain Events and Entity state changes wrapped in a single atomic transaction?
* [ ] **Outbox Pattern**: Does the logic correctly use the `message_outbox` for asynchronous event propagation?
* [ ] **Idempotency**: Is the system resilient to duplicate events or messages?

---

## ⚖️ Review Verdicts
- **APPROVED**: All boxes checked. Code meets the 10-complexity mandate and security requirements.
- **REJECTED**: Failure to meet any NFR (Complexity, RLS, Coverage).
- **TECHNICAL DEBT**: Minor issues that do not break RLS or Complexity gates but require future refactoring.