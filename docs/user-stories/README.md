# FreightClub User Stories

Stories are organized by priority tier. Individual files live under `shipper/`, `trucker/`, `platform/`, and `database/`.

**Priority tiers (highest → lowest):**

| Tier | Meaning |
|------|---------|
| `HF-CRITICAL` | Breaks core workflow today — ship before anything else |
| `DB-CRITICAL` | Data integrity blocker — must land before HF-CRITICAL features that depend on correct data |
| `HF` | High-frequency usability pain — meaningfully degrades daily use |
| `DB` | Database/infrastructure enabler — unblocks future feature tiers |
| `Standard` | Normal backlog — builds out the product roadmap |

---

## Tier 1 — HF-CRITICAL (4 stories)

Ship these first. They block or corrupt core workflows.

| ID | Title | Persona | Status |
|----|-------|---------|--------|
| [S-005](shipper/S-005.md) | State Code Dropdown — origin/destination stored as validated 2-letter code | Shipper | ✅ Built |
| [S-006](shipper/S-006.md) | Cancel Load Confirmation Dialog — destructive action requires explicit confirm | Shipper | ✅ Built |
| [T-007](trucker/T-007.md) | HOS 70-Hour/8-Day Cycle Tracking — FMCSA rolling cycle entirely absent | Trucker | ✅ Built |
| [T-017](trucker/T-017.md) | HOS Widget: 70-Hour/8-Day Cycle on Load Execution View | Trucker | ✅ Built |

> **Note:** T-007 and T-017 share one implementation; both ACs must be satisfied together.

---

## Tier 2 — DB-CRITICAL (3 stories)

Must land before or alongside Tier 1 — these are the data correctness prerequisites.

| ID | Title | Status |
|----|-------|--------|
| [DB-001](database/DB-001.md) | Resize `origin_state` / `destination_state` to `CHAR(2)` + CHECK constraint | ✅ Built |
| [DB-002](database/DB-002.md) | Add `DEFAULT CURRENT_TIMESTAMP` / `ON UPDATE` to `loads.created_at` / `updated_at` | ✅ Built |
| [DB-003](database/DB-003.md) | Foreign key: `loads.trucker_id` → `users.id` | ✅ Built |

> DB-001 is a hard prerequisite for S-005. DB-002 and DB-003 unblock stable load creation and referential integrity.

---

## Tier 3 — HF (18 stories)

High-frequency pain that meaningfully degrades daily use. Prioritize within the tier by user impact.

### Shipper HF

| ID | Title | Status |
|----|-------|--------|
| [S-007](shipper/S-007.md) | Address Field Order Correction (street → city → state → zip) | 🔲 Not yet built |
| [S-008](shipper/S-008.md) | Cross-Field Date Validation (pickup/delivery window ordering) | 🔲 Not yet built |
| [S-009](shipper/S-009.md) | Pickup/Delivery Window Label Rename (eliminate "from" ambiguity) | 🔲 Not yet built |
| [S-010](shipper/S-010.md) | Shipper Dashboard Status Summary Strip | 🔲 Not yet built |
| [S-011](shipper/S-011.md) | Weight Field Contextual Hint ("Legal max: 80,000 lbs") | 🔲 Not yet built |

### Trucker HF

| ID | Title | Status |
|----|-------|--------|
| [T-003](trucker/T-003.md) | Cost Profile Setup CTA — elevated prompt when profile is missing | 🔲 Not yet built |
| [T-004](trucker/T-004.md) | RPM Display Precision — show 2 decimal places, not 4 | 🔲 Not yet built |
| [T-008](trucker/T-008.md) | Load Board Sorting — by RPM, distance, pickup date | 🔲 Not yet built |
| [T-009](trucker/T-009.md) | Filter State Persisted in URL — survive back-navigation | 🔲 Not yet built |
| [T-010](trucker/T-010.md) | Equipment Filter Unlockable — allow browsing other trailer types | 🔲 Not yet built |
| [T-011](trucker/T-011.md) | Pickup Date Urgency Signal — highlight loads picking up < 24 hr | 🔲 Not yet built |
| [T-012](trucker/T-012.md) | Profitability Card Visible on Claimed Load | 🔲 Not yet built |
| [T-015](trucker/T-015.md) | Toast Confirmation After Claim | 🔲 Not yet built |
| [T-016](trucker/T-016.md) | Clear Explanation When Claim Is Blocked (active load exists) | 🔲 Not yet built |
| [T-018](trucker/T-018.md) | HOS On-Duty Bar Renders Before Start Time Is Entered | 🔲 Not yet built |
| [T-019](trucker/T-019.md) | HOS Proactive Warnings at 4-Hour and 2-Hour Thresholds | 🔲 Not yet built |

### Platform HF

| ID | Title | Status |
|----|-------|--------|
| [P-001](platform/P-001.md) | Shared App Shell / Layout Component | 🔲 Not yet built |
| [P-002](platform/P-002.md) | URL-Based Filter State for Load Board | 🔲 Not yet built |

> P-002 is a prerequisite for T-009.

---

## Tier 4 — DB (8 stories)

Infrastructure enablers that unblock Standard-tier features. Can be worked in parallel with Tier 3.

| ID | Title | Enables | Status |
|----|-------|---------|--------|
| [DB-004](database/DB-004.md) | Introduce `claims` table | S-013, S-017, T-023/S-026 ratings | 🔲 Not yet built |
| [DB-005](database/DB-005.md) | CHECK constraints for `loads` enum columns | Data integrity | 🔲 Not yet built |
| [DB-006](database/DB-006.md) | Load board query indexes | Load board performance at scale | 🔲 Not yet built |
| [DB-007](database/DB-007.md) | `loads.payment_terms` NOT NULL | Payment integrity | 🔲 Not yet built |
| [DB-008](database/DB-008.md) | Extract `trucker_cost_profiles` table | Phase 7 cost history | 🔲 Not yet built |
| [DB-009](database/DB-009.md) | Create `load_events` table | S-021 timeline, S-020/T-022 notifications | 🔲 Not yet built |
| [DB-010](database/DB-010.md) | Scope `users.email` uniqueness to tenant | Multi-role accounts | 🔲 Not yet built |
| [DB-011](database/DB-011.md) | Add `refresh_tokens.revoked_at` column | Security audit trail | 🔲 Not yet built |

---

## Tier 5 — Standard: Already Built (8 stories)

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

## Tier 5 — Standard: Backlog (25 stories)

Future roadmap. Sequencing within this tier is TBD by product.

### Shipper Backlog

| ID | Title | Status |
|----|-------|--------|
| [S-012](shipper/S-012.md) | Cancel Load with Reason | 🔲 Not yet built |
| [S-013](shipper/S-013.md) | Trucker Notification on Load Cancellation | 🔲 Not yet built |
| [S-014](shipper/S-014.md) | Duplicate a Load | 🔲 Not yet built |
| [S-015](shipper/S-015.md) | Recurring Load Scheduling | 🔲 Not yet built |
| [S-016](shipper/S-016.md) | View Trucker Profile Before Claim | 🔲 Not yet built |
| [S-017](shipper/S-017.md) | Accept or Reject Trucker Bids | 🔲 Not yet built |
| [S-018](shipper/S-018.md) | Preferred Carrier List | 🔲 Not yet built |
| [S-019](shipper/S-019.md) | Block Carriers | 🔲 Not yet built |
| [S-020](shipper/S-020.md) | Load Status Change Notifications | 🔲 Not yet built |
| [S-021](shipper/S-021.md) | Load Status Timeline | 🔲 Not yet built |
| [S-022](shipper/S-022.md) | View BOL and POD Documents | 🔲 Not yet built |
| [S-023](shipper/S-023.md) | PDF Export per Load | 🔲 Not yet built |
| [S-024](shipper/S-024.md) | Automatic Invoice on Delivery | 🔲 Not yet built |
| [S-025](shipper/S-025.md) | In-Platform Payment to Carrier | 🔲 Not yet built |
| [S-026](shipper/S-026.md) | Rate and Review Trucker | 🔲 Not yet built |
| [S-027](shipper/S-027.md) | Shipper Public Reputation Profile | 🔲 Not yet built |

### Trucker Backlog

| ID | Title | Status |
|----|-------|--------|
| [T-013](trucker/T-013.md) | Shipper Reputation Badge on Load Cards | 🔲 Not yet built |
| [T-014](trucker/T-014.md) | Suggested Loads Based on Preferred Lanes | 🔲 Not yet built |
| [T-020](trucker/T-020.md) | BOL and POD Photo Upload | 🔲 Not yet built |
| [T-021](trucker/T-021.md) | Report Issue During Transit | 🔲 Not yet built |
| [T-022](trucker/T-022.md) | Payment Notification After Delivery | 🔲 Not yet built |
| [T-023](trucker/T-023.md) | Rate Shipper After Delivery | 🔲 Not yet built |

---

## Dependency Map

Key "must ship before" relationships:

```
DB-001 ──► S-005   (state column fix enables state dropdown)
DB-009 ──► S-021   (load_events table enables status timeline)
DB-009 ──► S-020   (load_events table enables notifications)
DB-004 ──► S-013   (claims table enables cancellation notification)
DB-004 ──► S-017   (claims table enables bidding)
DB-004 ──► S-026   (claims table enables trucker ratings)
P-002  ──► T-009   (URL filter state is the platform implementation)
T-007  ==  T-017   (same implementation, both ACs required)
S-006  ──► S-012   (cancel dialog is the foundation for cancel-with-reason)
S-021  ──► S-023   (timeline data feeds into PDF export)
S-022  ──► S-023   (BOL/POD documents feed into PDF export)
T-020  ──► S-022   (trucker upload enables shipper view)
```
