# FreightClub Design System — Integration Strategy & Prompt Playbook

## STRATEGY OVERVIEW

Work in 6 phases, smallest blast radius to largest. Each phase is independently verifiable. Never do Phase N+1 until Phase N is tested and committed.

**Golden rule:** Each prompt touches ONE concern. If Claude Code starts touching files outside the scope — stop it, revert, narrow the prompt.

**Before starting any phase:**
```
git checkout -b design-system-phase-N
```
**After each phase:**
```
git add . && git commit -m "Phase N: <description>"
```
If anything breaks the backend integration: `git revert HEAD` — clean slate.

---

## PHASE 1 — Tokens Only
**Risk: Zero. Pure CSS, no component changes.**
**Test: Load the app, verify nothing changed visually.**

### What this does
Imports the design token CSS files so every subsequent phase can reference `var(--color-bronze)` instead of hardcoded hex values.

### Prompt 1A — Add token imports
```
Read the design system at <path-to-design-system>/tokens/. 
Copy these 5 files into frontend/src/styles/tokens/:
  colors.css, typography.css, spacing.css, shadows.css, borders.css

Then add these imports to the TOP of frontend/src/index.css, 
BEFORE the existing @tailwind directives:
  @import './styles/tokens/colors.css';
  @import './styles/tokens/typography.css';
  @import './styles/tokens/spacing.css';
  @import './styles/tokens/shadows.css';
  @import './styles/tokens/borders.css';

Do NOT change anything else in index.css.
Do NOT modify any component files.
Do NOT change tailwind.config.ts.
```

### Prompt 1B — Sync Tailwind config color values
```
Read frontend/src/styles/tokens/colors.css.
Read frontend/tailwind.config.ts.

Update ONLY the color hex values in tailwind.config.ts to match 
the token file exactly. Do not add or remove any keys — only update 
hex values where they differ.

Specific values to verify/update:
  'kinetic-blue':   #2563EB
  'surface-dark':   #0B1220
  'carrier-bg':     #121212
  'carrier-surface': #1A1A1A
  'carrier-border': #2A2A2A
  'carrier-text':   #F5F5F5
  'carrier-accent': #C9A876
  'shipper-bg':     #EFEBE0
  'shipper-surface': #FFFFFF
  'shipper-accent': #B08D57
  success.DEFAULT: #27AE60
  warning.DEFAULT: #F39C12
  error.DEFAULT:   #E74C3C

Do NOT change the structure of tailwind.config.ts.
Do NOT touch any component files.
```

**Verify:** `npm run dev` — app loads, no visual changes, no console errors.

---

## PHASE 2 — Stateless UI Primitives
**Risk: Low. These components have no backend connections, no hooks, no side effects.**
**Test: Visually inspect each component in Storybook or by visiting pages that use them.**

### Prompt 2A — Button component
```
Read the design system at <path>/readme.md (VISUAL FOUNDATIONS section).
Read <path>/ui_kits/shipper/index.html — look at the button styles (search for btn-primary, btn-secondary, btn-danger).
Read frontend/src/components/ui/Button.tsx.

Rewrite Button.tsx to implement 3 visual tiers:

PRIMARY (variant="primary"):
  background: linear-gradient(180deg, #C9A46A 0%, #B08D57 45%, #8C6D3F 100%)
  box-shadow: inset 0 1px 2px rgba(255,255,255,.25), inset 0 -1px 2px rgba(0,0,0,.2), 0 2px 5px rgba(0,0,0,.35)
  border: 1px solid #7A5F3A
  color: #FFFFFF; font-weight: 700

SECONDARY (variant="secondary"):
  background: linear-gradient(180deg, #FAF6EE 0%, #F0E9D8 100%)
  border: 1px solid #C9A876; color: #7A5F3A
  box-shadow: inset 0 1px 0 rgba(255,255,255,.9), 0 1px 3px rgba(0,0,0,.15)

DANGER (variant="danger"):
  background: linear-gradient(180deg, #FEF0EE 0%, #FEE2E2 100%)
  border: 1px solid #E74C3C; color: #B91C1C
  box-shadow: inset 0 1px 0 rgba(255,255,255,.8), 0 1px 3px rgba(231,76,60,.2)

SIZES:
  sm: padding 4px 12px, font-size 12px
  md: padding 8px 16px, font-size 14px (default)
  lg: padding 12px 24px, font-size 16px, min-height 48px

ALL buttons:
  border-radius: 4px (shipper default); 8px when persona="carrier"
  font-family: var(--font-body, Inter)
  transition: all 150ms ease
  active state: transform: translateY(1px)
  disabled: background #D3D3D3, border #CCCCCC, color #888888, cursor not-allowed

Keep the existing ButtonProps interface and isLoading spinner.
Keep usePersonaTheme() hook usage — use it to switch border-radius (4px vs 8px).
Do NOT change the component's export name or props interface structure.
Do NOT touch any other files.
```

### Prompt 2B — Input component
```
Read frontend/src/components/ui/Input.tsx.
Read the design system §6.3 atomic input spec from <path>/readme.md.

Update Input.tsx styling only:
  height: 40px (exactly)
  padding: 8px 12px
  border: 1px solid #D0D0D0
  border-radius: 4px (exactly)
  font-size: 14px; font-family: Inter
  background: #FFFFFF (active), #F8F9FB (disabled)
  
  Focus state:
    border: 2px solid #B08D57
    box-shadow: 0 0 0 3px rgba(176, 141, 87, 0.10)
    outline: none
  
  Error state:
    border: 2px solid #E74C3C
    
  Helper text: font-size 12px, font-style italic, color #636E72, margin-top 4px
  Error text:  font-size 12px, font-style italic, color #E74C3C, margin-top 4px

Do NOT change the component's props interface.
Do NOT change any logic, validation, or event handlers.
Do NOT touch any other files.
```

### Prompt 2C — StatusBadge component
```
Read frontend/src/features/loads/components/StatusBadge.tsx.

Update the color map to match these exact values:
  DRAFT:      bg #F1F5F9, color #475569, border #CBD5E1
  OPEN:       bg #DBEAFE, color #1D4ED8, border #3498DB
  CLAIMED:    bg #FEF3C7, color #B45309, border #F39C12
  IN_TRANSIT: bg #EDE9FE, color #6D28D9, border #7C3AED
  DELIVERED:  bg #DCFCE7, color #15803D, border #27AE60
  SETTLED:    bg #CCFBF1, color #0F766E, border #14B8A6
  CANCELLED:  bg #FEE2E2, color #B91C1C, border #E74C3C

Badge style:
  display: inline-flex, align-items: center, gap: 4px
  padding: 2px 8px, border-radius: 9999px
  font-size: 11px, font-weight: 700
  text-transform: uppercase, letter-spacing: 0.05em
  white-space: nowrap

Keep the same LoadStatus type and component export.
Do NOT change any other files.
```

### Prompt 2D — ProfitabilityBadge component
```
Read frontend/src/features/loads/components/ProfitabilityBadge.tsx.

Update tier styles:
  green tier (rpm >= minRpm * 1.2):
    bg: rgba(34,197,94,.12), color: #15803D, border: 1px solid #22C55E
  yellow tier (rpm >= minRpm):
    bg: rgba(245,158,11,.12), color: #B45309, border: 1px solid #F59E0B
  red tier (rpm < minRpm):
    bg: rgba(239,68,68,.12), color: #B91C1C, border: 1px solid #EF4444
  unknown:
    bg: #F1F5F9, color: #94A3B8, border: 1px solid #CBD5E1

Badge style:
  border-radius: 9999px, padding: 2px 8px
  font-size: 11px, font-weight: 700, white-space: nowrap

Keep the same computation logic (computeRpm, computeMinRpm, computeProfitabilityTier).
Do NOT change any other files.
```

**Verify:** Visit the load board — status badges, profitability badges, buttons, and inputs all look correct. Backend data still loads.

---

## PHASE 3 — Layout Shell
**Risk: Medium. The AppShell wraps every authenticated page. Test thoroughly.**
**Test: Log in as both shipper and carrier. Verify header, nav, and all page content still renders.**

### Prompt 3A — AppShell header
```
Read frontend/src/components/AppShell.tsx.
Read <path>/ui_kits/shipper/index.html — look at the Header component.

Update AppShell header styling:

SHIPPER header (persona !== 'carrier'):
  background: #FFFFFF
  border-bottom: 1px solid #D8CEB8
  height: 64px
  box-shadow: 0 1px 3px rgba(0,0,0,.05)
  Avatar: white bg, 2px solid #B08D57 ring, box-shadow: 0 0 0 2px #B08D57, 0 2px 6px rgba(176,141,87,.4)

CARRIER header (persona === 'carrier'):
  background: #1A1A1A
  border-bottom: 1px solid #2A2A2A
  height: 56px
  Avatar: #B08D57 background, #121212 text

Do NOT change:
  - usePersonaTheme() hook or PersonaThemeContext
  - Navigation links or routing
  - Notification bell logic
  - Profile dropdown logic
  - Any props or exports
```

### Prompt 3B — Remove .legacy-dark system
```
Read frontend/src/index.css.

The .legacy-dark class and all its !important overrides are no longer needed.
The persona-aware theming is now handled by the carrier-* and shipper-* 
CSS custom property tokens.

Remove ONLY the .legacy-dark CSS block and all its child selectors.
Keep: :root variables, .btn-bronze, .fc-shell, .panel, .widget-*, 
      .data-table, .status-badge, @keyframes spin.

Then find all files in frontend/src/ that apply className="legacy-dark" 
or include 'legacy-dark' in className strings.
Remove 'legacy-dark' from those className values only.
Do NOT change anything else in those files.
```

**Verify:** Log in as both personas. Every page renders. No !important warnings in DevTools.

---

## PHASE 4 — Shipper Dashboard Page
**Risk: Medium. Page uses real data from backend hooks.**
**Strategy: Style only — never touch hook calls, query keys, or data transformation.**

### Prompt 4A — Shipper Dashboard KPI cards
```
Read frontend/src/pages/ShipperDashboard.tsx (and any dashboard component files it imports).
Read <path>/ui_kits/shipper/index.html — look at the KPICards component.

Update the 3 KPI cards styling:

ACTIVE SHIPMENTS card:
  - Number color: #1A1A1A (NOT green — active count is neutral, not a success state)
  - Add color-coded breakdown dots below the number:
    Delayed: red dot #E74C3C
    In Transit: purple dot #7C3AED  
    Claimed/Picked Up: amber dot #F39C12

EST. COST/MILE card:
  - Add amber trend badge if cost is rising: background #FEF3C7, border #F39C12, color #B45309
  - Trend indicator text: "↑ +$X.XX" or "↓ -$X.XX"

ON-TIME RATE card:
  - Color: #27AE60 when >= 90%, #F39C12 when >= 75%, #E74C3C below 75%
  - Add a thin progress bar below the number
  - Replace "Hold truckers accountable..." with: "Based on X deliveries · last 30 days"

Card container style (all 3):
  background: #FFFFFF
  border: 1px solid #D0D0D0
  border-radius: 8px
  box-shadow: 0 2px 4px rgba(0,0,0,0.05)
  padding: 24px

Do NOT change: hook calls, data fetching, props passed to cards.
Do NOT change the grid/layout structure.
```

### Prompt 4B — Shipper load table
```
Read the shipper load table component (LoadsTable or similar in frontend/src/).
Read <path>/ui_kits/shipper/index.html — look at the ShipmentTable component.

Update TABLE COLUMN HEADERS — remove design-spec jargon, use plain English:
  Old: "Load ID (Dest)"  → New: "Load" + "Route" (split into 2 cols)
  Old: "Status (Urgency)" → New: "Status"
  Old: "Progress (Recessed Bronze)" → New: "Transit"
  Old: "Counterparty Rating" → New: "Carrier Rating"

Update COLUMN STYLES:
  Header row: font-size 12px, font-weight 600, ALL CAPS, color #636E72, background #F5F0E8
  Data rows: height 48px (exactly), font-size 14px
  Row divider: border-bottom 1px solid #E8E3D8
  Row hover: background #F5F0E8

Update STATUS COLUMN:
  Replace any inline status styling with the <StatusBadge> component

Update TRANSIT COLUMN (progress bar):
  Track: height 7px, background #E8E3D8, border-radius 9999px, width 72px
  Fill: bronze gradient for in-progress, #27AE60 for delivered, #D0D0D0 for cancelled
  Show percentage text next to bar: "35%", "—" for cancelled

Update CARRIER RATING COLUMN:
  Show star rating + numerical score (e.g. "★★★★ 4.1")
  
Add ROW CLICK AFFORDANCE:
  Add a › chevron column (last column, 20px wide)
  On hover: color #B08D57, translateX(2px)
  Selected row: border-left: 3px solid #B08D57, background #FBF5E8

Do NOT: change the data source, sorting logic, pagination, or any onClick handlers.
Do NOT: remove any existing columns — only restyle them.
```

**Verify:** Load the shipper dashboard. Table data still loads from backend. Sorting, pagination work. Click handlers still fire.

---

## PHASE 5 — Carrier Dashboard Page
**Risk: Medium-High. More business logic involved.**
**Strategy: One section at a time. Verify after each prompt.**

### Prompt 5A — Carrier load board filter
```
Read frontend/src/pages/TruckerDashboard.tsx.
Read frontend/src/features/loads/components/LoadBoardTab.tsx (and LoadBoardTable.tsx).

The owner-operator has exactly ONE equipment type, stored in their profile (user.equipmentType).
The load board already filters by equipment type server-side when the filter is passed.

CHANGE 1 — Remove the equipment type filter UI:
  Find the equipment type <select> or filter control in LoadBoardTab.
  Remove it from the rendered JSX.
  The filter object should still pass equipmentType to the API — it just comes from 
  user.equipmentType automatically, not from a UI control.
  
CHANGE 2 — Add an equipment badge above the load list (read-only display):
  Show: "YOUR EQUIPMENT · [user.equipmentType] · Loads matched to your rig"
  Style: background #161616, border 1px solid #2A2A2A, border-radius 8px, padding 8px 10px
  Equipment pill: background rgba(201,168,118,.1), border 1px solid #C9A876, 
                  color #C9A876, border-radius 9999px, font-size 12px, font-weight 700

CHANGE 3 — Update load count label:
  Old: "X open loads" or similar
  New: "X LOADS MATCHING YOUR RIG" (uppercase, color #636E72, font-size 10px)

Do NOT: change the filter object structure passed to useLoadBoard hook.
Do NOT: remove equipmentType from the API query — just stop showing a UI control for it.
Do NOT: touch useLoadBoard, useAvailableStates, or any other hook.
```

### Prompt 5B — Carrier load board lock
```
Read frontend/src/pages/TruckerDashboard.tsx.
Read frontend/src/features/loads/hooks/useMyActiveLoad.ts.

When the OO has an active load (useMyActiveLoad returns a load), 
the load board list should be REPLACED with a locked state view.

Add this conditional rendering:

If hasActiveLoad is true, instead of showing the LoadBoardTab, show:
  1. A lock banner:
     background: rgba(176,141,87,.08)
     border: 1px solid #C9A876
     border-radius: 8px, padding: 10px 14px
     Content: 🔒 "Load board locked" + "Complete your current load to claim another."

  2. The active load card (already shown above as the active load section).
     Keep all existing active load display and action buttons exactly as they are.

Do NOT: change useMyActiveLoad hook.
Do NOT: change the active load section that already shows above the tabs.
Do NOT: change any mutation hooks (useClaimLoad, useMarkPickedUp, etc.).
```

### Prompt 5C — Carrier navigation after state changes
```
Read frontend/src/pages/TruckerDashboard.tsx.
Read frontend/src/features/loads/hooks/useClaimLoad.ts.
Read frontend/src/features/loads/hooks/useMarkPickedUp.ts.
Read frontend/src/features/loads/hooks/useMarkDelivered.ts.

After each successful mutation, navigate the user back to the main dashboard view.

CLAIM LOAD:
  In useClaimLoad (or wherever onSuccess is handled), after the mutation succeeds:
  - Invalidate relevant query keys (already done)
  - Navigate to '/dashboard/trucker' (already the current page, just reset any sub-navigation state)
  - Set active tab back to 'board'

MARK PICKED UP:
  After onSuccess: navigate to '/dashboard/trucker', set tab to 'board'

MARK DELIVERED:
  After onSuccess: navigate to the POD upload screen (keep existing flow)
  
After POD upload completes: navigate to '/dashboard/trucker'

Pattern: every state-changing action should leave the user on the dashboard 
seeing their updated load status — not on a detail sub-page.

Do NOT: change the mutation functions themselves.
Do NOT: change the confirmation dialogs or any UX around them.
Do NOT: change any query invalidation logic.
```

**Verify:** Claim a load — board locks, user lands on dashboard. Mark pickup — lands on dashboard. Mark delivered — POD screen, then dashboard.

---

## PHASE 6 — Load Creation Form
**Risk: Medium. Form has validation and backend submission.**
**Strategy: Style and field changes only — never touch the submit handler or API call.**

### Prompt 6A — Form field updates
```
Read frontend/src/pages/LoadCreatePage.tsx.
Read frontend/src/features/loads/components/LoadForm.tsx.

Make these specific field changes:

1. ESTIMATED DISTANCE — remove as user input:
   Find the distance/miles input field.
   Replace it with a READ-ONLY calculated display.
   The value should be derived from originState + destinationState 
   (use a lookup table or call a distance API if available).
   The backend field name stays the same — just don't show an editable input.
   Style: background #F8F9FB, border 1px solid #E8E3D8, border-radius 4px,
          height 40px, color #1A1A1A, display alongside "calculated" label in #9CA3AF

2. DATE FIELDS — change from date to datetime-local:
   Find all date input fields (pickupFrom, pickupTo, deliverBy/deliverTo).
   Change input type from "date" to "datetime-local".
   
3. PICKUP WINDOW — add latest date:
   If only pickupFrom exists, add pickupTo field alongside it.
   When pickupFrom is set, auto-populate pickupTo with the same value.
   pickupTo must be >= pickupFrom (add validation).
   
4. DELIVERY WINDOW — mirror pickup structure:
   Rename "deliverBy" to "deliverFrom" (or keep name, just add deliverTo).
   Add deliverTo field alongside deliverFrom.
   Auto-populate deliverTo from deliverFrom.
   deliverTo must be >= deliverFrom.

5. DIMENSIONS — add inch fields:
   Find the dimension inputs (length, width, height in feet).
   Add a companion "inches" input next to each foot input.
   Store as separate fields: lengthFt, lengthIn, widthFt, widthIn, heightFt, heightIn.
   (Or combine server-side: total inches = ft*12 + in)

Do NOT: change the form submission handler.
Do NOT: change how the form data is sent to the backend.
Do NOT: change any existing validation rules — only ADD new ones.
Do NOT: change field names that map to the API (check LoadForm types first).
```

**Verify:** Create a load form opens. All fields render. Submit still posts to backend correctly. Check network tab — payload looks right.

---

## PHASE 7 — Action Zone Restructure
**Risk: Low-Medium. Mostly additive/cosmetic.**

### Prompt 7A — Dashboard Action Zone
```
Read frontend/src/pages/ShipperDashboard.tsx (or wherever the shipper dashboard 
action panel lives).

The Action Zone right panel should have these sections:

DEFAULT STATE (no load selected):
  1. Quick Actions header + container (background #FAF6EE, border 1px solid #C9A876, 
     border-radius 10px, bronze gradient header bar labeled "⚡ ACTION ZONE")
  2. Inside: primary "Create New Load" button (full width, bronze gradient, links to /loads/create)
  3. Secondary grid (2 cols): "Get a Quote" · "Find Carriers" (→ /carriers) · "My Documents" · "Payments"
  4. Divider (1px dashed #C9A876)
  5. "PREFERRED CARRIERS" section — list with name, equipment, on-time rate, × remove button
     "Manage →" link navigating to /carriers

LOAD SELECTED STATE (a load row is clicked):
  1. Same Action Zone header, title changes to "LOAD #XXXX"
  2. Load summary card: route, status badge, transit progress bar, equipment
  3. "Find Carriers for This Load →" button (secondary, links to /carriers?origin=X&dest=Y&equip=Z)
  4. Preferred carriers list with "Assign" buttons

REMOVE from the Action Zone:
  - Any carrier search form (dropdowns for origin/dest/equip + search button)
  - These belong on /carriers page only

Do NOT: change the Preferred Carriers data source.
Do NOT: change any existing routing or navigation.
```

---

## PHASE 8 — Persona Token Migration (optional but recommended)
**Risk: Low-Medium. Replaces scattered className strings with CSS custom properties.**
**Result: Every new page/component just uses `var(--p-surface)` — no persona conditionals.**

### What this does
Replaces the `backgroundClassName`, `surfaceClassName`, `actionClassName` strings from
`usePersonaTheme()` with a single `data-persona` attribute on the root element. Components
then read `var(--p-bg)`, `var(--p-surface)`, etc. — one component, two personas, zero
conditional logic.

### Prompt 8A — Wire data-persona to PersonaThemeProvider
```
Read frontend/src/contexts/PersonaThemeContext.tsx (or wherever PersonaThemeProvider lives).

Add a data-persona attribute to the provider's root element:

  <div data-persona={persona} style={{ minHeight: '100vh' }}>
    {children}
  </div>

Where persona is 'shipper' or 'carrier'.

The CSS custom property tokens in tokens/colors.css already define
[data-persona="shipper"] and [data-persona="carrier"] selectors with
all --p-* variables.

Do NOT change the persona detection logic.
Do NOT change usePersonaTheme() yet — we'll deprecate it gradually.
Do NOT change any component files yet.
```

### Prompt 8B — Migrate AppShell to persona tokens
```
Read frontend/src/components/AppShell.tsx.
Read tokens/colors.css — look at the [data-persona] blocks.

Replace persona-specific className strings with inline CSS custom property references:

  backgroundClassName → style={{ background: 'var(--p-bg)' }}
  surfaceClassName    → style={{ background: 'var(--p-surface)' }}

Header:
  background:    var(--p-header-bg)
  border-bottom: 1px solid var(--p-header-border)
  height:        var(--p-header-height)

Avatar ring:
  border-color:  var(--p-avatar-ring)
  background:    var(--p-avatar-bg)
  color:         var(--p-avatar-text)

Keep usePersonaTheme() import for now — only migrate the style values used above.
Do NOT change actionClassName (button styles) yet — that's Phase 8C.
Do NOT change routing, navigation, or layout logic.
```

### Prompt 8C — Migrate Button to persona tokens
```
Read frontend/src/components/ui/Button.tsx.

Replace the usePersonaTheme() actionClassName with direct inline styles using
the bronze gradient (same for both personas):

  primary variant:
    background: linear-gradient(180deg, #C9A46A 0%, #B08D57 45%, #8C6D3F 100%)
    box-shadow: inset 0 1px 2px rgba(255,255,255,.25),
                inset 0 -1px 2px rgba(0,0,0,.2),
                0 2px 5px rgba(0,0,0,.35)
    border: 1px solid #7A5F3A
    color: #FFFFFF
    
  border-radius: use var(--p-header-height) === '56px' to detect carrier 
                 (use 8px radius) vs shipper (use 4px radius).
                 Cleaner: add a 'persona' prop defaulting to 'shipper'.

  secondary variant:
    background:   var(--p-surface)
    border-color: var(--p-btn-secondary-border)
    color:        var(--p-btn-secondary-text)

Remove usePersonaTheme() import from Button.tsx entirely after migration.
Do NOT change ButtonProps interface or any other logic.
```

### Prompt 8D — Deprecate usePersonaTheme className strings
```
Read frontend/src/contexts/PersonaThemeContext.tsx.

The backgroundClassName, surfaceClassName, contentWidthClassName, actionClassName, 
shapeClassName strings are no longer needed after Phases 8A-8C.

Keep the hook and context — just remove the className string properties.
Keep: persona, isCarrier, isShipper — these boolean/string values are still useful 
for conditional logic that CSS can't express.

Then find all usages of backgroundClassName, surfaceClassName, actionClassName, 
shapeClassName in the codebase.
For each usage:
  - backgroundClassName → style={{ background: 'var(--p-bg)' }}
  - surfaceClassName    → style={{ background: 'var(--p-surface)' }}
  - actionClassName     → remove (Button now handles its own styling)
  - shapeClassName      → remove (Button now handles border-radius via persona prop)

Do NOT change any routing, data fetching, or business logic.
```

**Verify:** Both personas render correctly. No missing styles. `usePersonaTheme()` still 
exists and returns `persona`, `isCarrier`, `isShipper` — just no more className strings.

---

**Total with Phase 8:** ~6.5 hours. Phase 8 is optional but pays off on every new page 
you build — no more `const { backgroundClassName } = usePersonaTheme()` boilerplate.


**Shipper:**
- [ ] Log in as shipper — dashboard loads with real data
- [ ] KPI numbers show from backend
- [ ] Load table shows real loads, status badges correct
- [ ] Create load form submits successfully
- [ ] "Find Carriers" navigates to carrier network page
- [ ] Action Zone shows preferred carriers from API

**Carrier:**
- [ ] Log in as trucker — load board shows
- [ ] Loads filtered to user's equipment type automatically
- [ ] Claim a load — board locks, dashboard shows active load
- [ ] Mark as picked up — returns to dashboard, status updated
- [ ] Mark as delivered — POD screen, then dashboard, board unlocks

**Both:**
- [ ] No console errors
- [ ] No !important CSS conflicts
- [ ] All API calls still firing (check Network tab)
- [ ] Auth/JWT still works
- [ ] No TypeScript errors (`npm run build`)

---

## IF SOMETHING BREAKS

**Visual regression (component looks wrong but data loads):**
→ Revert just that component file: `git checkout HEAD -- path/to/Component.tsx`

**Data stops loading (API error):**
→ Check if any hook imports were accidentally changed
→ `git diff HEAD -- frontend/src/features/` — should show zero changes to hooks

**TypeScript errors:**
→ Run `npm run build` before committing each phase
→ Component prop interfaces should not change — only internal styles

**Auth breaks:**
→ Revert Phase 3B (legacy-dark removal) — some pages may rely on className logic
→ Add the persona detection back before removing legacy-dark

---

## ORDER SUMMARY

| Phase | What | Risk | Time |
|---|---|---|---|
| 1A | Import token CSS files | Zero | 5 min |
| 1B | Sync Tailwind color values | Zero | 10 min |
| 2A | Button component styles | Low | 20 min |
| 2B | Input component styles | Low | 15 min |
| 2C | StatusBadge colors | Low | 10 min |
| 2D | ProfitabilityBadge styles | Low | 10 min |
| 3A | AppShell header styles | Medium | 20 min |
| 3B | Remove legacy-dark | Medium | 30 min |
| 4A | Shipper KPI cards | Medium | 20 min |
| 4B | Shipper load table | Medium | 30 min |
| 5A | Carrier equipment filter | Medium | 20 min |
| 5B | Carrier board lock | Med-High | 30 min |
| 5C | Carrier post-action navigation | Med-High | 20 min |
| 6A | Load creation form fields | Medium | 45 min |
| 7A | Action Zone restructure | Low-Med | 30 min |

**Total: ~5 hours of focused Claude Code sessions**
