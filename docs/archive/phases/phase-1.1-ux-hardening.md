# Phase 1.1 — UX Hardening ✅ Complete

These issues were identified through a human factors review of Phase 1 output. They were resolved before Phase 2 work began — several affect data integrity and regulatory compliance, not just polish.

## Critical (Data Integrity / Safety)

| Issue | Area | Detail |
|-------|------|--------|
| State field → validated dropdown | Load Form (Shipper) | `originState` / `destinationState` are free-text inputs. Truckers filter by 2-letter code (e.g. `IL`); a shipper entering `Illinois` causes filter mismatch — the load becomes invisible to truckers filtering by state |
| Cancel load confirmation dialog | Shipper Dashboard | Cancelling a live load is a destructive action with downstream impact (notifies trucker, frees slot). No confirmation dialog currently exists |
| 70-hr/8-day HOS cycle | HOS Widget (Trucker) | FMCSA requires tracking cumulative on-duty hours over a rolling 8-day window. Current widget only tracks the current shift (11-hr drive + 14-hr on-duty). This is a separate, additional legal constraint |

## Significant (UX Correctness)

| Issue | Area | Detail |
|-------|------|--------|
| Address field order | Load Form | City/State/Zip renders before Street — reverse of US postal convention and user mental model |
| Cross-field date validation | Load Form | No validation that `pickupTo > pickupFrom`, `deliveryFrom > pickupTo`, `deliveryTo > deliveryFrom` |
| Pickup/delivery window label ambiguity | Load Form | "Pickup From" reads as origin location, not time window. Rename to "Earliest Pickup" / "Latest Pickup" / "Earliest Delivery" / "Latest Delivery" |
| Filter state lost on back-navigation | Load Board | Truckers lose all filter state when returning from a load detail page |
| Equipment filter locked | Load Board | Filter is locked when profile type is set; truckers with multiple trailer types cannot browse other equipment |
| Profitability card hidden post-claim | Load Detail | Profitability breakdown disappears once load is claimed — still needed for planning during execution |
| Silent load board grayout | Trucker Dashboard | When an active load exists, the entire board is grayed with no explanation; trucker doesn't know why they can't claim |
| RPM precision | Load Board / Detail | RPM shown to 4 decimal places; 2dp is sufficient and reduces noise |
| Cost profile CTA buried | Trucker Profile | When no cost profile is set, the RPM badge and profitability card are empty — the prompt to set up a profile is styled as a `text-xs` footnote |
| No claim success feedback | Trucker | No toast or confirmation after a successful claim; user is left uncertain |

## Minor (Labeling / Contextual Hints)

| Issue | Area | Detail |
|-------|------|--------|
| Weight field hint | Load Form | Add contextual hint: "Legal max: 80,000 lbs" to prevent accidental overweight loads |
| Shipper status summary strip | Shipper Dashboard | Add at-a-glance count of loads by status (open, claimed, in transit, delivered) above the loads table |
| HOS on-duty bar inactive until start time | HOS Widget | Bar shows empty with no guidance; should prompt trucker to enter start time |
| HOS warnings only at <2 hr | HOS Widget | Proactive stop planning requires a 4-hour warning; current threshold is too late |
| Pickup urgency signal | Load Board | No visual signal for loads picking up soon; urgency is invisible on the current table |

## Database Hardening

These schema fixes must accompany or precede the UX fixes above — the state dropdown fix (UX critical #1) is only half the solution without the `CHAR(2)` column type fix at the DB layer.

| Issue | Severity | Migration |
|-------|----------|-----------|
| `origin_state`/`destination_state` → `CHAR(2)` + `CHECK` | **Critical** | Backfill then `MODIFY COLUMN` + `ADD CONSTRAINT CHECK` |
| `loads.created_at`/`updated_at` → add `DEFAULT CURRENT_TIMESTAMP` | **Critical** | `ALTER TABLE loads MODIFY COLUMN ...` |
| `loads.trucker_id` → add FK → `users.id` | **Critical** | `ADD CONSTRAINT fk_loads_trucker FOREIGN KEY` |
| `claims` table created | **Critical** | New table migration; load service updated to write claim records |
| Missing load board indexes | Significant | `CREATE INDEX` for `(tenant_id, equipment_type, status)`, `(tenant_id, origin_state)`, `(tenant_id, pickup_from, status)`, `(trucker_id, status)` |
| `CHECK` constraints on enum columns | Significant | `ADD CONSTRAINT chk_loads_status`, `chk_loads_equipment_type`, etc. |
| `loads.payment_terms` → `NOT NULL` | Significant | After verifying no NULL rows; `MODIFY COLUMN payment_terms VARCHAR(20) NOT NULL` |
| `load_events` table stub | Significant | New table migration; Phase 2 will populate it |
| Email uniqueness → per-tenant | Significant | Drop global UK; add `UNIQUE KEY uq_users_tenant_email (tenant_id, email)` |
| `billing_state`/`default_pickup_state` → `CHAR(2)` | Minor | `MODIFY COLUMN` after backfill |
| `origin_zip`/`destination_zip` cleanup | Minor | Confirm unused; `DROP COLUMN` |
| `refresh_tokens.revoked_at` | Minor | `ADD COLUMN revoked_at DATETIME NULL` |

**Note:** `trucker_cost_profiles` table extraction is **not** in Phase 1.1 — it requires a data migration of existing cost profile data and a service layer change. Scheduled for Phase 7b when financial reporting features are built.
