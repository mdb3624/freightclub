# Carrier / Owner-Operator Workflow — Verification & Gap-Closure Design

**Status:** APPROVED
**Date:** 2026-07-04
**Author session finding, not a new epic:** This design was produced after discovering that the OO/carrier workflow — believed to need "ground-up" development — is in fact already substantially built, live-routed, and hook-driven. The real work is verification, one missing subsystem, and cleanup of a duplicated/orphaned build, not a rebuild.

---

## 1. Background — how this was discovered

The session started from `docs/project/Story_Map.md`, which lists the entire US-730 Carrier Dashboard MVP epic (Cost Profile, Load Visibility, Performance Dashboard, Unified Dashboard, Equipment/Lane Management, Payment Acknowledgment) as `READY_FOR_DESIGN` — i.e., not started. Investigation of the actual codebase and routing shows this status is stale and wrong:

- `App.tsx` routes `/dashboard/trucker` → `TruckerDashboard.tsx`. This component is real: it uses `useLoadBoard`, `useMyActiveLoad`, `useMyLoadHistory`, `useProfile`, `useDieselPrices`, and a `computeRpm` profitability utility. It matches the prototype's locked "Luxury Industrial" dark design tokens (`#121212`/`#1A1A1A`/`#2A2A2A`/`#C9A876`) exactly.
- `App.tsx` also routes `/dashboard/carrier` → `CarrierDashboard.tsx` (commented `US-730-0: Carrier Dashboard MVP (Owner-Operator)`). This component is a visual shell with 100% hardcoded mock data (fake loads, fake stats) and zero hooks. **Nothing in the app navigates to `/dashboard/carrier`** — it is orphaned.
- `TruckerLoadDetailPage.tsx` (routed at `/trucker/loads/:id`) has the full state machine already wired: Claim (`useClaimLoad`, blocked if an active load exists) → BOL photo upload required → Mark Picked Up (`useMarkPickedUp`) → POD photo upload required → Mark Delivered (`useMarkDelivered`) → post-delivery `RatingForm` to rate the shipper. Confirmation dialogs gate Pickup and Delivery, matching the prototype's documented business rules exactly.
- `ProfitabilityCard` renders live on OPEN/CLAIMED/IN_TRANSIT loads, fed by real cost-profile fields from `useProfile()`.
- The only subsystem from the original US-730 breakdown with **zero code anywhere in the project** (grepped project-wide) is **Payment Acknowledgment**.
- A prior session's memory (`feedback_cost_profile_blocker.md`, 2026-05-30, marked CRITICAL) reports that `CostProfileSection` fields — the same fields `ProfitabilityCard` depends on — did not persist to the backend after 4+ hours of debugging. This is unresolved and unverified as of this session (35 days stale).

**Conclusion:** two parallel builds of the OO dashboard exist. The real one (`TruckerDashboard.tsx` + `TruckerLoadDetailPage.tsx`) predates or sits outside the US-730 epic as documented in `Story_Map.md`. The mock one (`CarrierDashboard.tsx`) was built against the US-730-0 locked HFD spec without checking that equivalent functionality already existed and shipped. This is a Sequential Lock Protocol failure worth escalating, not silently fixing.

---

## 2. Scope of this work

This is **not** a ground-up build. It is:

1. A **CHG escalation** documenting the duplicate-epic conflict, per `.claude/rules/change-request-protocol.md`, plus a `Story_Map.md` correction so US-730's status reflects reality.
2. A **live end-to-end verification** of the real flow, via the project's mandatory Docker Pre-Test Protocol + Playwright — not just a code read.
3. A **fix or confirmation** of the cost-profile persistence bug, since it's the one concrete unresolved defect blocking `ProfitabilityCard` from being trustworthy.
4. **Building Payment Acknowledgment** (US-730f) — the one subsystem with no code anywhere — date-logging only, no money movement, per its existing story definition.
5. **Retiring the orphaned mock** — removing `/dashboard/carrier` and `CarrierDashboard.tsx`, after checking whether any of its HFD-approved pixels (e.g., the tab-bar layout) are worth porting into `TruckerDashboard.tsx` first.

Out of scope: any new design work. The locked prototype (`ui_kits/carrier/index.html`) and `CARRIER_DESIGN_SYSTEM.md` remain the source of truth; `TruckerDashboard.tsx` already conforms to it, so no HFD re-design is needed unless verification (step 2) finds a real visual gap against the prototype.

---

## 3. Work breakdown

### 3.1 CHG escalation + Story_Map correction (LIBRARIAN)
- File a CHG ticket per `.claude/rules/change-request-protocol.md`: root cause (US-730 epic designed/built without checking `TruckerDashboard.tsx` already existed), recommend Option A (accept `TruckerDashboard.tsx` as the real implementation, retire the duplicate) rather than Option B (rework).
- Correct `Story_Map.md`: US-730 sub-stories (`US-730-0`, `US-730a` Cost Profile, `US-730b` Load Visibility, `US-730c` Performance Dashboard, `US-730d` Unified Dashboard, `US-730e` Equipment/Lane) move from `READY_FOR_DESIGN` to `COMPLETED (via TruckerDashboard.tsx — pre-existing implementation, discovered 2026-07-04)`, except `US-730f` Payment Acknowledgment, which stays open.
- Fix the duplicate/conflicting US-730 row further down `Story_Map.md` (Phase 7b "Per-Load Earnings Log") — confirm whether this is a genuinely separate story that was mis-numbered, and renumber if so.

### 3.2 Live E2E verification (CODER, full Pre-Test Protocol)
Drive the real flow in a browser against a freshly built Docker environment:
1. Log in as a TRUCKER-role user.
2. `/dashboard/trucker` — confirm load board renders, equipment auto-filter applies (no manual dropdown), diesel ticker and active-load hero render correctly.
3. Claim an OPEN load — confirm board lock banner appears, confirm a second claim attempt is blocked while a load is active.
4. On `/trucker/loads/:id` — confirm BOL photo upload gates the "Mark as Picked Up" button, confirm the pickup confirmation dialog, confirm status transitions to IN_TRANSIT.
5. Confirm POD photo upload gates "Mark as Delivered," confirm the delivery confirmation dialog, confirm status transitions to DELIVERED.
6. Confirm `RatingForm` appears post-delivery and a shipper rating submits successfully.
7. **Specifically re-test the cost-profile save**: fill `CostProfileSection` fields on the profile page, save, reload, and inspect the Network tab PUT payload to confirm all 11 fields persist (per the exact reproduction steps in `feedback_cost_profile_blocker.md`).
8. Confirm `ProfitabilityCard` reflects real, saved cost-profile data (not stale/default values) on a load's detail page.

Capture Playwright evidence per `.claude/rules/testing_standards.md` (data-testid selectors, trace on failure, AC traceability comments).

### 3.3 Cost-profile persistence fix (CODER, only if 3.2 step 7 reproduces the bug)
- If still broken: follow the "Next Steps" already documented in `feedback_cost_profile_blocker.md` (Option A quick-win console.log verification → Option B rewrite `CostProfileSection` with explicit `register()` calls → Option C controlled-component rewrite), starting with the cheapest option and escalating only if needed.
- If fixed already (possible — 35 days is long enough that another change could have resolved it as a side effect): document that it's resolved and update/retire the memory file.

### 3.4 Payment Acknowledgment — US-730f (CODER, TDD per project standard)
- Per the existing story definition (date-logging only, NO money movement, foundation for Phase 9 settlement): add an "Acknowledge Payment" action on DELIVERED/SETTLED loads in `TruckerLoadDetailPage.tsx`, logging a payment-acknowledged timestamp.
- Backend: new endpoint + migration (`VYYYYMMDD_HHmm__add_payment_acknowledged_at.sql`), `VARCHAR(36)` IDs, `TIMESTAMPTZ` timestamp, RLS enabled, `deleted_at IS NULL` filtering per `postgres-native.md`.
- Frontend: button + confirmation, matching existing `TruckerLoadDetailPage.tsx` patterns (Button component, toast on success).
- Tests: backend `@SpringBootTest` + `MockMvc` controller test, frontend unit test, Playwright E2E extending the flow in 3.2 through payment acknowledgment.

### 3.5 Retire the orphaned mock dashboard (CODER, after user confirms)
- Diff `CarrierDashboard.tsx`'s tab-bar/hero layout against `TruckerDashboard.tsx` for anything visually worth porting (the mock followed the locked HFD spec pixel-for-pixel; `TruckerDashboard.tsx` may have diverged in minor ways).
- Remove the `/dashboard/carrier` route from `App.tsx` and delete `CarrierDashboard.tsx` + its sub-components, unless a visual gap is found in the diff, in which case port only the specific gap into `TruckerDashboard.tsx`.

---

## 4. Testing & completion gates

Per `.claude/rules/reviewer-checklist.md` and `.claude/rules/testing_standards.md`:
- Backend: JaCoCo ≥ 80% branch coverage on any new Payment Acknowledgment code.
- Frontend: Playwright E2E golden path covering claim → BOL → pickup → POD → deliver → rate → acknowledge payment, with `data-testid` selectors and AC-traceability comments.
- Touch targets ≥48px verified via `boundingBox()` assertions on any new interactive element (Carrier/OO persona rule).
- REVIEWER sign-off requires actual E2E execution evidence (pass/fail lines), not just "tests written."

---

## 5. Explicitly out of scope

- Any new HFD design work — the prototype and `CARRIER_DESIGN_SYSTEM.md` are already satisfied by `TruckerDashboard.tsx`.
- Rebuilding the load board, claim flow, or state machine — confirmed working in code; only needs live verification, not new implementation.
- Real payment processing / money movement — Payment Acknowledgment is date-logging only, per the existing locked story scope (Phase 9 handles real settlement).
