# US-880/881/882/884/885/886 — Super User Frontend: Retroactive HFD Audit

**Artifact:** US-880-886_Super_User_Frontend_Retroactive_HFD_Audit.md
**Version:** 1.0
**Date:** 2026-09-03
**Last Updated:** 2026-09-03
**Sync Status:** ✅ In sync with `ADMIN_DESIGN_SYSTEM.md` (verified 2026-09-03)
**HFD Role:** Retroactive audit (see Background)

---

## Background

This frontend shipped without going through `/run-story`'s HFD phase — CODER implemented directly from the BA story docs, skipping BA Gate 1, ARCH's reuse check, the HFD design phase, the independent REVIEWER agent, and LIBRARIAN sign-off. The user caught two symptoms of this in sequence: the frontend was missing entirely (fixed same day, see `docs/project/Story_Map.md`), then that the whole module had never had a UI design phase at all.

This document is the retroactive remedy for the HFD gap specifically: an audit of the already-shipped UI (`frontend/src/features/admin/SuperUserDashboardPage.tsx`'s Users/Create/Audit tabs and Dashboard tab tenant actions, plus `frontend/src/components/ImpersonationBanner.tsx`) against `docs/roles/ADMIN_HFD_RULES.md` and `docs/standards/ADMIN_DESIGN_SYSTEM.md`'s locked Ops Dark tokens — performed after the fact rather than before CODER, which is itself the process violation being remediated. Going forward, this must not recur (see `feedback_bypassed_run_story_skill` in project memory) — new Admin-surface work should go through `/run-story`'s HFD phase properly, not rely on a retroactive audit like this one.

---

## 1. Reference Mapping

Per `ADMIN_HFD_RULES.md`'s Gate Check: this is Super User ("Ops Dark") track work — no persona inheritance, tokens sourced directly from `ADMIN_DESIGN_SYSTEM.md`.

| Element | Locked Token | Source |
|---|---|---|
| Page/panel background | `#0E1116` | `--admin-bg` |
| Card/table-row surface | `#161B22` | `--admin-surface` |
| Borders | `#2D333B` | `--admin-border` |
| Primary text | `#E6EDF3` | `--admin-text-primary` |
| Secondary/label text | `#8B949E` | `--admin-text-dim` |
| Accent (active tab, CTA) | `#C9A876` | `--admin-accent` |
| Danger/error | `#F85149` | `--admin-danger` |
| Success | `#3FB950` | `--admin-success` |

---

## 2. Fidelity Audit

| Element | Reference Value | Shipped Value | Status |
|---|---|---|---|
| Users/Create/Audit tab backgrounds, borders, text | `S` constant (already defined in `SuperUserDashboardPage.tsx`, sourced from the table above) | Reused `S` constant unchanged | ✅ Verified |
| New buttons (`primaryBtnStyle`/`dangerBtnStyle`/`secondaryBtnStyle`) | `--admin-accent` / `--admin-danger` / `--admin-accent` | Matches | ✅ Verified |
| `ImpersonationBanner` background | `--admin-danger` (`#F85149`) | `#F85149` | ✅ Verified |
| `ImpersonationBanner` text/border color | *(none previously — see Finding 1)* | Was `#1A0000` (ad-hoc, uncited) | ⚠️ **Finding 1 — fixed** |
| Component pattern reuse (tab nav, stat tiles, forced-reason flow) | `SuperUserDashboardPage.tsx`'s existing `DisputesTab`/`HealthTab` patterns | New tabs (Users/Create/Audit) follow the same tab-nav + card + forced-reason-input pattern; no parallel pattern invented | ✅ Verified |

### Finding 1 — Ad-hoc color in `ImpersonationBanner.tsx` (FIXED)

The banner's text/border color was `#1A0000`, invented without a Style Guide citation — a direct violation of `HUMAN_FACTORS_DESIGNER.md`'s Anti-Pattern table ("Custom color hex without Style Guide source"). Contrast against `--admin-danger` happened to pass WCAG AA (5.99:1) by luck, but the value itself was untraceable.

**Fix:** replaced with `--admin-bg` (`#0E1116`), already a locked token, verified at 5.73:1 contrast against `--admin-danger` (still WCAG AA, ≥4.5:1). Cited inline in the component (`ADMIN_DANGER`/`ADMIN_BG` constants with a comment explaining why this component doesn't inherit whichever persona theme it's currently rendered over).

---

## 3. Information Architecture (per `HUMAN_FACTORS_DESIGNER.md` §Information Architecture & Data Entry Efficiency)

### Finding 2 — `CreateUserTab` field order didn't match established convention (FIXED)

Original order: tenant/company → **email** → first name → last name → role → reason. This app's own real registration form (`frontend/src/features/auth/components/RegisterForm.tsx`) establishes company/join-code → **name (first+last)** → email → password as the natural sequence — a person identifies *who* before *how to reach them*. The shipped order inverted that without justification.

**Fix:** reordered to tenant/company → first name → last name → email → role → reason, matching `RegisterForm.tsx`'s established convention (Rule 3: field order follows the user's natural sequence, not implementation convenience).

**Rule 2 (grouping) check:** name (first+last) and email are one contiguous block, uninterrupted by unrelated fields, both before and after the fix — no violation there, only ordering.

**Rule 1 (minimize typing) check:** no field here has a plausible default/autofill/reuse source (a brand-new user's name/email/tenant are all genuinely new information the Super User is relaying from a support ticket or phone call) — no violation.

### Users tab / Audit tab / Dashboard tenant actions

All driven by a target ID entered directly (per `ADMIN_HFD_RULES.md`'s constraint that the Super User dashboard is not a user-browser/search surface — US-750 BR-2) — this is the correct shape given the backend's own API surface (every action keyed by ID, no list/search endpoint exists to browse from). No field-order violation: each action group (Suspend/Reactivate/Force-reset/Activity/Impersonate) is a single ID + single reason field, already minimal.

---

## 4. Accessibility (WCAG AA)

### Finding 3 — New inputs relied on placeholder-only labeling (FIXED)

`HUMAN_FACTORS_DESIGNER.md`'s Accessibility section requires "Form inputs have associated labels." All new `<input>`/`<select>` elements across the Users, Create, and Audit tabs, and the Dashboard tab's tenant reason input, used only a `placeholder` attribute — not a reliable persistent label for assistive tech (placeholder text is not consistently announced and disappears once a value is entered).

**Fix:** added `aria-label` to every new input/select (14 elements) — keeps the existing terse visual style (no layout change) while satisfying the label requirement.

### Finding 4 — `ImpersonationBanner` had no live-region announcement (FIXED)

A banner that appears/disappears dynamically and carries security-relevant state (BR-2: "persistent, unmissable") needs `role="alert"`/`aria-live="assertive"` so screen reader users are actually notified when it mounts, not just sighted users. Added.

### Contrast

- `ImpersonationBanner`: `--admin-bg` on `--admin-danger` = 5.73:1 (AA pass, ≥4.5:1 for normal text). See Finding 1.
- All other new UI reuses the existing `S` constant's colors, already verified compliant in the original US-750/751/752 HFD work (`--admin-text-primary`/`--admin-text-dim` on `--admin-bg`/`--admin-surface`).

### Keyboard navigation

All new interactive elements are native `<input>`/`<select>`/`<button>` — default browser focus/tab order applies, no custom widgets, no keyboard traps introduced.

---

## 5. No-Drift Certification

> **I certify that:**
> ✅ All new UI (Users/Create/Audit tabs, Dashboard tab tenant actions, ImpersonationBanner) sources its colors from `ADMIN_DESIGN_SYSTEM.md`'s locked Ops Dark tokens — the one ad-hoc value found (Finding 1) has been corrected.
> ✅ Existing component patterns (`SuperUserDashboardPage.tsx`'s tab nav, forced-reason flow, card/table styling) were reused, not reinvented, per `ADMIN_HFD_RULES.md`'s Gate Check.
> ✅ Field order in the one multi-field form (`CreateUserTab`) now matches this app's own established convention (Finding 2, fixed).
> ✅ All new form inputs have accessible labels (Finding 3, fixed); the impersonation banner announces itself to assistive tech (Finding 4, fixed).
> ✅ Zero unauthorized visual drift remains as of this audit.
>
> **Status:** READY_FOR_CODER *(retroactive — code already exists; this certifies the audited-and-corrected state, not a pre-implementation gate)*
> **Date:** 2026-09-03

---

## 6. Process Note (for LIBRARIAN / Technical Debt Ledger)

This audit is a remediation, not proof the process worked — the correct sequence (`/run-story`'s BA → ARCH → HFD → CODE) was bypassed for the entire US-880–886 batch. Logged as a debt item: **the independent REVIEWER and LIBRARIAN fresh-context gates were also never run for this batch** and are not remediated by this document (an HFD audit cannot substitute for an independent code/security review). If this module sees further changes, route them through `/run-story` properly rather than adding further retroactive audits.
