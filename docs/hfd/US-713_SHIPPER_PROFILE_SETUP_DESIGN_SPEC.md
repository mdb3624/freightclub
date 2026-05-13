# US-713: Shipper Company Profile Setup — Design Spec

**Author:** Human Factors Designer  
**Phase:** Phase 7 (Carrier & User Management)  
**Constraint:** Gate load publishing; minimize friction for shipper onboarding  
**Persona:** Shipper (newly registered) — quick company profile setup before posting first load

---

## Purpose
Shipper Company Profile Setup is a **minimal-friction onboarding flow** that collects essential company information (name, contact, address) required for shippers to publish loads. It gates the "Publish" action at 80% completeness while allowing DRAFT creation to begin immediately.

---

## 1. Information Architecture

### View: Profile Completion Banner (Dashboard)
**Shown on:** Shipper Dashboard, when profile completeness < 80%
**Purpose:** Persistent, dismissible call-to-action to complete profile before publishing loads

#### Layout
- **Type:** Dismissible banner (top of dashboard, above status strip)
- **Content:**
  - Headline: "Complete your company profile to start posting loads"
  - Progress bar: Visual completion % (green fill 0–80%+)
  - Percent text: "X% complete" (e.g., "40% complete")
  - CTA button: "Complete Profile" (kinetic-blue, `md` size)
  - Close button: "×" (top-right; does not persist across sessions — shows again on next login if still incomplete)

#### Color & Style
- Background: warning-subtle (#FEF3C7)
- Text: warning-text (#B45309)
- Progress bar: linear gradient from warning (#F59E0B) to success (#22C55E) as completeness increases
- CTA: kinetic-blue button

---

### View: Profile Setup Form (Dedicated Page)
**Route:** `/profile/company-info`  
**Trigger:** Clicking "Complete Profile" CTA or navigating to Profile menu

#### Layout: Single-Column Vertical Stack (Mobile-First)

##### Section 1: Progress Header
- **Content:** "Company Profile Setup" (headline)
- **Subtext:** "80% complete to publish loads"
- **Progress Indicator:** Horizontal bar showing completeness %; percentage text to right
- **Color Coding:**
  - 0–40%: warning (amber, #F59E0B)
  - 41–79%: warning (amber)
  - 80–100%: success (green, #22C55E)

##### Section 2: Required Fields (Grouped)
- **Headline:** "Required Information" (bold, gray-900)

**Fields (in order):**

1. **Company Name**
   - Label: "Company Name"
   - Placeholder: "e.g., Apex Freight Solutions LLC"
   - Input type: Text
   - Validation: Required, max 120 chars
   - Help text: "Legal company name (visible to truckers)"
   - Max length indicator: "X / 120 characters"

2. **Billing Contact Email**
   - Label: "Billing Email"
   - Placeholder: "billing@company.com"
   - Input type: Email
   - Validation: Required, valid email format
   - Help text: "Used for invoices and payment notifications"

3. **Phone Number**
   - Label: "Phone Number"
   - Placeholder: "(512) 555-0182"
   - Input type: Tel
   - Validation: Required, US phone format (10 digits; auto-format as user types)
   - Help text: "Carriers can call you to confirm details"

4. **Physical Address** (Grouped fields)
   - Label section: "Company Address"
   - **City** (text input)
     - Placeholder: "Austin"
     - Validation: Required, max 100 chars
   - **State** (dropdown or searchable select)
     - Required; pre-populated from profile state if available
     - Validated 2-letter code (AL, AK, AZ, ..., WY)
     - Validation: Required
   - **ZIP Code** (text input)
     - Placeholder: "78701"
     - Validation: Required, 5-digit US ZIP code (auto-format)
     - Help text: "5-digit ZIP code"

##### Section 3: Optional Fields (Collapsible)
- **Headline:** "Optional Information" (gray-700, smaller font)
- **Expand/Collapse:** "Add optional fields" (toggle link; expands section)
- **Subtext:** "These help truckers trust you more, but aren't required."

**Fields (hidden by default, shown when expanded):**

1. **MC Number** (optional)
   - Label: "MC Number"
   - Placeholder: "123456"
   - Input type: Number
   - Validation: 6–8 digits if provided
   - Help text: "Motor Carrier Number (from FMCSA)"

2. **USDOT Number** (optional)
   - Label: "USDOT Number"
   - Placeholder: "12345678"
   - Input type: Number
   - Validation: Up to 8 digits if provided
   - Help text: "USDOT Number (from FMCSA)"

3. **Company Logo** (optional, Phase 7b+)
   - Label: "Company Logo"
   - Input type: File upload (drag-and-drop or file picker)
   - Accepted formats: PNG, JPG, WebP (max 2 MB)
   - Preview: Thumbnail shown after upload
   - Help text: "Logo shown on your shipper profile to truckers"

##### Section 4: Action Buttons (Sticky Footer on Mobile)
- **Button Layout:** Full width on mobile; left-aligned on desktop
- **Save Button:** "Save Company Profile" (primary, kinetic-blue, `lg` size, 44px+ height)
  - Disabled until at least Company Name, Billing Email, Phone, and Address (City/State/ZIP) are filled
  - Shows loading spinner while saving
- **Cancel Button:** "Cancel" (secondary, gray border, `lg` size, left of Save on desktop; below on mobile)
  - Routes back to dashboard without saving

---

## 2. Form Behavior & Validation

### Real-Time Feedback
- **Field validation:** Occurs on blur (not on keystroke to avoid jarring errors)
- **Email validation:** Format check on blur; "Invalid email format" message if invalid
- **Phone formatting:** Auto-format to (XXX) XXX-XXXX as user types
- **ZIP validation:** Auto-format to 5 digits; reject non-numeric input
- **State validation:** Dropdown restricts to valid 2-letter codes

### Completeness Calculation
Triggers on every field save (blur event):
- Company Name: 20 points
- Billing Email: 20 points
- Phone: 15 points
- Address (City + State + ZIP): 25 points
- MC or USDOT: 15 points (either one satisfies; both not required)
- Company Logo: 5 points (optional)

**Display:** Progress bar updates immediately after validation passes on each field

### Save Behavior
- **Save Button:** Disabled until required fields valid
- **On Save:**
  - POST to `/api/v1/profile/company-info` with all form data
  - Show loading spinner (3–5 seconds typical)
  - On success:
    - Toast (green): "Company profile saved!"
    - Navigate back to dashboard
    - Banner completeness % updates
    - If now ≥ 80%, banner CTA changes to "You're ready to post!"
  - On error:
    - Toast (red) with error message
    - Keep form open; user can retry

---

## 3. Mobile Considerations

### Responsive Behavior
- **sm (Mobile):** Full-width form; fields stack vertically; Save/Cancel buttons full-width in sticky footer
- **md (Tablet):** Same as mobile; slight padding increase
- **lg (Desktop):** Form constrained to 600px wide, centered; buttons side-by-side

### Touch Optimization
- All inputs: 44px+ height
- Dropdown (State selector): Touch-friendly; expands full screen on mobile (like native select)
- File upload: Drag-and-drop area (44px minimum height) or tap to open file picker

### Keyboard Navigation
- Tab order: Company Name → Email → Phone → City → State → ZIP → MC → USDOT → Logo (if visible) → Save → Cancel
- Enter: Not trapped; Enter in textarea submits form (if Save not disabled)
- Escape: Closes optional fields section (if expanded)

---

## 4. ARIA & Accessibility

### Screen Reader Announcements
- **Progress section:** `role="region" aria-label="Profile Completeness: X%"` — announce progress on update
- **Form:** `<form role="form" aria-label="Company Profile Setup">` — label the entire form
- **Required fields:** `aria-required="true"` on required inputs
- **Validation errors:** `aria-invalid="true"` + `aria-describedby="field-error"` pointing to error message
- **Progress bar:** `role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" aria-label="Profile 40% complete"` — update on field change
- **Optional section toggle:** `aria-expanded="true|false"` on expand button
- **Submit button:** `aria-disabled="true"` when disabled (if required fields missing)

### Form Labels & Descriptions
- All inputs: `<label for="field-id">` explicitly associated
- Error messages: `<div id="field-error" role="alert">` — announces immediately to screen readers
- Help text: `aria-describedby="field-help"` pointing to `.text-gray-600` help line

---

## 5. State-Aware Design

| Profile Completeness | Banner Display | Publish Gate | CTA Text |
|---|---|---|---|
| 0–79% | Visible, dismissible | ❌ Blocked | "Complete Profile" |
| 80–100% | Hidden or "Ready" state | ✅ Allowed | (Banner hidden) |
| Just saved ≥ 80% | Green success banner | ✅ Allowed | "You're ready to post!" |

---

## 6. Error & Success Feedback

### Success States
- **Save Success:** Toast (green, success color) — "Company profile saved!" + optional "You can now publish loads."
- **Completeness Milestone:** Progress bar turns green; if new completeness ≥ 80%, show additional toast: "You're ready to post loads!"

### Error States
- **Missing Required Field:** Inline error below field (red, error color) — "This field is required"
- **Invalid Email:** Inline error — "Please enter a valid email address"
- **Invalid Phone:** Inline error — "Please enter a valid US phone number"
- **Invalid ZIP:** Inline error — "Please enter a 5-digit ZIP code"
- **Network Error:** Banner (red, error color) — "Unable to save. Check your connection and try again." + Retry button
- **Validation Error from Backend:** Toast (red) — "Unable to save: [server message]"

---

## 7. Integration with Load Publishing

### Pre-Publish Gate (in LoadCreatePage)
**When shipper attempts to Publish a DRAFT load:**
1. Check profile completeness server-side: `GET /api/v1/profile/completeness`
2. If < 80%:
   - Block publish action
   - Show modal: "Complete your company profile before publishing loads"
   - Completeness % shown: "Currently at X% complete"
   - CTA: "Complete Profile Now" (routes to `/profile/company-info`)
   - Dismiss: "Later" (closes modal; returns to DRAFT)
3. If ≥ 80%:
   - Proceed with publish (no gate)

---

## 8. CODER Hand-off Checklist

- [ ] Form renders with all required + optional fields
- [ ] Real-time validation on blur (email format, phone format, ZIP format, required field checks)
- [ ] Progress bar updates reactively as fields are filled; color-codes by completeness (amber < 80%, green ≥ 80%)
- [ ] Save button disabled until required fields pass validation
- [ ] POST to `/api/v1/profile/company-info` with request body: `{ companyName, billingEmail, phoneNumber, city, state, zip, mcNumber, usdotNumber, logoUrl }`
- [ ] Response includes `completeness_pct` (integer 0–100)
- [ ] Toast notifications for success (green) and error (red)
- [ ] Navigate back to dashboard after successful save
- [ ] Update dashboard banner with new completeness %
- [ ] Pre-publish gate: Check completeness before allowing Publish; show modal + CTA if < 80%
- [ ] Form constrained to 600px on desktop; full-width on mobile
- [ ] All inputs: 44px+ height; labels explicit; help text included
- [ ] ARIA labels on progress bar, form, required inputs, error messages
- [ ] Keyboard navigation: Tab order, Enter submits (if enabled), Escape closes optional section
- [ ] Optional section: Expand/collapse toggle with `aria-expanded`
- [ ] File upload: Drag-and-drop + file picker for logo
- [ ] Phone input: Auto-format to (XXX) XXX-XXXX
- [ ] State dropdown: Pre-populated from profile if available; validated 2-letter codes
- [ ] Banner dismissal: Persists for session only (shows again on next login if still incomplete)

---

## 9. Responsive Breakpoint Behavior

| Breakpoint | Layout | Buttons | Optional Fields |
|---|---|---|---|
| **sm** | Full-width, sticky footer | Stack vertically, full-width | Collapsed by default; expand toggle |
| **md** | Full-width, slightly more padding | Stack vertically, full-width | Same as sm |
| **lg** | 600px centered container | Side-by-side (Save, Cancel) | Visible by default or toggle-expand |
