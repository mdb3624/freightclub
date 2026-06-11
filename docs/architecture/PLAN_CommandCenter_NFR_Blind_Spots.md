# Command Center Dashboard: Non-Functional Requirements & Blind Spots

**Status:** REQUIRES BA SIGN-OFF BEFORE PHASE 1 STARTS  
**Authority:** Business Analysis + Architecture Review  
**Date:** 2026-06-09

---

## Overview

This document identifies **6 critical blind spots** in the current Command Center specification that, if not addressed proactively, will cause implementation blockers or post-launch incidents. Each section defines the risk, the recommendation, and **requires explicit BA decision** before engineering begins.

**Sequential Lock Protocol:** These NFRs are **input gates** for the ARCHITECT and CODER roles. Until the BA team confirms decisions, implementation is blocked.

---

## 1. Concurrency & Conflict Handling (CRITICAL)

### The Blind Spot
The specification describes the "Assign Load" button in the Preferred Carrier Feed but does **not** address what happens when two dispatchers simultaneously attempt to claim the same load.

### The Risk
- **Scenario:** Load US-500 is unassigned. Dispatcher A and B both see it in their dashboard and click "Assign to Carrier X" at the same time.
- **Current behavior:** Both clicks may succeed (race condition). Carrier X gets assigned twice, or one assignment overwrites the other.
- **Impact:** Duplicate carrier assignments, billing confusion, broken audit trail.

### Recommendation: Locking Strategy

**Option A: Optimistic Locking (Recommended)**
- Load entity includes a `version` field (updated on every status change)
- When User A claims the load, `version` increments
- User B's claim fails with HTTP 409 (Conflict) because version mismatch
- Frontend detects 409 → displays toast: "Load was claimed by another dispatcher. Refreshing..."
- WebSocket updates push new load status to all clients in real-time

**Option B: Pessimistic Locking**
- Load is locked at database level when "Assign" is clicked
- Only one user can claim at a time
- Other users see "Locked by [Dispatcher Name]" tooltip
- Risk: If dispatcher crashes, lock must auto-release after timeout (5 min)

**Option C: Event Sourcing**
- Every claim attempt is logged as an event (even failed ones)
- "First writer wins" — first successful event claim is canonical
- Others see their claim rejected with reason: "Claimed by X at HH:MM"
- Most audit-friendly but highest complexity

### BA Decision Required

**Question:** Which locking strategy aligns with FreightClub's operational model?

- [ ] Option A: Optimistic (Recommended) — tolerate occasional conflicts, real-time refresh
- [ ] Option B: Pessimistic — prevent conflicts entirely (slower but safer)
- [ ] Option C: Event Sourcing — full audit trail of every attempt (most complex)

**Follow-up:** If pessimistic, what is the lock timeout? (Default: 5 minutes)

---

## 2. External Service Dependency: Pricing Engine (HIGH)

### The Blind Spot
The "Get a Quote" workflow calls a "historical freight pricing engine," but the spec does **not** define what happens if that service fails.

### The Risk
- **Scenario:** Pricing engine API returns 500 error. User clicks "Get Quote" and sees either:
  - (A) White screen / timeout (bad UX)
  - (B) Unhandled exception in logs (bad observability)
  - (C) No fallback, users cannot create loads (lost revenue)
- **Impact:** Users abandon the flow; support tickets spike; unclear failure reasons.

### Recommendation: Graceful Degradation Strategy

**Option A: Manual Override**
- If pricing engine is unavailable, display: "Quote service is temporarily unavailable. You can enter a quote manually:"
- Provide text input for manual quote entry (free-text or pre-defined ranges)
- Add warning: "This quote will not include market intelligence"
- User can still publish load with manual quote

**Option B: Cache + Stale Data**
- Cache quotes from last 24 hours (Redis)
- If pricing engine fails, use cached quotes (labeled "estimated" vs "live")
- Background job retries pricing engine every 30 seconds
- Toast: "Using cached quotes. Live pricing will update when service recovers."

**Option C: Blocking Failure**
- If pricing engine is down, disable "Get Quote" button
- Display: "Quote service is temporarily unavailable. Please try again in 10 minutes."
- No alternative; users must wait
- Risk: High bounce rate during outages

**Option D: Hybrid (Recommended)**
- Primary: Try pricing engine (5-second timeout)
- Fallback: Show cached quotes if available (labeled "last known")
- Ultimate fallback: Manual override with disclaimer

### BA Decision Required

**Question:** How should the system handle pricing engine failures?

- [ ] Option A: Manual override
- [ ] Option B: Cache + stale data
- [ ] Option C: Blocking failure
- [ ] Option D: Hybrid (primary → cached → manual)

**Follow-up:** Should manual quotes require approval before load publish? (Default: No, but logged for audit)

---

## 3. Accessibility: WCAG AA Compliance (LEGAL REQUIREMENT)

### The Blind Spot
The aesthetic guide specifies:
- Canvas: `#EFEBE0` (Classic Cream, very light)
- Text: `#1A1A1A` (Dark, high contrast)

But the spec does **not** verify this meets WCAG AA 4.5:1 contrast requirement.

### The Risk
- **Contrast Check:** `#EFEBE0` (cream) + `#1A1A1A` (dark text):
  - Luminance ratio ≈ 12:1 ✓ **PASSES** WCAG AAA
- **However, secondary colors** (e.g., metallic bronze buttons, badges) may fail:
  - Bronze `#B08D57` + cream `#EFEBE0` = ~3.2:1 ✗ **FAILS** WCAG AA (requires 4.5:1)
  - Red status badges on cream = borderline (must verify)
- **Impact:** Non-compliance with ADA/accessibility laws; risk of lawsuits; excludes users with vision impairments.

### Recommendation: Contrast Audit

**Required Actions (BA + Design):**
1. Run WCAG contrast checker on all color combinations:
   - Text on canvas
   - Buttons (bronze) on canvas
   - Status badges (red/yellow/green) on white cards
   - Links and interactive elements
2. If any pair fails 4.5:1, darken the foreground or lighten the background slightly
3. Document the final approved color palette with contrast ratios
4. Add a "Color Accessibility" section to the style guide

**Tools:** WebAIM Contrast Checker, Axe DevTools

### BA Decision Required

**Question:** Is current color palette WCAG AA compliant?

- [ ] Yes, verified with contrast checker. Document approved palette.
- [ ] No, adjust colors per recommendations. Provide updated palette.
- [ ] Defer to design/HFD review. Schedule accessibility audit.

**Critical:** This must be confirmed before frontend CSS is written.

---

## 4. Preferred Carrier Feed Scalability (PERFORMANCE)

### The Blind Spot
The spec describes a "Preferred Carrier Feed" showing trusted operators, but does **not** define:
- How many carriers should be displayed?
- What if a shipper has 200 preferred carriers?
- How is "preferred" defined (most recent? highest rated? most available)?

### The Risk
- **Scenario:** High-volume shipper (Amazon, Walmart) has 200+ carriers in their "preferred" list
- **Current UI:** Simple vertical list would be 10+ screens long
- **Impact:** Page bloat, slow load, poor UX, users skip the feature entirely

### Recommendation: Feed Pagination or Limits

**Option A: Smart Limit (Recommended)**
- Display top 10 most recently used preferred carriers
- Add button: "View all (200)" → opens modal/drawer with search
- Backend query: `ORDER BY last_assigned_at DESC LIMIT 10`
- Fast load, focused UX

**Option B: Infinite Scroll**
- Load first 20, lazy-load as user scrolls
- Better for discovery, but more complex
- Risk: Performance issues if user scrolls through 200 items

**Option C: Search/Filter Input**
- Always show search box: "Find carrier..."
- Results update as user types (fuzzy search)
- Removes pagination entirely, but requires backend search index

**Option D: Hybrid (Recommended)**
- Show top 5 most recent + search box
- Search results appear in dropdown below
- "View all" link opens full list in modal

### BA Decision Required

**Question:** How should the Preferred Carrier Feed handle large lists?

- [ ] Option A: Top 10 + "View All" modal
- [ ] Option B: Infinite scroll (20 at a time)
- [ ] Option C: Search/filter only
- [ ] Option D: Top 5 + search box (hybrid)

**Follow-up:** What is "preferred"? (Default: `last_assigned_at DESC`)

---

## 5. Empty State & Onboarding (USER RETENTION)

### The Blind Spot
The spec mentions defining "Empty State UI" for new shippers but provides **no guidance** on what it should contain.

### The Risk
- **Scenario:** New shipper lands on dashboard. Sees blank page: "0 Active Shipments"
- **Current UX:** Confusing. User doesn't know what to do next.
- **Impact:** High bounce rate; failed onboarding; user churn.

### Recommendation: Conversion-Focused Empty State

**Not:** "You have no active shipments. Create one?"

**Instead:** Onboarding Journey
```
┌─────────────────────────────────────────────┐
│          Welcome to FreightClub!            │
│                                             │
│  Let's get your first load on the board.   │
│                                             │
│  [Video: "Post a Load in 2 Minutes"] (30s) │
│                                             │
│  ┌───────────────────────────────────┐     │
│  │ GET STARTED: Create Your First... │     │
│  │   Load                            │     │
│  │   Origin: [Select State]          │     │
│  │   Destination: [Select State]     │     │
│  └───────────────────────────────────┘     │
│                                             │
│  Already have details? [Upload CSV]        │
│                                             │
└─────────────────────────────────────────────┘
```

**Components:**
1. **Hero message** — "Welcome! Let's post your first load"
2. **Micro-video** — 30-sec demo of posting a load
3. **Guided form** — Pre-filled with example or inline help
4. **Alternative action** — Bulk upload for power users

### BA Decision Required

**Question:** What should the empty state contain?

- [ ] Simple prompt: "Create your first load"
- [ ] Onboarding wizard with video + guided form
- [ ] Guided form only (no video)
- [ ] Defer to HFD (Human Factors Designer) for specification

**Follow-up:** Should empty state offer to import loads from CSV? (Default: Yes, for power users)

---

## 6. Permission Tiers & Data Integrity (SECURITY-CRITICAL)

### The Blind Spot
The spec mentions "Permission Tiers" as a recommendation but does **not** explicitly define who can perform which actions.

### The Risk
- **Scenario:** Junior dispatcher (intern) can click "Cancel Load" on a $50K shipment, notifying the carrier and losing revenue.
- **Impact:** Data corruption; angry carriers; revenue loss; audit failures.

### Recommendation: Role-Based Access Control (RBAC)

Define these roles per shipper account:

| Action | Admin | Ops Manager | Dispatcher | Viewer |
|--------|-------|-------------|-----------|--------|
| Create Load | ✓ | ✓ | ✓ | ✗ |
| Edit Load (origin/dest) | ✓ | ✓ | ✗ | ✗ |
| Assign to Carrier | ✓ | ✓ | ✓ | ✗ |
| Cancel Load (soft delete) | ✓ | ✓ | ✗ | ✗ |
| View Reports | ✓ | ✓ | ✓ | ✓ |
| Manage Team | ✓ | ✗ | ✗ | ✗ |
| View Preferred Carriers | ✓ | ✓ | ✓ | ✓ |
| Add to Preferred Carriers | ✓ | ✓ | ✗ | ✗ |

### Technical Implementation

**Backend (Spring Security):**
```java
@PreAuthorize("hasRole('SHIPPER') and @accessControl.canCancelLoad(#loadId)")
public void cancelLoad(String loadId) { ... }
```

**Frontend (UI Enforcement):**
```tsx
{userRole.canCancelLoad && (
  <button onClick={() => cancelLoad(loadId)}>Cancel Load</button>
)}
```

### BA Decision Required

**Question:** What permission tier structure do you want?

- [ ] Simple: Admin vs Non-Admin
- [ ] Moderate: Admin / Manager / Dispatcher / Viewer (recommended)
- [ ] Complex: Custom permissions per user
- [ ] Defer to CODER (implement default, allow customization)

**Follow-up 1:** Can dispatchers cancel loads? (Default: No)

**Follow-up 2:** Can dispatchers edit origin/destination? (Default: No, only create)

---

## 7. Observability & Error Telemetry (OPERATIONAL EXCELLENCE)

### The Blind Spot
The spec defines *how* the system fails over (e.g., pricing engine down → use cached quotes), but does **not** define *how the team knows* a failure occurred.

### The Risk
- **Scenario:** Pricing engine fails at 2 AM on a Sunday. System silently falls back to cached quotes.
- **Current behavior:** Engineering team has no idea until Monday morning when:
  - Cache expires
  - New users see "estimated" quotes for 24+ hours
  - Support tickets pile up
- **Impact:** Silent failures; delayed incident response; SLA violations; poor visibility.

### Recommendation: Automated Observability

**For every "Fallback" state, emit a telemetry event:**

| Failure Mode | Alert Trigger | Destination | Severity |
|---|---|---|---|
| Pricing Engine 5xx | Switch to cached → log event | Datadog / CloudWatch | WARNING |
| Pricing Engine timeout (>5s) | Timeout detected → log event | Datadog / CloudWatch | WARNING |
| Load claim race condition | Optimistic lock conflict → log event | Datadog / CloudWatch | INFO |
| Carrier Feed query >2s | Slow query detected | Datadog / CloudWatch | WARNING |
| Soft delete audit missing | Deletion without audit entry → log event | Datadog / CloudWatch | ERROR |
| Missing token in JWT | Auth failure → log event | Datadog / CloudWatch | WARNING |

**Implementation:**

```java
// Example: Pricing Engine Fallback
try {
    var quote = pricingEngine.getQuote(origin, destination, weight);
} catch (PricingEngineException e) {
    logger.warn("Pricing engine unavailable, using cached quotes", e);
    telemetry.emit(TelemetryEvent.builder()
        .name("pricing.engine.fallback")
        .severity("warning")
        .context(Map.of(
            "origin", origin,
            "destination", destination,
            "cache_age_minutes", cacheAgeMinutes
        ))
        .build());
    
    var quote = cachedQuotes.get(origin, destination);
}
```

**Frontend Reporting:**

```typescript
// When fallback occurs, report to Datadog
if (fallbackToManualQuote) {
    analytics.track('pricing_fallback', {
        reason: 'pricing_engine_timeout',
        timestamp: new Date(),
        userId: currentUser.id
    });
}
```

### BA Decision Required

**Question:** Should fallback/failure states trigger automated alerts?

- [ ] Yes, integrate with Datadog / CloudWatch. Set up Slack/PagerDuty escalation for critical failures.
- [ ] Yes, log to observability platform. No real-time alerts (review logs in morning standup).
- [ ] No, handle silently. Support team will discover issues from user complaints.
- [ ] Defer to DevOps/SRE team for observability strategy.

**Follow-up:** What is the response SLA for critical alerts (e.g., pricing engine down)? (Default: 30 minutes during business hours)

---

## Summary: Sign-Off Checklist

**Before Phase 1 starts, BA team must confirm:**

- [ ] **Concurrency:** Which locking strategy? (Optimistic / Pessimistic / Event Sourcing)
- [ ] **Pricing Engine:** Failure strategy? (Manual / Cached / Blocking / Hybrid)
- [ ] **Accessibility:** Color palette verified WCAG AA compliant?
- [ ] **Carrier Feed:** Pagination strategy? (Limit / Search / Hybrid)
- [ ] **Empty State:** Onboarding or simple prompt?
- [ ] **Permissions:** Role tier structure? (Admin-only / 4-tier / Custom)
- [ ] **Observability:** Automated alerts for failures? (Yes / Logged / Silent / Defer)

**Blocking Criteria:**
- If any question is left unanswered, escalate to BA Lead
- Do NOT proceed to Phase 1 (domain modeling) until all 6 items are resolved
- Document final decisions in updated `FreightClub Shipper Dashboard (v1.0).md`

---

## Escalation

If BA team cannot decide on any item, escalate to:
1. **Product Manager** (business impact)
2. **Engineering Lead** (technical feasibility)
3. **Security/Compliance** (for permission tiers)

**Timeline:** All decisions must be finalized by EOW (2026-06-13) to stay on Phase 1 schedule.

---

**Document Status:** AWAITING BA SIGN-OFF  
**Last Updated:** 2026-06-09  
**Prepared by:** Architecture Review
