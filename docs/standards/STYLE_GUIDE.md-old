# FreightClub Design System & Style Guide

**Version:** 1.0  
**Last Updated:** 2026-05-27  
**Owner:** Human Factors Designer

---

## 🎨 Design Philosophy

The FreightClub platform is designed for **high-stakes logistics operations** with two distinct personas:

1. **Shippers** — Desktop/tablet, high-density data, multi-load orchestration, complex filtering
2. **Owner-Operators (Carriers)** — Mobile-first, high-vibration environments, high-glare outdoor use, large touch targets

All design decisions prioritize:
- **Clarity over aesthetics** — Actions must be obvious
- **Density for shippers, simplicity for operators** — Match cognitive load to persona
- **Accessibility** — WCAG 2.1 AA minimum, dark mode support, keyboard navigation
- **Performance** — Critical paths <2 seconds

---

## 📐 Grid & Spacing

**Base Unit:** 4px (used in multiples)

| Scale | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon spacing, tight grouping |
| sm | 8px | Component padding, button spacing |
| md | 16px | Card padding, section margins |
| lg | 24px | Major section spacing |
| xl | 32px | Page-level margins |
| 2xl | 48px | Full-page section breaks |

### Example Tailwind Mapping
```
p-1  = padding: 4px  (xs)
p-2  = padding: 8px  (sm)
p-4  = padding: 16px (md)
p-6  = padding: 24px (lg)
```

---

## 🎯 Typography

| Element | Font | Size | Weight | Line Height | Usage |
|---------|------|------|--------|-------------|-------|
| H1 | Inter | 32px | 700 (bold) | 1.2 (38px) | Page titles |
| H2 | Inter | 24px | 600 (semibold) | 1.3 (31px) | Section headers |
| H3 | Inter | 18px | 600 (semibold) | 1.4 (25px) | Subsection headers |
| Body | Inter | 16px | 400 (normal) | 1.5 (24px) | Main content, tables |
| Caption | Inter | 14px | 400 (normal) | 1.4 (20px) | Labels, meta info |
| Badge | Inter | 12px | 500 (medium) | 1.4 (17px) | Status pills, tags |
| Code | Courier | 13px | 400 (normal) | 1.6 (21px) | Monospace, IDs |

**Font Stack:** `font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;`

---

## 🎨 Color Palette

### Primary Brand
| Name | Hex | Tailwind | Usage |
|------|-----|----------|-------|
| FreightClub Blue | #4A86E8 | blue-500 | Primary actions, links, focus states |
| Freight Dark | #1C3B7F | blue-900 | Navigation, dark headers |
| Freight Light | #E4E8FF | blue-100 | Backgrounds, hover states |

### Status & Semantic Colors

**Profitability/RPM Coding** (Critical for load board)
| Status | Hex | Tailwind | Meaning | Usage |
|--------|-----|----------|---------|-------|
| High Profit | #16A766 | green-600 | RPM ≥ $1.50/mi | Load cards, badges |
| Neutral | #F2C960 | yellow-400 | RPM $0.80–1.49 | Load cards, badges |
| Low Profit | #EE6155 | red-500 | RPM < $0.80 | Load cards, badges |
| Critical | #8B0000 | red-900 | Urgent alerts, errors | Error messages |

**Functional Status**
| State | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| Success | #4CAF50 | green-500 | Confirmations, checkmarks |
| Warning | #FF9800 | orange-500 | Caution, review needed |
| Info | #2196F3 | blue-500 | Informational messages |
| Error | #F44336 | red-600 | Errors, validation failures |
| Disabled | #CCCCCC | gray-400 | Disabled elements |
| Neutral | #999999 | gray-600 | Secondary text, dividers |

### Neutral Scale
| Name | Hex | Tailwind | Usage |
|------|-----|----------|-------|
| White | #FFFFFF | white | Backgrounds, cards |
| Light Gray | #F5F5F5 | gray-100 | Section backgrounds |
| Medium Gray | #E0E0E0 | gray-300 | Borders, dividers |
| Dark Gray | #666666 | gray-600 | Secondary text |
| Near Black | #333333 | gray-900 | Primary text |

---

## 🧩 Component Library

### Buttons

**Primary Button** (Main actions)
```html
<button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400">
  Primary Action
</button>
```
- Background: Blue-600
- Text: White
- Padding: 8px 16px (p-2 px-4)
- Border-radius: 6px (rounded-md)
- Hover: Darker shade (blue-700)
- Disabled: Gray-400

**Secondary Button** (Less emphasis)
```html
<button class="px-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-md hover:bg-gray-50">
  Secondary Action
</button>
```

**Danger Button** (Delete, destructive)
```html
<button class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
  Delete
</button>
```

**Disabled State**
```html
<button disabled class="px-4 py-2 bg-gray-400 text-gray-600 rounded-md cursor-not-allowed">
  Disabled
</button>
```

### Cards

**Standard Card** (Content containers)
```html
<div class="bg-white rounded-lg shadow p-6 space-y-4">
  <h3 class="text-lg font-semibold">Card Title</h3>
  <p class="text-gray-600">Card content goes here</p>
</div>
```
- Background: White
- Shadow: `shadow` (md)
- Padding: 24px (p-6)
- Border-radius: 8px (rounded-lg)
- Spacing: 16px between items (space-y-4)

**Hover Card** (Interactive)
```html
<div class="bg-white rounded-lg shadow hover:shadow-lg hover:bg-gray-50 transition-all p-6">
```

### Tables

**Table Headers**
```html
<thead class="bg-gray-50 border-b border-gray-300">
  <tr>
    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Column</th>
  </tr>
</thead>
```

**Table Rows**
```html
<tbody class="divide-y divide-gray-200">
  <tr class="hover:bg-gray-50">
    <td class="px-6 py-4 text-sm text-gray-900">Cell</td>
  </tr>
</tbody>
```

**Row Striping:** Alternate gray-50 backgrounds using `:nth-child(even)` for long tables

### Forms

**Input Fields**
```html
<input
  type="text"
  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  placeholder="Placeholder text"
/>
```
- Padding: 8px 12px (px-3 py-2)
- Border: 1px solid gray-300
- Border-radius: 6px (rounded-md)
- Focus ring: 2px blue-500
- Width: 100% (full container)

**Labels**
```html
<label class="block text-sm font-medium text-gray-700 mb-1">Field Label</label>
```

**Text Areas**
```html
<textarea
  rows="3"
  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
></textarea>
```

### Badges & Status Pills

**Status Badge** (Small, inline)
```html
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
  Accepted
</span>
```

**Color variants:**
- Success: `bg-green-100 text-green-800`
- Warning: `bg-yellow-100 text-yellow-800`
- Error: `bg-red-100 text-red-800`
- Neutral: `bg-gray-100 text-gray-800`

### Alerts & Messages

**Alert Box**
```html
<div class="rounded-md bg-red-50 p-4 border border-red-200">
  <h3 class="text-sm font-medium text-red-800">Error Title</h3>
  <p class="text-sm text-red-700 mt-2">Error message details</p>
</div>
```

**Success/Info variants:** Replace `red` with `green`, `blue`, `yellow`

### Pagination

```html
<div class="flex justify-between items-center mt-6 bg-gray-50 px-6 py-4 rounded-lg">
  <button class="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100">Previous</button>
  <span class="text-sm text-gray-600">Page 1 of 5</span>
  <button class="px-3 py-2 border border-gray-300 rounded-md text-sm">Next</button>
</div>
```

---

## ♿ Accessibility Standards

### WCAG 2.1 AA Compliance

**Contrast Ratios:**
- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- All colors must work in high-contrast mode

**Keyboard Navigation:**
- All interactive elements must be keyboard-accessible
- Tab order must be logical (left-to-right, top-to-bottom)
- Focus states must be visible (2px ring-blue-500)

**ARIA Attributes:**
```html
<!-- Buttons -->
<button aria-label="Close dialog">X</button>

<!-- Form fields -->
<input aria-label="Search loads" type="text" />
<label htmlFor="load-id">Load ID</label>
<input id="load-id" type="text" />

<!-- Live regions -->
<div role="status" aria-live="polite" aria-atomic="true">
  Load updated successfully
</div>

<!-- Tables -->
<table role="grid">
  <thead>
    <tr role="row">
      <th scope="col">Column</th>
    </tr>
  </thead>
</table>
```

**Screen Reader Testing:**
- Test with NVDA (Windows) or VoiceOver (Mac)
- Ensure all content is announced
- Verify form labels are associated

---

## 📱 Responsive Design

**Breakpoints:**
| Screen | Tailwind | Min-Width | Typical Usage |
|--------|----------|-----------|---------------|
| Mobile | sm | 640px | Phones, compact layouts |
| Tablet | md | 768px | Tablets, small desktops |
| Desktop | lg | 1024px | Standard desktop |
| Large | xl | 1280px | Wide desktops |

**Shipper Breakpoints:**
- Desktop-first design (assumes desktop primary, tablet secondary)
- Tables hide less important columns on sm/md
- Modals may go full-width on mobile

**Operator Breakpoints:**
- Mobile-first (phone is primary)
- Large touch targets (48px minimum)
- Landscape orientation support

---

## 🌙 Dark Mode Support

**Implementation:** CSS `prefers-color-scheme: dark`

**Color Adjustments:**
```css
@media (prefers-color-scheme: dark) {
  body {
    @apply bg-gray-900 text-white;
  }
  
  .card {
    @apply bg-gray-800 border-gray-700;
  }
}
```

---

## 🎬 Motion & Animations

**Transition Defaults:**
- Duration: 150ms–300ms
- Easing: ease-in-out
- Disable if `prefers-reduced-motion: reduce`

**Common Animations:**
```html
<!-- Hover state fade -->
<div class="transition-all hover:shadow-lg">

<!-- Loading spinner -->
<div class="animate-spin">

<!-- Fade in/out -->
<div class="transition-opacity duration-300">
```

---

## 🔒 Dark Pattern Prevention

**Do NOT:**
- Auto-play videos or sounds
- Infinite scroll without pagination
- Dark patterns in consent forms
- Misleading copy or hidden costs
- Disabled back button

**Do:**
- Explicit confirmations for destructive actions
- Clear pricing and costs
- Easy undo/cancellation
- Transparent data usage

---

## 📝 Iconography

**Icon Library:** Heroicons or Feather Icons (lightweight, simple)

**Icon Sizes:**
- Navigation: 24px
- Inline text: 16px
- Buttons: 20px
- Standalone: 32px

**Colors:**
- Use semantic colors from palette
- Never pure black/white (use gray-900/white)
- Ensure icon contrast meets WCAG AA

---

## 🚀 Performance Budgets

- **Critical CSS:** < 30KB
- **Tailwind build:** < 50KB (purged)
- **Component load time:** < 100ms
- **Time to Interactive (TTI):** < 3 seconds on 4G

---

## 📚 Usage Examples

See `docs/design/examples/` for:
- Load board card with RPM color coding
- Analytics dashboard layout
- Shipper dashboard skeleton
- Mobile operator checkout flow

---

## 🔗 Related Documents

- `docs/roles/HUMAN_FACTORS_DESIGNER.md` — HFD role & responsibilities
- `docs/standards/ui-standards.md` — Frontend technical standards
- `docs/design/phase-7-ui/` — Phase 7 design specs (HFD)

---

**Approval Status:** Pending HFD review and sign-off
