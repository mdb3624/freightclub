# Command Center Implementation Roadmap

**Status:** Phase 10 Kickoff (2026-06-16)  
**Authority:** LIBRARIAN (Traceability & Scheduling)  
**Updated:** 2026-06-10

---

## Overview

This roadmap charts the transition from legacy Shipper Dashboard (Phase 7) to the Command Center architecture (Phase 10+). The Command Center is a domain-driven, user-centric platform delivering shipper value through real-time KPI visibility, intelligent load routing, and reliable fallback strategies.

**Core Principle:** All stories are user-value-driven, not infrastructure-driven. Each feature maps to measurable shipper outcomes.

---

## Phase 10: Domain Alignment (User-Value Stories)

**Dates:** 2026-06-16 → 2026-06-27  
**Effort:** 8 days (2 engineers)  
**Delivery:** 8 FULL-STACK user-feature stories (no infrastructure-only tasks)

### Phase 10 Stories (User-Centric)

| Story ID | Feature | User Value | Actor(s) | Scope |
|----------|---------|-----------|---------|-------|
| **US-820** | KPI Summary Display | See business health at a glance (active count, on-time %, cost/mile) | Shipper | FULL_STACK |
| **US-821** | Status-First Shipment List | Prioritize delayed loads first (red flags top) | Dispatcher | FULL_STACK |
| **US-822** | Tiered Notification Bell | Stay informed without overwhelm (T1/T2/T3 severity) | Shipper | FULL_STACK |
| **US-823** | Preferred Carrier Feed | Assign loads to trusted carriers in 1 click | Dispatcher | FULL_STACK |
| **US-824** | Empty State Onboarding | Post first load in < 2 minutes (video + form + CSV) | New Shipper | FULL_STACK |
| **US-825** | Get a Quote Workflow | Price loads competitively (live → cached → manual fallback) | Shipper | FULL_STACK |
| **US-826** | Role-Based Permissions | Prevent accidental $50K cancellations (4-tier RBAC) | Admin | FULL_STACK |
| **US-827** | Mobile + Accessibility | WCAG AA compliance + high-glare mobile UX | All Personas | FULL_STACK |

**Key Constraint:** Each story MUST include backend domain service + frontend UI + tests. No "domain-only" or "repository-only" stories.

**Testing:** ≥80% branch coverage (JaCoCo) + E2E Playwright tests for each feature.

---

## Phase 11: Dashboard Layout & Data Integration (2026-06-30 → 2026-07-11)

**Dates:** 2026-06-30 → 2026-07-11  
**Effort:** 10 days (2 engineers)  
**Delivery:** Integrated dashboard with real-time updates + caching

### Objectives

1. **Unified Dashboard Layout** — Arrange US-820/821/823 into cohesive Shipper Dashboard (KPI header, shipment list, carrier feed)
2. **Real-Time WebSocket Updates** — WebSocket feed for load status changes (push optimistic lock conflicts to UI)
3. **Cache Invalidation Events** — Event-driven cache refresh on shipper actions (assign, cancel, quote)
4. **Datadog Observability** — Integrated alerts for pricing engine failures, lock conflicts, slow queries

### Stories (Continuation)

| Story ID | Focus | Depends On |
|----------|-------|-----------|
| **US-830** | Dashboard Layout Integration | US-820, US-821, US-823 |
| **US-831** | WebSocket Real-Time Updates | All Phase 10 stories |
| **US-832** | Cache Invalidation Events | US-825 (pricing cache) |
| **US-833** | Datadog + Alert Integration | All Phase 10 stories |

---

## Phase 12: Enterprise & Analytics (2026-07-14 → 2026-07-25)

**Dates:** 2026-07-14 → 2026-07-25  
**Effort:** 10 days (2 engineers)  
**Delivery:** Multi-team management + reporting

### Objectives

1. **Team Role Management** — Add/remove team members, assign RBAC tiers
2. **Analytics Dashboard** — Historical trends (on-time %, cost per mile, carrier performance)
3. **Bulk Actions** — Assign loads to multiple carriers, export shipments
4. **Mobile Optimization** — Full mobile-responsive design with offline support (US-827 continuation)

### Stories

| Story ID | Feature | Scope |
|----------|---------|-------|
| **US-840** | Team Role Management | BACKEND_ONLY (API) |
| **US-841** | Analytics Dashboard | FULL_STACK |
| **US-842** | Bulk Load Actions | FULL_STACK |
| **US-843** | Mobile Offline Support | UI_ONLY (Service Worker) |

---

## Critical Constraints

### Sequential Gate Protocol (No Rework Loops)

```
BA (Phase 10) → ARCHITECT (Design) → HFD (UI Spec) → CODER (Impl) → REVIEWER (Audit) → LIBRARIAN (Traceability)
     ↓
 No circular feedback; issues escalate to LIBRARIAN as CHG tickets only.
```

### Acceptance Criteria: Platform Foundation Mapping

**Every story MUST include:**
- Actor (Shipper / Dispatcher / Admin)
- User value (measurable business outcome)
- Sequence in load lifecycle (Post → Claim → Deliver)
- Frontend + backend components (no infrastructure-only tasks)
- ≥80% test coverage before "DONE"

### Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Pricing engine outages | Hybrid fallback (live → cached → manual) tested in Phase 10 |
| Optimistic lock conflicts | WebSocket real-time updates + 409 error handling (US-831) |
| WCAG accessibility gaps | Contrast audit + screen reader testing before Phase 11 |
| Large carrier list performance | Top 5 + fuzzy search dropdown (tested at 200+ carriers) |

---

## Timeline Summary

| Phase | Dates | Effort | Key Deliverable |
|-------|-------|--------|-----------------|
| **Phase 10** | 2026-06-16 → 2026-06-27 | 8 days | 8 FULL-STACK user features (KPI, list, bell, feed, onboarding, quote, perms, a11y) |
| **Phase 11** | 2026-06-30 → 2026-07-11 | 10 days | Integrated dashboard + WebSocket + observability |
| **Phase 12** | 2026-07-14 → 2026-07-25 | 10 days | Team management + analytics + bulk actions + mobile |
| **Total** | 2026-06-16 → 2026-07-25 | 28 days | Production-ready Command Center |

---

## Traceability

- All Phase 10 stories linked to **BA Sign-Off (COMMAND_CENTER_BA_SIGN_OFF.md)**
- All stories use **INVEST format** with Gherkin AC
- All stories map to **SDLC governance gates** (BA → ARCH → HFD → CODER → REVIEWER → LIBRARIAN)
- Change requests escalated as **CHG-### tickets** (not mid-cycle rework)

---

## Approval & Authority

**Created by:** LIBRARIAN  
**Date:** 2026-06-10  
**Status:** READY FOR PHASE 10 KICKOFF (2026-06-16)  
**No further approvals required.**

Next step: BUSINESS_ANALYST creates story files for US-820 through US-827 by EOD 2026-06-13.

---

**Document Status:** LOCKED FOR PHASE 10 EXECUTION  
**Version:** 1.0  
**Last Updated:** 2026-06-10
