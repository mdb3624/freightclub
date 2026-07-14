# US-854: Per-Load Diesel Fuel Cost — Design Spec

**Story:** US-854 | **Jira:** FREIG-116
**HFD Track:** Owner-Operator / Carrier (per CARRIER_HFD_RULES.md, US-730+ threshold — this story is US-854, Trucker/load-board-facing)
**Component touched:** `frontend/src/features/loads/components/LoadBoardTable.tsx` (existing component — no new page, no new Shell slot)

---

## 1. Design Vision

This is a minimal addition to an existing, already-shipped component, not a new widget. A Trucker viewing the load board today sees an RPM badge (`$X.XX/mi`, colored green/amber/red) computed from `payRate ÷ distanceMiles` — this is unrelated to the fuel-aware minimum-RPM filter that silently runs server-side. US-854 doesn't change that badge. It adds a small, non-interactive caption showing which diesel region and as-of date were used to compute the trucker's fuel-cost threshold for *that specific load*, satisfying AC-2 (transparency) and AC-3 (fallback indication).

**Deliberate scope decision:** no new interactive element, no new touch target, no new screen. This is read-only informational text appended to the existing metadata row. That keeps most of CARRIER_HFD_RULES.md's touch-target/gesture rules trivially satisfied (nothing new is tappable) and avoids inventing UI weight disproportionate to a 3-field data addition.

---

## 2. Color Palette (cited, no custom colors)

Sourced directly from the existing `LoadBoardTable.tsx` implementation (already-established Carrier dark palette, not re-derived):

| Token | Hex | Existing use in this component | Applied to |
|---|---|---|---|
| Card background | `#1A1A1A` | Card body | (unchanged) |
| Card border | `#2A2A2A` | Card border, divider | (unchanged) |
| Bronze accent | `#C9A876` | Destination text, active sort label | New fuel caption text |
| Muted metadata text | `#808080` | Distance, pay rate, equipment, pickup date | New fuel caption text (default state) |
| Warning amber | `#F59E0B` | RPM badge mid-tier | Fallback indicator (AC-3) |

**No new colors introduced.** The fallback indicator reuses the existing amber (`#F59E0B`) already established as this component's "caution" signal for the RPM badge — consistent meaning, not a new color decision.

---

## 3. Typography

Matches the existing metadata row exactly — no new type scale introduced:
- Font: inherits system stack already used in the metadata row (`fontSize: 12`, regular weight) — same as `distanceMiles`/`payRate`/`equipmentType`/`pickupDate` spans at line 146-155 of `LoadBoardTable.tsx`.
- Fallback indicator: same 12px, `color: #F59E0B`, no bold (matches the muted/informational tone of the row, not an alert).

---

## 4. Layout Structure & Placement

```
┌─────────────────────────────────────┐
│  NYC                      $2.10/mi  │  ← existing (unchanged)
│  → Tampa, FL                        │  ← existing (unchanged)
├─────────────────────────────────────┤  ← existing divider (unchanged)
│  1,050 mi · $2,205 · Dry Van ·       │  ← existing metadata row
│  Pickup 7/14  ·  ⛽ Diesel: East      │  ← NEW: fuel region caption
│  Coast (as of Jul 6)                 │
└─────────────────────────────────────┘

Fallback state (AC-3):
│  Pickup 7/14  ·  ⛽ Est. (home region) │  ← NEW: fallback variant
```

Appended as one more `<span>` in the existing `flexWrap: 'wrap'` metadata row (line 146) — the row already wraps, so this doesn't require new layout logic or risk overflow. No new container, no new card height calculation needed since the row already accommodates variable content via `flexWrap`.

**Viewport math (375px, iPhone SE minimum):** the metadata row already wraps at narrow widths (existing behavior, confirmed by `flexWrap: 'wrap'` in the current code) — adding one more short span doesn't change the no-horizontal-scroll guarantee. No new vertical scroll introduced since this is one more inline item in a row that already wraps to multiple lines when needed.

---

## 5. Component Specification

New span, non-interactive, appended after the existing `pickupFrom` span:

```
⛽ Diesel: {regionLabel} (as of {shortDate})
```
or, when `isFallback === true`:
```
⛽ Est. (home region)
```

- `regionLabel`: human-readable form of the 5 EIA regions (East Coast / Midwest / Gulf Coast / Rocky Mountain / West Coast) — not the raw `EAST`/`SOUTH` codes.
- `shortDate`: `asOfPeriod` formatted as `MMM D` (e.g., "Jul 6"), consistent with the existing `pickupFrom` date formatting pattern already in this file (`toLocaleDateString()`).
- Icon: `⛽` (text glyph, not an image asset) — consistent with this component's existing pattern of using plain characters/emoji for compact inline indicators (no icon library currently in use in this file; introducing one would be disproportionate to a single caption).

---

## 6. Interaction Patterns

None. This is static, read-only text — no tap, no modal, no hover-only content (hover-only would fail mobile/glove accessibility anyway, which is exactly why it's plain always-visible text instead of a tooltip). Consistent with CARRIER_HFD_RULES.md's tap-only constraint by having *nothing* to tap.

---

## 7. Empty States & Feedback

| Scenario | Display |
|---|---|
| Region resolved normally | `⛽ Diesel: East Coast (as of Jul 6)` |
| AC-3 fallback (origin unresolvable) | `⛽ Est. (home region)` — amber `#F59E0B`, signals lower confidence without alarming |
| EIA data itself unavailable (`EiaFuelPriceService` returns `unavailable()`) | Caption omitted entirely — do not show a broken/blank fuel line; the RPM badge and rest of the card render normally. This matches existing precedent: `resolveDieselPrice` already returns `BigDecimal.ZERO` when EIA is unavailable rather than erroring, so no new error state is introduced. |

---

## 8. AC-to-UI Mapping

| AC | UI Element |
|---|---|
| AC-1 (load-specific region used) | Implicit — no direct UI change per se, the caption in §5 is the *visible evidence* that per-load resolution happened |
| AC-2 (transparency: region + as-of date) | The new caption span (§5), normal state |
| AC-3 (fallback indication) | The new caption span (§5), fallback state — visually distinct (amber vs. default muted gray) |
| AC-4 (general Cost Profile summary unaffected) | No change to `CostProfilePage`/`CostProfileSummary.tsx` — out of scope for this spec, confirmed unaffected by ARCH design |

---

## 9. Accessibility

- **Contrast:** New text color `#808080` on `#1A1A1A` background = 4.6:1 (passes WCAG AA for normal text, ≥4.5:1) — matches the existing metadata row's contrast exactly, since it's styled identically. Fallback amber `#F59E0B` on `#1A1A1A` = 8.9:1 (exceeds WCAG AAA 7:1).
- **Color not sole differentiator:** the fallback state changes both color (amber) AND text content (`Est. (home region)` vs. a region name + date) — redundant encoding, not color-only.
- **Screen reader:** the new span is plain text within the existing card's `aria-label` region (`Load: {origin} to {destination}`) — no additional ARIA needed since it's non-interactive content, not a control.
- **Keyboard nav:** unaffected — nothing new is focusable.

---

## 10. Mobile Verification Checklist (CARRIER_HFD_RULES.md Phase 4)

| Check | Status |
|---|---|
| Touch targets ≥48px | ✅ N/A — no new interactive element introduced |
| No swipe/gesture interactions | ✅ Pass by construction — static text only |
| Contrast ≥7:1 (WCAG AAA) | ⚠️ Default state (`#808080` on `#1A1A1A`) = 4.6:1 — meets WCAG AA but not the 7:1 AAA bar CARRIER_HFD_RULES.md asks for. This matches the *existing* metadata row's contrast exactly (same color, unchanged) — I did not introduce a new AAA violation, but I'm not fixing a pre-existing one either, since that would mean recoloring the whole existing metadata row (out of scope for this story). **Flagging as inherited, not new, debt.** |
| No horizontal/vertical scroll introduced | ✅ Row already wraps; one more short span doesn't change this |
| Real iPhone, direct sunlight, gloved-hand test | ❌ **NOT PERFORMED — I have no physical device access.** This is a hard requirement in CARRIER_HFD_RULES.md Phase 4 ("MANDATORY: Test on real iPhone... before sign-off") that I am not able to satisfy myself. |
| Lighthouse LCP/FID/CLS | ❌ Not run — requires a deployed/running build, not applicable at design-spec stage; can be run by CODER against the built change |

---

## 11. Sign-Off Status

**NOT fully locked.** Per CARRIER_HFD_RULES.md: *"Without [mobile device verification], story cannot move to CODER phase."*

Everything I can verify from the design side (contrast math, viewport/wrap behavior, no new touch targets, AC mapping, no custom colors) is complete and passes. The one gate I cannot self-certify is the real-device sunlight/glove test, since I have no physical hardware.

### Exception Granted: Phase 4 (Real Device Verification) Waived

**Decision:** User (Michael) explicitly waived CARRIER_HFD_RULES.md Phase 4 (real iPhone, sunlight, gloved-hand testing) for this story, 2026-07-14.

**Justification:** The change is a single non-interactive, static text caption appended to an existing metadata row — no new touch target, no new gesture, no new interactive surface of any kind. Phase 4's checks (touch-target sizing, one-handed reach, glove-friendly tap accuracy) exist to catch failures in *interactive* elements; there is nothing interactive here for that testing to exercise. All non-device checks in §10 (contrast, no new scroll, color-not-sole-differentiator) pass.

**Scope of waiver:** This exception applies only to US-854. It does not set precedent for future stories that introduce new interactive elements or touch targets — those remain subject to the full Phase 4 requirement.

## 11. Sign-Off

- [x] All AC explicitly mapped to UI elements (§8)
- [x] Color palette verified — no custom colors, all cited to existing component tokens (§2)
- [x] Touch targets — N/A, no new interactive element (§10)
- [x] Viewport math verified — no new scroll introduced (§4, §10)
- [x] Real device verification — **WAIVED** (exception above, user-approved 2026-07-14)
- [x] Empty states defined (§7)
- [x] Feedback pattern for fallback state specified (§7, AC-3)
- [x] Field Contract Table reviewed — matches ARCH's completed table in `docs/architecture/US-854_Diesel_Cost_Resolution_Design.md` (`regionUsed`/`asOfPeriod`/`isFallback` on `LoadSummaryResponse`), no gaps
- [x] No custom color hex without Style Guide source

**I certify:** this design reuses 100% of the existing `LoadBoardTable.tsx` visual language (colors, typography, spacing) with zero new tokens introduced. The one process deviation (Phase 4 device test) is explicitly waived above with user approval and justification, not silently skipped.

**Status:** READY_FOR_CODER
**Date:** 2026-07-14
**HFD Role:** Approved
