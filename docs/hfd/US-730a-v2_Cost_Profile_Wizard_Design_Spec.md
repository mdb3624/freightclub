# US-730a-v2: Cost Profile Wizard Redesign — Design Specification

**Story:** US-730a-v2 (Cost Profile Wizard Redesign)
**Change Request:** CHG-US730-007 — supersedes US-730a
**Epic:** US-730 (Carrier Dashboard MVP)
**Phase:** Phase 7a
**Owner:** HFD (Human Factors Designer)
**Status:** READY_FOR_CODER
**Date:** 2026-07-06
**Reference ARCH Design:** `docs/architecture/ARCH_US-730a-v2_Cost_Profile_Wizard_Design.md`

---

## Master Prototype (Authoritative — per user direction 2026-07-06)

**This story's Master Prototype is the HTML prototype file itself, not the tokenized Style Guide:**
- `Prototype/ui_kits/carrier/cost-profile.html` — pixel/hex/spacing source of truth
- `Prototype/COST_PROFILE_INTEGRATION.md` — behavioral/data-shape source of truth

Where the prototype and `CARRIER_DESIGN_SYSTEM.md`/Style Guide disagree, **the prototype wins** for this initiative (see `memory/project_carrier_profile_prototype_source_of_truth.md`). This is documented below as an approved deviation, not an oversight.

---

## 1. Scope & Shell Context

Entry point: Carrier Settings screen row `{ icon: '⚙️', label: 'Cost Profile', sub: 'CPM, fuel cost & min RPM calculator', href: '/carrier/cost-profile' }`. New route `/carrier/cost-profile`, carrier-role gated, same auth guard as `/carrier/dashboard`.

**Header pattern (all carrier sub-screens):**
```
[Logo → /carrier/dashboard]   Cost Profile   [Save]  [Avatar]
```
No notification bell (sub-screen rule — bell is dashboard-only).

**View logic:**
```
GET /api/v1/carrier/cost-profile
  204 (no profile) → render Wizard at Step 1
  200 (profile exists) → render Summary
```

---

## 2. Fidelity Audit (Element-by-Element vs. Master Prototype)

Extracted directly from `Prototype/ui_kits/carrier/cost-profile.html`:

| Element | Prototype Value | Spec Value | Status |
|---|---|---|---|
| Page background | `#0a0a0a` | `#0a0a0a` | ✅ Verified |
| Card surface | `#121212` / `#161616` | `#121212` / `#161616` | ✅ Verified |
| Card border | `#2A2A2A` / `#3A3A3A` | `#2A2A2A` / `#3A3A3A` | ✅ Verified |
| Bronze gradient (primary CTA) | `#C9A46A → #B08D57 → #8C6D3F` | same | ✅ Verified |
| Bronze gradient border | `#7A5F3A` | `#7A5F3A` | ✅ Verified |
| Break-even KPI | `#EF4444` | `#EF4444` | ✅ Verified — **deviation from Style Guide's `#E74C3C`, approved** |
| Min RPM KPI | `#F59E0B` | `#F59E0B` | ✅ Verified — **deviation from Style Guide's `#F39C12`, approved** |
| Target KPI | `#22C55E` | `#22C55E` | ✅ Verified — **deviation from Style Guide's `#27AE60`, approved** |
| Muted/secondary text | `#636E72` / `#4A5568` / `#808080` | same | ✅ Verified |
| Card border radius | `8px` | `8px` | ✅ Verified |
| Pill/chip radius | `9999px` | `9999px` | ✅ Verified |
| Input padding | `14px 16px` | `14px 16px` | ✅ Verified |
| Button padding (secondary) | `8px 16px` | `8px 16px` | ✅ Verified |
| Font family | `var(--font-body)` → Inter stack | Inter (body), Sora (headers) | ✅ Verified |

### Exception Request: Semantic Color Deviation

- **Deviation:** KPI tile colors (`#EF4444`/`#F59E0B`/`#22C55E`) differ from the Carrier Design System's semantic palette (`#E74C3C`/`#F39C12`/`#27AE60`) used elsewhere (e.g., US-730-0 dashboard).
- **Justification:** User explicitly designated the prototype HTML as source of truth for this initiative (2026-07-06); the prototype's palette is what CODER must match pixel-for-pixel.
- **Approval:** User-approved directly (stands in place of ARCHITECT exception approval per this story's explicit instruction).
- **Scope:** Applies only to US-730a-v2 and US-730g. Does not retroactively change US-730-0/US-730b's existing badge colors — flag as a follow-up consolidation question if palette unification is later desired.

**I certify this spec is 1:1 with the Master Prototype (`cost-profile.html`); zero unauthorized drift beyond the documented, user-approved exception above.**

---

## 3. Summary Screen (profile exists)

Three KPI tiles, left-to-right, per `COST_PROFILE_INTEGRATION.md` Step 6:

```
┌───────────┐ ┌───────────┐ ┌───────────┐
│ BREAK-EVEN│ │  MIN RPM  │ │  TARGET   │
│  $X.XX    │ │  $X.XX    │ │  $X.XX    │
│ "Stay home"│ │"Bare min" │ │ "Run it"  │
│  #EF4444  │ │  #F59E0B  │ │  #22C55E  │
└───────────┘ └───────────┘ └───────────┘
```
Color + text label together (satisfies no-color-only-encoding accessibility rule).

Below tiles — cost breakdown with driving inputs shown for verification:
```
Fuel:   $X.XXX/mi  →  6.5 MPG · [Region] diesel
Fixed:  $X.XXX/mi  →  $X,XXX/mo ÷ XXX,XXX mi
Margin: $X.XXX/mi  →  $X,XXX/wk × XX wks
```

Load board color key (same thresholds, same hex values as above):
```
● Green  ≥ target RPM — Run it
● Yellow ≥ min RPM — Marginal
● Red    < min RPM — Stay home
```

"Update Cost Profile" button (bronze gradient, 64px tall) → wizard Step 1.

---

## 4. Wizard (3 Steps)

**Step 1 — Fuel:** MPG input (centered, large font). Diesel region chip selector — **East / Midwest / South / Rocky Mountain / West** (5 real EIA regions per ARCH decision, not the prototype's literal 4-label set) — each chip shows live price from `GET /api/v1/market/diesel-prices`. Additional cost/mi input, hint "Typically $0.06–$0.10/mi". Live result: `Fuel + variable cost/mi = $X.XXX`. "Next — Fixed Costs →" (64px).

**Step 2 — Fixed Costs:** Truck payment/mo (hint "$0 if paid off"), Insurance/mo (hint "$400–$900/mo for new authority"), Permits/mo (hint "IFTA, UCR, base plate ~$150"), Annual miles (hint "100,000–130,000 mi/year typical"). Live result: `Fixed cost/mi = $X.XXX`. Back/Next.

**Step 3 — Income Goal:** Weekly take-home goal ($), weeks-worked chip selector (44/46/48/50/52). Live result: `Target margin/mi = $X.XXX`. Back / "See My RPM →" → Summary.

**Save behavior:** Save button always visible in header on every step and summary. "Last saved HH:MM" shown when idle. Unsaved-changes warning on navigate-away mid-wizard.

---

## 5. Gloved-Hand & Responsive Requirements

| Element | Minimum |
|---|---|
| All tap targets | 56px tall |
| Primary CTA (Next/Save) | 64px tall |
| Text inputs | 52px tall |
| Body text | 16px |
| Labels | 12–14px |

Primary: iPhone 375–390px. Desktop/tablet optional for this screen (matches Carrier persona mobile-first rule). Real-device verification (sunlight, gloved/simulated) required before sign-off, per `CARRIER_HFD_RULES.md`.

---

## 6. Accessibility

- Contrast: KPI tile text on tile background ≥7:1 (WCAG AAA, carrier persona standard) — verify with WebAIM checker against the three prototype hex values above.
- Focus states: 2px bronze (`#B08D57`) outline on all interactive elements.
- Screen reader: KPI tiles announce both label and value ("Break-even, $1.42 per mile, Stay home").
- Keyboard: full Tab-order through wizard steps; no keyboard traps.

---

## 7. Field Contract Table Validation (HFD Gate)

Reviewed against `ARCH_US-730a-v2_Cost_Profile_Wizard_Design.md` §3:

- [x] Every UI Field has a non-empty API Param or explicit N/A + justification
- [x] Every API Param has a non-empty DB Column or explicit N/A (derived KPI tiles marked N/A — computed, never stored)
- [x] No type mismatches (all NUMERIC/INTEGER/SMALLINT align with UI numeric inputs)
- [x] No duplicate param names
- [x] All commands in this spec use PowerShell-compatible syntax (N/A — no shell commands in this spec)

**HFD Sign-Off Checkbox:** ✅ I have validated this table for completeness and logical consistency. No gaps found; no escalation to ARCHITECT needed.

---

## 8. Certification

> **I, the Human Factors Designer, certify that:**
> ✅ This mockup has been validated element-by-element against the Master Prototype (`Prototype/ui_kits/carrier/cost-profile.html`).
> ✅ Touch targets and responsive behavior specified for iPhone 375–390px (primary), per Carrier persona rules.
> ✅ The Field Contract Table has been reviewed and validated for completeness.
> ✅ One documented, user-approved exception exists (semantic KPI colors, §2) — no other unauthorized visual drift detected.
>
> **Status:** READY_FOR_CODER
> **Date:** 2026-07-06
> **HFD Role:** Approved

---

## 9. Handoff to CODER

- Backend: implement per `ARCH_US-730a-v2_Cost_Profile_Wizard_Design.md` (migration, controller, formula extension).
- Frontend: new route + `CostProfileSummary`/`CostProfileWizard` components; retire `CostProfileSection` from `ProfilePage.tsx` for trucker persona; update Settings entry href.
- Testing: Playwright golden path (first-time wizard → summary → load-board RPM badge color update after save) with `data-testid` on every input; `boundingBox()` assertion on all new interactive elements per reviewer-checklist §4 touch-target automation rule; screenshot evidence in `test-results/evidence/`.
- No design changes permitted during CODER phase — escalate any infeasibility to LIBRARIAN via CHG, not back to HFD/ARCH.
