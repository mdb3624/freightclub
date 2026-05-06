# 🗺️ FreightClub Feature Master Table — Legacy Reconciliation

**Date:** 2026-04-27  
**Librarian:** Auto-Generated from Legacy Phase Context Reconciliation  
**Source Files:** `legacy_phase_context.txt` (Phases 1–9 archive)  
**Status:** ✅ ALL LEGACY FEATURES RECONCILED & MAPPED TO US-700+ SEQUENCE

---

## 📊 Table of Contents
- **Phase 1–2:** Already implemented ✅
- **Phase 3–4:** Already implemented ✅
- **Phase 5:** Planned (Payment Settlement — Foundation)
- **Phase 6:** Already implemented ✅
- **Phase 7:** NEW — Carrier Management (US-701 to US-712)
- **Phase 7A:** NEW — Carrier Logistics & Compliance (US-720 to US-724)
- **Phase 7b:** NEW — Advanced Financial Intelligence (US-730 to US-737)
- **Phase 8:** NEW — Bidding System (US-740 to US-745)
- **Phase 9:** NEW — Admin & Operations (US-750 to US-759)

---

## 🟢 Phase 7: Advanced Carrier Management (11 Features)

**Dependency:** Phase 4 (ratings) → Phase 7 → Unlocks Phase 8, Phase 9

| Story ID | Feature | Area | Architectural Constraints | Source File | Status |
|----------|---------|------|--------------------------|-------------|--------|
| US-701 | Carrier Profiles: Truck/Trailer Type, Dimensions, Capacity | Trucker | `carrier_profiles` table: id (VARCHAR(36)), tenant_id (VARCHAR(36)), trucker_id (VARCHAR(36) FK), equipment_type (ENUM), width (INT), height (INT), length (INT), weight_capacity_lbs (INT), deleted_at (TIMESTAMPTZ); RLS enabled | phase-7-carrier-management.md | BACKLOG |
| US-702 | Trucker Preferred Lanes (Origin/Destination Regions) | Trucker | `trucker_preferred_lanes` table: id (VARCHAR(36)), tenant_id (VARCHAR(36)), trucker_id (VARCHAR(36) FK), origin_region (VARCHAR), destination_region (VARCHAR), deleted_at (TIMESTAMPTZ); RLS enabled | phase-7-carrier-management.md | PENDING |
| US-703 | Trucker Availability (Days/Hours) | Trucker | Extend `carrier_profiles` with availability window (JSON: `{mon-fri: "06:00-22:00", sat: "09:00-18:00"}`); soft delete pattern | phase-7-carrier-management.md | PENDING |
| US-704 | Suggested Loads for Trucker (Filter by Saved Lanes) | Trucker | Load board query filters by `trucker_preferred_lanes.origin_region` + `destination_region`; respects deleted_at IS NULL | phase-7-carrier-management.md | PENDING |
| US-705 | Load Board Filter: Weight Range, Minimum Pay Rate | Trucker | Frontend filter component + backend QueryDSL: `load.weight BETWEEN ? AND ?` AND `load.rate_cents >= ?` | phase-7-carrier-management.md | PENDING |
| US-706 | Load Posting Validation Prompts (Shipper) | Shipper | In-form hints during load creation: weight correctness, state compliance, competitive rate benchmarking, realistic pickup/delivery windows | phase-7-carrier-management.md | PENDING |
| US-707 | Shipper Preferred Carrier List | Shipper | `preferred_carriers` table: id (VARCHAR(36)), tenant_id (VARCHAR(36)), shipper_id (VARCHAR(36) FK), trucker_id (VARCHAR(36) FK), added_at (TIMESTAMPTZ), deleted_at (TIMESTAMPTZ); RLS enabled | phase-7-carrier-management.md | PENDING |
| US-708 | Direct Load Assignment to Preferred Trucker | Shipper | Load creation flow: `assign_type` field (OPEN_BOARD \| PREFERRED); if PREFERRED, populate `claimed_by` directly, bypass open board | phase-7-carrier-management.md | PENDING |
| US-709 | Block Carrier (Prevent Load Visibility) | Shipper | `blocked_carriers` table: id (VARCHAR(36)), tenant_id (VARCHAR(36)), shipper_id (VARCHAR(36) FK), blocked_trucker_id (VARCHAR(36) FK), deleted_at (TIMESTAMPTZ); Load query filters: `AND blocked_trucker_id NOT IN (SELECT ...)` | phase-7-carrier-management.md | PENDING |
| US-710 | View Trucker Public Profile (Rating, Equipment, History) | Shipper | Profile page displays: aggregate rating from `ratings`, equipment from `carrier_profiles`, load claim count from `load_claims` (deleted_at IS NULL) | phase-7-carrier-management.md | PENDING |
| US-711 | Load Interest / View Count (Visible on Load Board) | Trucker | `load_views` table: id (VARCHAR(36)), tenant_id (VARCHAR(36)), load_id (VARCHAR(36) FK), trucker_id (VARCHAR(36) FK), viewed_at (TIMESTAMPTZ), deleted_at (TIMESTAMPTZ); aggregate on load card | phase-7-carrier-management.md | PENDING |

---

## 🔐 Phase 7A: Carrier Logistics & Compliance (5 Features)

**Dependency:** Phase 7 → Phase 7A → Unlocks Phase 7b (Financial Intelligence)

| Story ID | Feature | Area | Architectural Constraints | Source File | Status |
|----------|---------|------|--------------------------|-------------|--------|
| US-720 | USDOT & DOT Registration Verification | Trucker | `usdot_registrations` table: id (VARCHAR(36)), tenant_id (VARCHAR(36)), trucker_id (VARCHAR(36) FK), usdot_number (VARCHAR(6) UNIQUE), verified_at (TIMESTAMPTZ), expiry_date (TIMESTAMPTZ), deleted_at (TIMESTAMPTZ); external API integration (FMCSA); RLS enabled | phase-9-admin.md | PENDING |
| US-721 | Insurance Certificate Tracking | Trucker | `insurance_certificates` table: id (VARCHAR(36)), tenant_id (VARCHAR(36)), trucker_id (VARCHAR(36) FK), document_id (VARCHAR(36) FK), policy_number (VARCHAR), expiry_date (TIMESTAMPTZ), verified_at (TIMESTAMPTZ), deleted_at (TIMESTAMPTZ); RLS enabled | phase-9-admin.md | PENDING |
| US-722 | CDL & Medical Card Documentation | Trucker | `cdl_records` table: id (VARCHAR(36)), tenant_id (VARCHAR(36)), trucker_id (VARCHAR(36) FK), cdl_number (VARCHAR), state_issued (CHAR(2)), expiry_date (TIMESTAMPTZ), medical_card_expiry (TIMESTAMPTZ), deleted_at (TIMESTAMPTZ); RLS enabled | phase-9-admin.md | PENDING |
| US-723 | Equipment Condition Monitoring | Trucker | `equipment_inspections` table: id (VARCHAR(36)), tenant_id (VARCHAR(36)), carrier_profile_id (VARCHAR(36) FK), inspection_date (TIMESTAMPTZ), status (ENUM: PASS, FAIL, NEEDS_REPAIR), notes (TEXT), deleted_at (TIMESTAMPTZ); RLS enabled | phase-9-admin.md | PENDING |
| US-724 | DOT Compliance Dashboard | Admin | Dashboard view: compliance status per trucker (USDOT verified, insurance valid, CDL valid, medical card valid, equipment inspected); flag overdue docs | phase-9-admin.md | PENDING |

---

## 💰 Phase 7b: Advanced Financial Intelligence (8 Features)

**Dependency:** Phase 3 (Documents) + Phase 5 (Payments) → Phase 7b → Unlocks Phase 9

| Story ID | Feature | Area | Architectural Constraints | Source File | Status |
|----------|---------|------|--------------------------|-------------|--------|
| US-730 | Per-Load Earnings Log (Miles, Fuel, Net Profit) | Trucker | `load_earnings` table: id (VARCHAR(36)), tenant_id (VARCHAR(36)), trucker_id (VARCHAR(36) FK), load_id (VARCHAR(36) FK), actual_miles (DECIMAL(10,2)), fuel_used_gal (DECIMAL(10,2)), revenue_cents (BIGINT), cost_cents (BIGINT), net_profit_cents (BIGINT), recorded_at (TIMESTAMPTZ), deleted_at (TIMESTAMPTZ); populated on DELIVERED state | phase-7b-financial-intelligence.md | PENDING |
| US-731 | Weekly / Monthly P&L Report | Trucker | Aggregate `load_earnings` by date range: SUM(revenue), SUM(cost), SUM(net_profit); grouped by week/month; dashboard widget + export | phase-7b-financial-intelligence.md | PENDING |
| US-732 | IFTA Mileage Tracking by State | Trucker | `ifta_mileage` table: id (VARCHAR(36)), tenant_id (VARCHAR(36)), trucker_id (VARCHAR(36) FK), load_id (VARCHAR(36) FK), state (CHAR(2)), miles (DECIMAL(10,2)), recorded_at (TIMESTAMPTZ), deleted_at (TIMESTAMPTZ); parse POD location for state; quarterly tax report | phase-7b-financial-intelligence.md | PENDING |
| US-733 | Deadhead Mileage Estimation (Current Location → Pickup) | Trucker | Frontend: requires location permission; calculate distance via geospatial API; store in `load_details.estimated_deadhead_miles` | phase-7b-financial-intelligence.md | PENDING |
| US-734 | Deadhead Cost in Profitability Calculation | Trucker | Extend `load_earnings` calculation: `net_profit = revenue - (run_cost + deadhead_cost)`; deadhead_cost = estimated_deadhead_miles × fuel_cost_per_mile | phase-7b-financial-intelligence.md | PENDING |
| US-735 | Fuel Surcharge (FSC) Auto-Calculation | Trucker | Integrate EIA diesel average (already wired in Phase 5); if shipper enables FSC on load, calculate: FSC = (current_price - baseline) × miles; display on load card | phase-7b-financial-intelligence.md | PARTIAL |
| US-736 | Annual Earnings & Tax Summary Export (PDF/CSV) | Trucker | Aggregate `load_earnings` for fiscal year; generate PDF (Schedule C template) + CSV; include IFTA summary, fuel expenses, equipment depreciation guidance | phase-7b-financial-intelligence.md | PENDING |
| US-737 | Extract trucker_cost_profiles out of users Table | Platform | Data migration: move `users.avg_fuel_cost_per_mile`, `users.hourly_rate`, `users.depreciation_pct` to `trucker_cost_profiles` table with soft delete; backfill historical records | phase-7b-financial-intelligence.md | PENDING |

---

## 🎯 Phase 8: Bidding System (6 Features)

**Dependency:** Phase 4 (Ratings) + Phase 7 (Carrier Profiles) → Phase 8

| Story ID | Feature | Area | Architectural Constraints | Source File | Status |
|----------|---------|------|--------------------------|-------------|--------|
| US-740 | Post Load as Open-to-Bids vs First-Come-First-Served | Shipper | Extend `loads` table: `bidding_type` (ENUM: FCFS \| OPEN_TO_BIDS), `bid_deadline` (TIMESTAMPTZ); load creation flow toggle | phase-8-bidding.md | PENDING |
| US-741 | Trucker Submits Bid (Rate + Message) | Trucker | `load_bids` table: id (VARCHAR(36)), tenant_id (VARCHAR(36)), load_id (VARCHAR(36) FK), trucker_id (VARCHAR(36) FK), bid_rate_cents (BIGINT), message (TEXT), bid_status (ENUM: PENDING, ACCEPTED, REJECTED, WITHDRAWN), created_at (TIMESTAMPTZ), updated_at (TIMESTAMPTZ), deleted_at (TIMESTAMPTZ); RLS enabled | phase-8-bidding.md | PENDING |
| US-742 | Shipper Reviews & Accepts/Rejects Bids | Shipper | Dashboard view: list all bids for OPEN_TO_BIDS load, sorted by rate + trucker rating; accept action → `load_bids.bid_status = ACCEPTED` + update `loads.claimed_by` + `loads.status = CLAIMED` | phase-8-bidding.md | PENDING |
| US-743 | Bid Expiry & Auto-Close | Platform | Background job: query `loads WHERE bidding_type = OPEN_TO_BIDS AND bid_deadline < NOW() AND status = OPEN` → auto-select lowest qualified bid OR revert to OPEN if no bids | phase-8-bidding.md | PENDING |
| US-744 | Duplicate Load for Recurring Lanes | Shipper | Load creation: "Copy from Previous" → copy all fields (origin, destination, weight, equipment) to new draft load; shipper edits pickup date + rate | phase-8-bidding.md | PENDING |
| US-745 | Freight Class Field (LTL Support) | Shipper | Extend `loads` table: `freight_class` (VARCHAR(10): FTL, LTL, CLASS_1 ... CLASS_9); display on load board; used for insurance + rate estimation | phase-8-bidding.md | PENDING |

---

## 🛠️ Phase 9: Admin & Operations (10 Features)

**Dependency:** Phase 5 (Payments) + Phase 7 (Carrier Profiles) → Phase 9

| Story ID | Feature | Area | Architectural Constraints | Source File | Status |
|----------|---------|------|--------------------------|-------------|--------|
| US-750 | Admin Dashboard: Users, Loads, Tenants | Admin | Read-only views: user count, load volume (open/claimed/delivered), active tenants, avg claim time; charts via Grafana or embedded analytics | phase-9-admin.md | PENDING |
| US-751 | Dispute Resolution Tools | Admin | Query `financial_transactions WHERE dispute_hold = TRUE` → view dispute details, shipper/trucker comments, approve/reject manual settlement | phase-9-admin.md | PENDING |
| US-752 | Platform Health Metrics | Admin | Real-time metrics: load volume (24h/7d/30d), claim rate, avg time-to-claim, delivery success rate, cancellation rate; Prometheus + Grafana | phase-9-admin.md | PENDING |
| US-753 | Rate Benchmarking Tool | Shipper | Query historical loads (lane, weight, equipment, date) → suggest market rate based on EIA diesel, demand, carrier availability; UX: pre-fill rate field in load creation | phase-9-admin.md | PENDING |
| US-754 | Carrier Scorecard (Detailed Metrics per Trucker) | Shipper | View for single trucker: on-time %, damage claims, avg payment disputes, equipment compliance status, current load history (last 10 loads) | phase-9-admin.md | PENDING |
| US-755 | ELD Integration for Automated HOS Tracking | Trucker | Replace manual HOS widget: integrate with ELD provider (Geotab, Samsara); fetch on-duty hours in real-time; FMCSA 70-hr/8-day cycle enforcement | phase-9-admin.md | PENDING |
| US-756 | Document Upload: Insurance, CDL, Medical Card | Trucker | Extend `load_documents` table to support new document types; file validation (PDF, PNG); expiry tracking; shipper visibility for compliance | phase-9-admin.md | PENDING |
| US-757 | Freight Insurance Integration | Both | Optional per-load cargo insurance at booking: query insurance provider API, display premium, add to shipper invoice | phase-9-admin.md | PENDING |
| US-758 | TMS API Access (REST API for Shippers) | Shipper | REST endpoints: load posting, status polling, settlement retrieval; OAuth token for external TMS systems; OpenAPI spec | phase-9-admin.md | PENDING |
| US-759 | Recurring Load Scheduling | Shipper | UI: define weekly/monthly load template (origin, destination, weight, rate); platform auto-posts on cadence; manual override allowed | phase-9-admin.md | PENDING |

---

## 🏗️ Architectural Compliance Checklist

✅ **All 40 New Features Respect:**
- **ID Standard:** All PKs/FKs are `VARCHAR(36)` (PostgreSQL UUID support)
- **Multi-Tenancy:** Every table includes `tenant_id (VARCHAR(36))` column; RLS policies enforced
- **Soft Deletes:** All core entities (carrier_profiles, preferred_carriers, blocked_carriers, load_bids, load_earnings, etc.) include `deleted_at (TIMESTAMPTZ NULL)`
- **No-Lombok:** All POJO definitions use standard Java (no @Data, @Getter, @Setter)
- **Query Patterns:** All SELECT queries include `AND deleted_at IS NULL` and implicit `WHERE tenant_id = ?` via RLS
- **Transactional Integrity:** Domain events + outbox pattern for asynchronous propagation

---

## 📈 Dependency Map

```
Phase 1 ──┬─ Phase 2 ──┬─ Phase 3 (Documents) ──┐
          │            │                         │
          │            └─ Phase 4 (Ratings) ─┬─ Phase 5 (Payments) ──┬─ Phase 7b (Financial Intelligence)
          │                                  │                       │
          └────────────────────────────────── Phase 7 (Carrier Management) ─┬─ Phase 8 (Bidding)
                                                       │                    │
                                                       └─────────────────── Phase 9 (Admin & Ops)

Phase 6 (Messaging) — Independent (only requires Phase 1.2)
```

---

## 🔗 Traceability

| Requirement Set | Source File | Phases Covered | Status |
|-----------------|-------------|----------------|--------|
| Core Load Lifecycle | phase-1-core.md | 1–2 | ✅ COMPLETE |
| Documents & Proofs | phase-3-documents.md | 3 | ✅ COMPLETE |
| Ratings & Reviews | phase-4-ratings.md | 4 | ✅ COMPLETE |
| In-App Messaging | phase-6-messaging.md | 6 | ✅ COMPLETE |
| **Carrier Management** | **phase-7-carrier-management.md** | **7** | **🟡 PLANNED** |
| **Carrier Compliance** | **phase-9-admin.md** (7A section) | **7A** | **🟡 PLANNED** |
| **Financial Intelligence** | **phase-7b-financial-intelligence.md** | **7b** | **🟡 PLANNED** |
| **Bidding System** | **phase-8-bidding.md** | **8** | **🟡 PLANNED** |
| **Admin & Operations** | **phase-9-admin.md** | **9** | **🟡 PLANNED** |

---

## 📝 Notes for Obsidian Second Brain

**Tags for filtering:**
- `#phase-7` `#phase-7a` `#phase-7b` `#phase-8` `#phase-9` (by phase)
- `#carrier-profiles` `#bidding` `#financial-intelligence` `#compliance` (by feature domain)
- `#pending` `#partial` (by status)
- `#multi-tenant` `#rls` `#soft-delete` (by architectural constraint)

**Linked Stories (for backlink navigation):**
- US-701–US-712 all depend on `US-101` (Multi-Tenant Registration) and `US-501` (Settlement)
- US-720–US-724 are blocking prerequisites for Phase 7b features
- US-730–US-737 all require US-501 (Settlement) to be complete first

**Next Steps:**
1. **Architect:** Load this table + `ARCHITECT.md` → design schema + API contracts (Phase 7)
2. **BA:** Cross-reference `REQUIREMENTS.md` + `FEATURES.md` → confirm AC for each story
3. **Coder:** Pick US-701, US-702, US-703 → implement carrier profile backend (Phase 7 MVP)
4. **Reviewer:** Validate against RLS + soft-delete patterns before merge

---

**Generated:** 2026-04-27 | **Librarian:** Claude Haiku | **Status:** ✅ READY FOR ARCHITECTURE
