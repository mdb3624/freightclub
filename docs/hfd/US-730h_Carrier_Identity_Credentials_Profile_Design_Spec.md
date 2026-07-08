# US-730h: Carrier Identity & Credentials Profile — Design Specification

**Story:** US-730h (Carrier Identity & Credentials Profile)
**Change Request:** CHG-US730-008 — supersedes US-730e's Equipment/Lanes tabs (Equipment tab UI only; Lanes tab reuses the existing API unchanged)
**Epic:** US-730 (Carrier Dashboard MVP)
**Phase:** Phase 7a
**Owner:** HFD (Human Factors Designer)
**Status:** READY_FOR_CODER
**Date:** 2026-07-08
**Reference ARCH Design:** `docs/architecture/ARCH_US-730h_Carrier_Identity_Credentials_Profile_Design.md`

---

## Master Prototype (Authoritative — per established project convention)

**This story's Master Prototype is the HTML prototype file itself, not the tokenized Style Guide:**
- `Prototype/ui_kits/carrier/carrier-profile.html` — pixel/hex/spacing source of truth
- `Prototype/CARRIER_PROFILE_INTEGRATION.md` — behavioral/data-shape source of truth (business rules, expiry thresholds; API endpoint proposals in this doc are superseded by ARCH's Platform Reuse Check — see ARCH doc §0)

Where the prototype and `CARRIER_DESIGN_SYSTEM.md`/Style Guide disagree, **the prototype wins** for this initiative, matching the precedent set for US-730a-v2 (`memory/project_carrier_profile_prototype_source_of_truth.md`).

---

## 1. Scope & Shell Context

Entry point: Carrier Settings screen row `{ icon: '👤', label: 'Profile', sub: 'Name, DOT, CDL, insurance, equipment', href: '/carrier/profile' }`. New route `/carrier/profile`, carrier-role gated, same auth guard as `/carrier/dashboard`.

**Header pattern (all carrier sub-screens):**
```
[Logo → /carrier/dashboard]   My Profile   [Save]  [Avatar]
```
No notification bell (sub-screen rule — bell is dashboard-only). Matches US-730a-v2's established header convention exactly.

**No-scroll tabbed layout:** 4 tabs — Identity / Equipment / Creds / Lanes — each tab's content must fit within one screen height (no vertical scroll within a tab), per the prototype's explicit `subtitle="No-scroll tabbed profile — each tab fits one screen"` annotation.

**View logic:** single `GET /api/v1/profile` call populates all 4 tabs (existing endpoint, extended per ARCH §3/§4) plus a separate `GET /api/v1/profile/lanes` call for the Lanes tab (existing endpoint, unchanged).

---

## 2. Fidelity Audit (Element-by-Element vs. Master Prototype)

Extracted directly from `Prototype/ui_kits/carrier/carrier-profile.html`:

| Element | Prototype Value | Spec Value | Status |
|---|---|---|---|
| Page/phone background | `#0a0a0a` / `#121212` | `#0a0a0a` / `#121212` | ✅ Verified |
| Header | `56px`, `#1A1A1A`, border `#2A2A2A` | same | ✅ Verified |
| Input background | `#161616`, border `#2A2A2A` | same | ✅ Verified |
| Input height (gloved) | `52px` | `52px` | ✅ Verified |
| Input font size | `16px` | `16px` | ✅ Verified |
| Input focus border | `#C9A876`, shadow `rgba(201,168,118,.1)` | same | ✅ Verified |
| Input error border | `#E74C3C` | `#E74C3C` | ✅ Verified |
| Input warn border | `#F59E0B` | `#F59E0B` | ✅ Verified |
| Primary CTA (`.btn-b`) | bronze gradient `#C9A46A→#B08D57→#8C6D3F`, border `#7A5F3A`, `64px` | same | ✅ Verified |
| Secondary/ghost button (`.btn-g`) | transparent, border `#3A3A3A`, text `#C9A876`, `56px` | same | ✅ Verified |
| Tab bar | `48px` tall, active underline `2px #B08D57`, active text `#F5F5F5`, inactive `#636E72` | same | ✅ Verified |
| Section label (`.sec-lbl`) | `10px`, `700`, uppercase, `.08em` tracking, `#636E72` | same | ✅ Verified |
| Avatar badge | `36px` (header) / `44px` (identity summary strip), gradient `#C9A46A→#8C6D3F`, ring `0 0 0 2px #B08D57` | same | ✅ Verified |
| Tag pill (lane chip) | bg `rgba(201,168,118,.1)`, border `#C9A876`, radius `9999px`, text `#C9A876` | same | ✅ Verified |
| Expiry color: ok | `#27AE60` | `#27AE60` | ✅ Verified |
| Expiry color: warn | `#F59E0B` | `#F59E0B` | ✅ Verified |
| Expiry color: critical/expired | `#E74C3C` | `#E74C3C` | ✅ Verified |
| Credential warning banner | bg `rgba(231,76,60,.1)`, border-bottom `#E74C3C` | same | ✅ Verified |
| Completeness pill bar | `4px` height, `9999px` radius, color-coded by % | same | ✅ Verified |
| Equipment-confirm sheet | bottom sheet, `rgba(0,0,0,.75)` scrim, `#1A1A1A` panel, top border `#C9A876` | same | ✅ Verified |

**No deviations found.** Unlike US-730a-v2, this prototype's semantic colors (`#27AE60`/`#F59E0B`/`#E74C3C`) already match `CARRIER_DESIGN_SYSTEM.md`'s existing palette exactly — no exception request needed.

**I certify this spec is 1:1 with the Master Prototype (`carrier-profile.html`); zero drift.**

---

## 3. Tab Structure (4 tabs, no-scroll each)

### Tab 1 — Identity
Row2: First name / Last name. Phone (formatted `(XXX) XXX-XXXX` as-typed via `formatPhone()`). Email (validated on blur, error text below field). Identity summary strip below the fields: avatar-initials circle + name + `phone · email`.

### Tab 2 — Equipment
Equipment type select (hint: "Filters every load on your board — one type only") — changing it triggers the equipment-confirm bottom sheet before committing. Row2: Year / Make. Row2: Model / Plate (uppercase display). VIN (optional, max 17 chars).

**Equipment-change confirmation sheet:** "Change equipment type? **{to}** loads will replace **{from}** on your board. Takes effect immediately." Buttons: "Yes, Switch" (primary) / "Cancel" (ghost), 2-col grid.

### Tab 3 — Creds
Row2: DOT # / MC #. Row2: CDL class (select) / CDL expiry (date input with inline expiry badge). Insurance carrier (text). Row2: Insurance expiry / Med card expiry (both date inputs with inline expiry badges).

**Expiry badge (per date field):** shows `{N}d left` / `Today` / `Expired {N}d ago` in the field's status color, top-right of the label row. Input border itself also reflects status (warn/err class).

### Tab 4 — Lanes
Helper text: "Up to 3 lanes — matching loads surface first on your board." Exactly 3 fixed rows (Lane 1/2/3), each: Origin state select → arrow → Destination state select. When both filled, show a removable tag pill below (`{origin} → {destination}`, ✕ to clear). **No "add lane" button beyond row 3** — the 3 rows are always rendered, capped by layout not by a counter.

---

## 4. Cross-Tab Chrome

**Credential warning banner** (appears above the tab bar, all tabs, when any of CDL/Insurance/Med is in `warn`/`critical`/`expired` status): `⚠️ {labels} expire{s} soon` + "Review" link that jumps to the Creds tab.

**Completeness bar** (below header, above the warning banner... actually above tab bar per prototype order: header → warning banner → completeness bar → tab bar): thin progress bar + `{pct}% complete` label, color-coded (green 100%, amber ≥70%, red <70%).

**Save button:** header "Save" (text button, turns "✓ Saved" green for 2.5s) AND a full-width bottom-pinned primary CTA "Save Profile" / "✓ Profile Saved" per-tab (both trigger the same save action — matches prototype's dual-save-affordance pattern exactly, do not simplify to one).

---

## 5. Gloved-Hand & Responsive Requirements

| Element | Minimum |
|---|---|
| All tap targets | 56px tall |
| Primary CTA (Save Profile / Yes-Switch) | 64px tall |
| Text inputs / selects | 52px tall |
| Tab bar buttons | 48px tall |
| Body text | 16px |
| Labels | 10–12px |

Primary: iPhone 375–390px. Desktop/tablet optional for this screen (matches Carrier persona mobile-first rule). Real-device verification (sunlight, gloved/simulated) required before sign-off, per `CARRIER_HFD_RULES.md`.

---

## 6. Accessibility

- Contrast: all text/background pairs ≥7:1 (WCAG AAA, carrier persona standard) — verify with WebAIM checker against the hex values in §2.
- Focus states: 2px bronze (`#B08D57`) outline on all interactive elements, matching existing carrier-persona `Input.tsx` focus pattern.
- Expiry status is never color-only: every badge pairs color with text (`{N}d left`, not just a colored dot) — satisfies no-color-only-encoding rule.
- Screen reader: expiry badges announce full text ("CDL expiry, 45 days left"). Equipment-confirm sheet is a modal — must trap focus and be dismissible via Escape/Cancel.
- Keyboard: full Tab-order through all 4 tabs' fields; tab-switching itself must be keyboard-operable (not mouse/touch-only).

---

## 7. Field Contract Table Validation (HFD Gate)

Reviewed against `ARCH_US-730h_Carrier_Identity_Credentials_Profile_Design.md` §3:

- [x] Every UI Field has a non-empty API Param or explicit N/A + justification
- [x] Every API Param has a non-empty DB Column or explicit N/A (expiry badges + completeness % marked N/A — computed, never stored)
- [x] No type mismatches (all VARCHAR/DATE align with UI text/date inputs)
- [x] No duplicate param names
- [x] Lane fields correctly mapped to the *existing* `carrier_lanes` table/endpoints, not a new one — confirmed against ARCH §0 Platform Reuse Check
- [x] All commands in this spec use PowerShell-compatible syntax (N/A — no shell commands in this spec)

**HFD Sign-Off Checkbox:** ✅ I have validated this table for completeness and logical consistency. No gaps found; no escalation to ARCHITECT needed.

---

## 8. Certification

> **I, the Human Factors Designer, certify that:**
> ✅ This mockup has been validated element-by-element against the Master Prototype (`Prototype/ui_kits/carrier/carrier-profile.html`).
> ✅ Touch targets and responsive behavior specified for iPhone 375–390px (primary), per Carrier persona rules.
> ✅ The Field Contract Table has been reviewed and validated for completeness.
> ✅ Zero unauthorized visual drift — no exceptions required (semantic colors already match the design system).
>
> **Status:** READY_FOR_CODER
> **Date:** 2026-07-08
> **HFD Role:** Approved

---

## 9. Handoff to CODER

- Backend: implement per `ARCH_US-730h_Carrier_Identity_Credentials_Profile_Design.md` — additive migration on `users` (10 columns), extend `ProfileResponse`/`UpdateProfileRequest`/`User.java`, new `CdlClass` enum. **No new controller.** Lanes: zero backend changes.
- Frontend: new route `/carrier/profile`, new `CarrierProfilePage` with 4-tab layout (`Identity`/`Equipment`/`Creds`/`Lanes` components), equipment-change confirm sheet, expiry-badge helper (`daysUntil`/`expiryStatus`/`expiryColor`/`expiryLabel` — port 1:1 from prototype), completeness-pill component (reuse pattern from US-730a-v2's `Form Completion` meter if a shared component doesn't already exist). Update Settings entry href from whatever it currently points to, to `/carrier/profile`. Equipment-type change must invalidate the load board query on save (ARCH §5 item 5).
- Testing: Playwright golden path (fill all 4 tabs → save → reload → data persists) with `data-testid` on every input; `boundingBox()` assertion on all new interactive elements per reviewer-checklist §4 touch-target automation rule (sweep at every tab, not just Identity — this is exactly the class of gap CHG-US730-001 found); screenshot evidence in `test-results/evidence/`. Separate test case for the equipment-change confirmation flow and the max-3-lanes UI cap.
- No design changes permitted during CODER phase — escalate any infeasibility to LIBRARIAN via CHG, not back to HFD/ARCH.
