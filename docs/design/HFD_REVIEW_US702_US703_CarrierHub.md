# HFD Review: US-702 / US-703 — Lanes & Availability UI
**Role:** Human Factors Designer
**Date:** 2026-05-07
**Scope:** LanesTab, LaneCard, LaneModal, AvailabilityTab
**Standard:** docs/standards/brand_assets/STYLE_GUIDE.md (AxleStack brand), mobile-first / high-glare operator environment

---

## Verdict: CONDITIONAL PASS

Functional and broadly mobile-compliant. Three critical HFE issues require remediation before production. Four minor issues flagged as improvement backlog.

---

## Critical Issues (Must Fix Before Go-Live)

### HFE-1: Hardcoded Status Text in AvailabilityTab (Safety Risk)
**File:** `AvailabilityTab.tsx:69`
**Issue:** The "Current Status" card always renders:
```
● Currently on load
  Update your status below
```
This text is **hardcoded** and does not reflect `availability.currentlyOnLoad`. A trucker who is NOT on a load sees incorrect status. In a high-stress dispatch environment this is a direct safety/operational error — a trucker may believe they are marked unavailable when they are not.

**Fix:**
```tsx
// Replace hardcoded text with data-driven status
const isOnLoad = availability?.currentlyOnLoad ?? false;

<div className="w-3 h-3 rounded-full animate-pulse"
     style={{ backgroundColor: isOnLoad ? '#EF4444' : '#00E5A8' }}
     aria-hidden="true" />
<div className="flex-1">
  <p className="text-white font-medium">
    {isOnLoad ? 'Currently on a load' : 'Available for loads'}
  </p>
  <p className="text-slate-400 text-sm">
    {isOnLoad ? 'You are marked unavailable for new loads' : 'You will appear in load matching'}
  </p>
</div>
```
Use Error red (`#EF4444`) when on load, Accent Teal (`#00E5A8`) when available — per brand semantic tokens.

---

### HFE-2: Destructive Button Proximity on LaneCard (Fat-Finger Risk)
**File:** `LaneCard.tsx:54–69`
**Issue:** Edit and Delete buttons are side-by-side at equal `flex-1` width. On a mobile screen in a truck cab, the delete button is a single mis-tap away from the edit button. There is a confirmation dialog, but the proximity introduces unnecessary error risk per Hick's Law.

**Fix:** Demote Delete to a secondary action — either an icon-only button or placed behind a `⋮` overflow menu:
```tsx
{/* Primary action - full width */}
<button onClick={() => onEdit(lane)}
  className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm font-medium"
  aria-label={`Edit lane from ${lane.originRegion} to ${lane.destinationRegion}`}>
  Edit
</button>
{/* Destructive action - icon only, reduced visual weight */}
<button onClick={() => setShowConfirm(true)}
  className="px-3 py-2 text-slate-500 hover:text-red-400 rounded transition-colors"
  aria-label={`Delete lane from ${lane.originRegion} to ${lane.destinationRegion}`}>
  🗑
</button>
```

---

### HFE-3: Raw ENUM Labels Displayed to Operators
**Files:** `LaneCard.tsx:30`, `LaneModal.tsx:104–109, 127–132`
**Issue:** Region names render as `NORTHEAST`, `SOUTHEAST`, `CALIFORNIA` (all-caps enum values). Frequency renders as `weekly loads` (lowercase enum). Under high-glare or small screen, all-caps scanning is 15–30% slower than title case.

**Fix:** Add a display formatter — do not show raw enum values to users:
```tsx
const formatRegion = (r: string) =>
  r.charAt(0) + r.slice(1).toLowerCase().replace(/_/g, ' ');

const formatFrequency = (f: string) =>
  f === 'ANY' ? 'Any frequency' : `${f.charAt(0) + f.slice(1).toLowerCase()} loads`;
```
Apply in both `LaneCard` display and `LaneModal` `<option>` labels.

---

## Minor Issues (Improvement Backlog)

### HFE-4: Status Badge Uses `green-500` Not Brand Token
**File:** `LaneCard.tsx:44–48`
Active status uses `bg-green-900/30 text-green-300`. Brand token for success is `#22C55E` (Success) and active indicator is `#00E5A8` (Accent Teal). Use `text-[#00E5A8]` for ACTIVE lane status to align with Style Guide.

---

### HFE-5: No "Last Updated" Timestamp on Availability
**File:** `AvailabilityTab.tsx`
`CarrierAvailabilityDTO.lastUpdatedAt` is available but not displayed. Operators returning to the screen have no confirmation their last save was recorded. Add below the submit button:
```tsx
{availability?.lastUpdatedAt && (
  <p className="text-slate-500 text-xs text-center">
    Last updated {new Date(availability.lastUpdatedAt).toLocaleDateString()}
  </p>
)}
```

---

### HFE-6: Two-Column Time Grid Cramped on Narrow Mobile
**File:** `AvailabilityTab.tsx:114`
`grid-cols-2` on screens < 360px (common on older Android devices) compresses the time inputs. Change to `grid-cols-1 sm:grid-cols-2`.

---

### HFE-7: Modal Close Button Touch Target Undersized
**File:** `LaneModal.tsx:83–88`
The `×` close button has no explicit `w-` / `h-` sizing. Replace with a properly-sized Lucide icon:
```tsx
import { X } from 'lucide-react';
<button onClick={onClose}
  className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"
  aria-label="Close modal">
  <X size={20} />
</button>
```

---

## Style Guide Compliance

| Token | Required | Actual | Status |
|---|---|---|---|
| Primary background | Deep Space Navy `#0B1220` | `bg-slate-900` (≈ `#0F172A`) | ✅ Close |
| Card background | Steel Grey `#1E293B` | `bg-slate-800` (`#1E293B`) | ✅ Exact |
| Primary action | Kinetic Blue `#2563EB` | `bg-blue-600` (`#2563EB`) | ✅ Exact |
| Success / Active | Accent Teal `#00E5A8` | `text-green-300` | ⚠️ Off-brand |
| Error | `#EF4444` | `text-red-500` (`#EF4444`) | ✅ Exact |
| Touch targets | ≥ 44px | `h-12` = 48px | ✅ |
| ARIA labels | Required on all interactive elements | Present on major actions | ✅ |

---

## Coder Hand-Off Specification

Priority order for Coder:

| # | File | Change | AC |
|---|---|---|---|
| 1 | `AvailabilityTab.tsx` | Fix status card to use `availability.currentlyOnLoad` with correct color tokens | HFE-1 |
| 2 | `LaneCard.tsx` | Demote Delete to icon-only button | HFE-2 |
| 3 | `LaneCard.tsx` + `LaneModal.tsx` | Add `formatRegion()` and `formatFrequency()` display helpers | HFE-3 |
| 4 | `LaneCard.tsx` | Status badge color → Accent Teal `#00E5A8` | HFE-4 |
| 5 | `AvailabilityTab.tsx` | Add last-updated timestamp | HFE-5 |
| 6 | `AvailabilityTab.tsx` | `grid-cols-1 sm:grid-cols-2` for time inputs | HFE-6 |
| 7 | `LaneModal.tsx` | `w-10 h-10` close button with Lucide `X` | HFE-7 |

---

**[HFD]: Audit complete — 3 critical, 4 minor issues identified. CONDITIONAL PASS pending HFE-1/2/3 remediation.**
**Signed by:** Human Factors Designer
**Date:** 2026-05-07
