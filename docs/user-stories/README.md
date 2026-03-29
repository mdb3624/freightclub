# FreightClub User Stories

Stories are organized by priority tier. Individual files live under `shipper/`, `trucker/`, `platform/`, `database/`, `security/`, and `infra/`.

Phase-level narrative summaries live under [`../phases/`](../phases/) and are linked from each section below.

**Priority tiers (highest → lowest):**

| Tier | Meaning |
|------|---------|
| `HF-CRITICAL` | Breaks core workflow today — ship before anything else |
| `DB-CRITICAL` | Data integrity blocker — must land before HF-CRITICAL features that depend on correct data |
| `HF` | High-frequency usability pain — meaningfully degrades daily use |
| `DB` | Database/infrastructure enabler — unblocks future feature tiers |
| `Standard` | Normal backlog — builds out the product roadmap |

---

## Phase 1 — Core Load Lifecycle ✅ Complete

See [phase-1-core-load-lifecycle.md](phase-1-core-load-lifecycle.md) for full narrative.

### Standard: Built (8 stories)

| ID | Title | Persona |
|----|-------|---------|
| [S-001](shipper/S-001.md) | Shipper Registration | Shipper |
| [S-002](shipper/S-002.md) | Default Pickup Location | Shipper |
| [S-003](shipper/S-003.md) | Notification Preferences | Shipper |
| [S-004](shipper/S-004.md) | Company Join Code | Shipper |
| [T-001](trucker/T-001.md) | Trucker Registration | Trucker |
| [T-002](trucker/T-002.md) | Trucker Cost Profile Setup | Trucker |
| [T-005](trucker/T-005.md) | CPM and Minimum RPM Display | Trucker |
| [T-006](trucker/T-006.md) | 30-Day Earnings Summary | Trucker |

---

## Phase 1.1 — UX Hardening ✅ Complete

See [phase-1.1-ux-hardening.md](phase-1.1-ux-hardening.md) for full narrative.

### Tier 1 — HF-CRITICAL (4 stories) ✅ All Built

| ID | Title | Persona |
|----|-------|---------|
| [S-005](shipper/S-005.md) | State Code Dropdown — origin/destination stored as validated 2-letter code | Shipper |
| [S-006](shipper/S-006.md) | Cancel Load Confirmation Dialog — destructive action requires explicit confirm | Shipper |
| [T-007](trucker/T-007.md) | HOS 70-Hour/8-Day Cycle Tracking — FMCSA rolling cycle entirely absent | Trucker |
| [T-017](trucker/T-017.md) | HOS Widget: 70-Hour/8-Day Cycle on Load Execution View | Trucker |

> **Note:** T-007 and T-017 share one implementation; both ACs must be satisfied together.

### Tier 2 — DB-CRITICAL (3 stories) ✅ All Built

| ID | Title |
|----|-------|
| [DB-001](database/DB-001.md) | Resize `origin_state` / `destination_state` to `CHAR(2)` + CHECK constraint |
| [DB-002](database/DB-002.md) | Add `DEFAULT CURRENT_TIMESTAMP` / `ON UPDATE` to `loads.created_at` / `updated_at` |
| [DB-003](database/DB-003.md) | Foreign key: `loads.trucker_id` → `users.id` |

### Tier 3 — HF (16 stories) ✅ All Built

| ID | Title | Persona |
|----|-------|---------|
| [S-007](shipper/S-007.md) | Address Field Order Correction (street → city → state → zip) | Shipper |
| [S-008](shipper/S-008.md) | Cross-Field Date Validation (pickup/delivery window ordering) | Shipper |
| [S-009](shipper/S-009.md) | Pickup/Delivery Window Label Rename (eliminate "from" ambiguity) | Shipper |
| [S-010](shipper/S-010.md) | Shipper Dashboard Status Summary Strip | Shipper |
| [S-011](shipper/S-011.md) | Weight Field Contextual Hint ("Legal max: 80,000 lbs") | Shipper |
| [T-003](trucker/T-003.md) | Cost Profile Setup CTA — elevated prompt when profile is missing | Trucker |
| [T-004](trucker/T-004.md) | RPM Display Precision — show 2 decimal places, not 4 | Trucker |
| [T-009](trucker/T-009.md) | Filter State Persisted in URL — survive back-navigation | Trucker |
| [T-010](trucker/T-010.md) | Equipment Filter Unlockable — allow browsing other trailer types | Trucker |
| [T-012](trucker/T-012.md) | Profitability Card Visible on Claimed Load | Trucker |
| [T-015](trucker/T-015.md) | Toast Confirmation After Claim | Trucker |
| [T-016](trucker/T-016.md) | Clear Explanation When Claim Is Blocked (active load exists) | Trucker |
| [T-018](trucker/T-018.md) | HOS On-Duty Bar Renders Before Start Time Is Entered | Trucker |
| [T-019](trucker/T-019.md) | HOS Proactive Warnings at 4-Hour and 2-Hour Thresholds | Trucker |
| [P-001](platform/P-001.md) | Shared App Shell / Layout Component | Platform |
| [P-002](platform/P-002.md) | URL-Based Filter State for Load Board | Platform |

### Tier 4 — DB (7 stories) ✅ All Built

| ID | Title | Enables |
|----|-------|---------|
| [DB-004](database/DB-004.md) | Introduce `claims` table | Ratings, cancellation notifications, bidding |
| [DB-005](database/DB-005.md) | CHECK constraints for `loads` enum columns | Data integrity |
| [DB-006](database/DB-006.md) | Load board query indexes | Load board performance at scale |
| [DB-007](database/DB-007.md) | `loads.payment_terms` NOT NULL | Payment integrity |
| [DB-009](database/DB-009.md) | Create `load_events` table | Status timeline, notifications |
| [DB-010](database/DB-010.md) | Scope `users.email` uniqueness to tenant | Multi-role accounts |
| [DB-011](database/DB-011.md) | Add `refresh_tokens.revoked_at` column | Security audit trail |

---

## Phase 1.2 — Security & Stability Hardening ✅ Complete

See [phase-1.2-security-hardening.md](phase-1.2-security-hardening.md) for full narrative.

### Security (7 stories) ✅ All Built

| ID | Title |
|----|-------|
| [SEC-001](security/SEC-001.md) | Race Condition Fix — load claiming (`SELECT FOR UPDATE`) |
| [SEC-002](security/SEC-002.md) | Race Condition Fix — refresh token rotation |
| [SEC-003](security/SEC-003.md) | Rate Limiting on Auth Endpoints (Bucket4j token bucket) |
| [SEC-004](security/SEC-004.md) | JWT `iss` and `aud` Claims — issue and validate on every request |
| [SEC-005](security/SEC-005.md) | JWT Secret to Environment Variable — remove from committed config |
| [SEC-006](security/SEC-006.md) | Remove Hardcoded Tailscale Domain from `vite.config.ts` |
| [SEC-007](security/SEC-007.md) | CORS Explicit Header Whitelist — replace `allowedHeaders: ["*"]` |

### Bug Fixes (5 stories) ✅ All Built

| ID | Title |
|----|-------|
| [BUG-001](infra/BUG-001.md) | Write `claims` Row on Every Claim and Release |
| [BUG-002](infra/BUG-002.md) | Write `load_events` Row on Every Status Transition |
| [BUG-003](infra/BUG-003.md) | Date Comparison Fix — use `new Date()` not string ordering |
| [BUG-004](infra/BUG-004.md) | URL Filter Enum Guard — validate params before cast |
| [BUG-005](infra/BUG-005.md) | Server-Side Overweight Load Validation |

### Infrastructure (4 stories) ✅ All Built

| ID | Title |
|----|-------|
| [INF-001](infra/INF-001.md) | React `<ErrorBoundary>` in `App.tsx` |
| [INF-002](infra/INF-002.md) | Spring Boot Actuator — `/health` and `/info` endpoints |
| [INF-003](infra/INF-003.md) | Production Environment Config (`application-prod.yml`) |
| [INF-004](infra/INF-004.md) | Structured Logging with Correlation IDs |

### Testing (5 stories) ✅ All Built

| ID | Title |
|----|-------|
| [TST-001](infra/TST-001.md) | `AuthService` Unit Tests — register, login, refresh, logout |
| [TST-002](infra/TST-002.md) | `RefreshTokenService` Unit Tests — rotation and revocation |
| [TST-003](infra/TST-003.md) | `JwtAuthenticationFilter` Unit Tests |
| [TST-004](infra/TST-004.md) | Claim Load Concurrency Integration Test |
| [TST-005](infra/TST-005.md) | Frontend Claim Flow Smoke Tests |

---

## Phase 2 — Notifications & Status Timeline 🔜 Next

See [phase-2-notifications.md](phase-2-notifications.md) for full narrative.

| ID | Title | Persona |
|----|-------|---------|
| [S-028](shipper/S-028.md) | Email Notification — Load Claimed | Shipper |
| [S-029](shipper/S-029.md) | Email Notification — Load Picked Up | Shipper |
| [S-030](shipper/S-030.md) | Email Notification — Load Delivered | Shipper |
| [S-031](shipper/S-031.md) | Cancel Load with Reason | Shipper |
| [S-032](shipper/S-032.md) | Load Status Timeline View | Shipper |
| [T-024](trucker/T-024.md) | Email Notification — Load Cancelled by Shipper | Trucker |
| [T-025](trucker/T-025.md) | Active Load Slot Freed on Shipper Cancellation | Trucker |
| [P-003](platform/P-003.md) | In-App Notification Bell with Unread Count | Platform |
| [P-004](platform/P-004.md) | SMS Notifications (opt-in, Twilio) | Platform |
| [P-005](platform/P-005.md) | EIA Diesel Price Backend Proxy + Cache | Platform |
| [T-026](trucker/T-026.md) | Live Diesel Price Market Ticker | Trucker |
| [T-027](trucker/T-027.md) | EIA Fuel Surcharge Auto-Populate in Profitability Analyzer | Trucker |

---

## Phase 3 — Document Management (BOL & POD)

See [phase-3-documents.md](phase-3-documents.md) for full narrative.

| ID | Title | Persona |
|----|-------|---------|
| [S-033](shipper/S-033.md) | Platform-Generated Digital BOL at Publish | Shipper |
| [S-034](shipper/S-034.md) | View Signed BOL Photo on Load Detail | Shipper |
| [S-035](shipper/S-035.md) | View POD Photo on Load Detail | Shipper |
| [S-036](shipper/S-036.md) | PDF Export per Load (details + documents) | Shipper |
| [T-028](trucker/T-028.md) | BOL Photo Upload at Pickup (required to advance status) | Trucker |
| [T-029](trucker/T-029.md) | POD Photo Upload at Delivery (required to advance status) | Trucker |
| [T-030](trucker/T-030.md) | Report Issue During Transit | Trucker |
| [P-006](platform/P-006.md) | Secure Cloud File Storage with Signed URLs | Platform |
| [P-007](platform/P-007.md) | Document History per Load (timestamped audit log) | Platform |

---

## Phase 4 — Ratings & Reviews

See [phase-4-ratings.md](phase-4-ratings.md) for full narrative.

| ID | Title | Persona |
|----|-------|---------|
| [T-031](trucker/T-031.md) | Rate Shipper After Delivery (1–5 stars + comment) | Trucker |
| [T-032](trucker/T-032.md) | Shipper Reputation Badge on Load Board Cards | Trucker |
| [T-033](trucker/T-033.md) | View Shipper Full Reputation Profile Before Claiming | Trucker |
| [S-037](shipper/S-037.md) | Rate Trucker After Delivery (1–5 stars + comment) | Shipper |
| [S-038](shipper/S-038.md) | Shipper Public Reputation Profile | Shipper |
| [P-008](platform/P-008.md) | Aggregate Rating on Trucker Profile | Platform |
| [P-009](platform/P-009.md) | Rating History Page (own ratings received) | Platform |

---

## Phase 5 — Payments & Invoicing

See [phase-5-payments.md](phase-5-payments.md) for full narrative.

| ID | Title | Persona |
|----|-------|---------|
| [S-039](shipper/S-039.md) | Automatic Invoice on Delivery Confirmation | Shipper |
| [S-040](shipper/S-040.md) | Pay Carrier Through Platform (Stripe / ACH) | Shipper |
| [S-041](shipper/S-041.md) | Payment Dispute — Flag Delivery, Hold Payment | Shipper |
| [T-034](trucker/T-034.md) | Connect Bank Account for Direct Deposit | Trucker |
| [T-035](trucker/T-035.md) | Payment Notification After Delivery Confirmation | Trucker |
| [P-010](platform/P-010.md) | Load Marked `SETTLED` After Payment Confirmed | Platform |
| [P-011](platform/P-011.md) | Payment History and Receipts per Transaction | Platform |

---

## Phase 6 — In-App Messaging

See [phase-6-messaging.md](phase-6-messaging.md) for full narrative.

| ID | Title | Persona |
|----|-------|---------|
| [P-012](platform/P-012.md) | Per-Load Message Thread (Shipper ↔ Trucker) | Platform |
| [P-013](platform/P-013.md) | Real-Time Message Delivery (WebSocket / SSE) | Platform |
| [P-014](platform/P-014.md) | Unread Message Badge on Dashboard | Platform |
| [P-015](platform/P-015.md) | Email Notification for New Messages | Platform |

---

## Phase 7 — Advanced Carrier Management

See [phase-7-carrier-management.md](phase-7-carrier-management.md) for full narrative.

| ID | Title | Persona |
|----|-------|---------|
| [T-036](trucker/T-036.md) | Truck / Trailer Profile (type, dimensions, capacity) | Trucker |
| [T-037](trucker/T-037.md) | Preferred Lanes on Profile | Trucker |
| [T-038](trucker/T-038.md) | Availability Settings (days / hours) | Trucker |
| [T-008](trucker/T-008.md) | Load Board Sorting — by RPM, distance, pickup date | Trucker |
| [T-011](trucker/T-011.md) | Pickup Date Urgency Signal — highlight loads picking up < 24 hr | Trucker |
| [T-039](trucker/T-039.md) | Suggested Loads Based on Preferred Lanes | Trucker |
| [T-040](trucker/T-040.md) | Load Board Filter: Weight Range + Minimum Pay Rate | Trucker |
| [T-041](trucker/T-041.md) | Load Interest / View Count | Trucker |
| [S-042](shipper/S-042.md) | View Trucker Public Profile Before Assigning | Shipper |
| [S-043](shipper/S-043.md) | Preferred Carrier List | Shipper |
| [S-044](shipper/S-044.md) | Direct Load Assignment to Preferred Trucker | Shipper |
| [S-045](shipper/S-045.md) | Block Carrier | Shipper |
| [S-046](shipper/S-046.md) | Load Posting Validation Prompts | Shipper |

---

## Phase 7b — Advanced Financial Intelligence

See [phase-7b-financial-intelligence.md](phase-7b-financial-intelligence.md) for full narrative.

| ID | Title | Persona |
|----|-------|---------|
| [T-042](trucker/T-042.md) | Per-Load Earnings Log (actual miles, fuel, net profit) | Trucker |
| [T-043](trucker/T-043.md) | Weekly / Monthly P&L Report | Trucker |
| [T-044](trucker/T-044.md) | IFTA Mileage Tracking by State | Trucker |
| [T-045](trucker/T-045.md) | Deadhead Mileage Estimate (current location → pickup) | Trucker |
| [T-046](trucker/T-046.md) | Deadhead Cost in Per-Load Profitability Calculation | Trucker |
| [T-047](trucker/T-047.md) | Fuel Surcharge Auto-Calculation (DOE national average) | Trucker |
| [T-048](trucker/T-048.md) | Annual Earnings + Tax Summary Export (PDF / CSV) | Trucker |
| [DB-008](database/DB-008.md) | Extract `trucker_cost_profiles` Table from `users` | Platform |

---

## Phase 8 — Bidding

See [phase-8-bidding.md](phase-8-bidding.md) for full narrative.

| ID | Title | Persona |
|----|-------|---------|
| [S-047](shipper/S-047.md) | Post Load as Open-to-Bids vs First-Come-First-Served | Shipper |
| [S-048](shipper/S-048.md) | Review and Accept / Reject Bids | Shipper |
| [S-049](shipper/S-049.md) | Duplicate a Load to New Draft | Shipper |
| [S-050](shipper/S-050.md) | Freight Class Field (LTL Support) | Shipper |
| [T-049](trucker/T-049.md) | Submit Bid on Bid-Type Loads (rate + message) | Trucker |
| [T-050](trucker/T-050.md) | View Bid Status (pending / accepted / rejected) | Trucker |
| [P-016](platform/P-016.md) | Bid Expiry and Auto-Close | Platform |

---

## Phase 9 — Admin & Operations

See [phase-9-admin.md](phase-9-admin.md) for full narrative.

| ID | Title | Persona |
|----|-------|---------|
| [A-001](platform/A-001.md) | Admin Dashboard — Users, Loads, Tenants | Admin |
| [A-002](platform/A-002.md) | Dispute Resolution Queue and Manual Settlement | Admin |
| [A-003](platform/A-003.md) | Platform Health Metrics (load volume, claim rate, time-to-claim) | Admin |
| [S-051](shipper/S-051.md) | Market Rate Benchmarking Tool | Shipper |
| [S-052](shipper/S-052.md) | Carrier Scorecard (on-time rate, cancellations, rating) | Shipper |
| [S-053](shipper/S-053.md) | Recurring Load Scheduling | Shipper |
| [S-054](shipper/S-054.md) | TMS API Access (REST) | Shipper |
| [T-051](trucker/T-051.md) | ELD Integration for Automated HOS Tracking | Trucker |
| [T-052](trucker/T-052.md) | Upload Credentials (insurance, CDL, medical card) | Trucker |

---

## Dependency Map

```
DB-001 ──► S-005   (state column fix enables state dropdown)
DB-009 ──► S-032   (load_events table enables status timeline)
DB-009 ──► S-028   (load_events table enables notifications)
DB-004 ──► S-031   (claims table enables cancellation-with-reason)
DB-004 ──► S-048   (claims table enables bidding)
DB-004 ──► T-031   (claims table enables trucker ratings)
P-002  ──► T-009   (URL filter state is the platform implementation)
T-007  ==  T-017   (same implementation, both ACs required)
S-006  ──► S-031   (cancel dialog is the foundation for cancel-with-reason)
T-028  ──► S-034   (trucker BOL upload enables shipper view)
T-029  ──► S-035   (trucker POD upload enables shipper view)
S-034  ──► S-036   (BOL/POD docs feed into PDF export)
S-039  ──► P-010   (invoice triggers settlement)
Phase 4 ──► Phase 7  (ratings needed for carrier vetting)
Phase 4 ──► Phase 8  (ratings needed to evaluate bids)
Phase 3 ──► Phase 7b (documents provide mileage data)
Phase 5 ──► Phase 7b (payments provide earnings data)
Phase 5 ──► Phase 9  (payments needed for dispute tools)
Phase 7 ──► Phase 9  (carrier profiles needed for scorecards)
```
