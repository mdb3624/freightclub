# US-103-v2: Load Creation Redesign (Full Workflow + Dashboard Integration)

**Story ID:** US-103-v2  
**Phase:** Phase 10 (Command Center) — Redesign of US-103  
**Status:** READY_FOR_DESIGN  
**Scope:** Full UI/UX redesign + dashboard integration  
**Effort:** 3-5 days  
**Priority:** P1

---

## User Story

**As a** Shipper (operations manager/dispatcher)  
**I want to** create a new load by specifying pickup/delivery locations, dates, payment terms, equipment requirements, cargo dimensions, and special instructions  
**So that** I can quickly post freight to the load board and see it immediately appear on my dashboard for tracking

---

## Shipper Persona Context

**Who:** Operations manager or dispatcher at a shipping company managing 10-50+ loads daily  
**Environment:** Office-based, desktop primary, occasionally mobile for quick checks  
**Goals:**
- Create loads fast (under 2 minutes for repeat shippers)
- Ensure all critical info captured (prevents carrier issues)
- See loads immediately in dashboard (operational visibility)
- Manage multiple loads in parallel workflow

**Pain Points with US-103:**
- Form doesn't match new dashboard design (visual disconnect)
- Created loads don't appear in Shipment Status Panel (no visibility)
- Save functionality fails mid-creation (blocking issue)
- No clear workflow (single-page or wizard?)

---

## Acceptance Criteria

### AC-1: Load Creation Form Access

```gherkin
Given a shipper is viewing the Shipper Dashboard (US-823)
When they click on the Quick Actions "Post Load" button (US-824)
Then the load creation form opens (either modal, slide-out, or new page)
  And the form displays all required sections clearly labeled
  And the form loads empty (no defaults except equipment type = "Dry Van")
  And keyboard focus moves to the first required field
```

### AC-2: Pickup & Delivery Locations

```gherkin
Given the load creation form is open
When the shipper fills in the pickup location
Then they must provide:
  • Street address (required)
  • City (required)
  • State (required, dropdown with all 50 US states)
  • ZIP code (required)
  And optionally:
  • Suite/Unit/Building number

When they fill in the delivery location
Then the same fields apply (required: street, city, state, zip)
  And distance is auto-calculated when both addresses complete
  And the calculated distance displays prominently
  And distance error handling shows if calculation fails
```

### AC-3: Pickup & Delivery Date/Time Windows

```gherkin
Given the locations are filled
When the shipper specifies pickup window
Then they must provide:
  • Earliest Pickup (required, datetime)
  • Latest Pickup (required, datetime, must be ≥ Earliest Pickup)
  
When they specify delivery window
Then they must provide:
  • Earliest Delivery (required, datetime, must be ≥ Latest Pickup)
  • Latest Delivery (required, datetime, must be ≥ Earliest Delivery)
  
And validation prevents impossible date ranges:
  • Latest Pickup cannot be before Earliest Pickup
  • Earliest Delivery cannot be before Latest Pickup
  • Latest Delivery cannot be before Earliest Delivery
```

### AC-4: Cargo Details (Commodity & Dimensions)

```gherkin
Given the dates are set
When the shipper describes the cargo
Then they must provide:
  • Commodity description (required, text input, e.g., "Steel coils", "Electronics", "Produce")
  
And optionally provide dimensions:
  • Length (feet + inches, e.g., "16 ft 6 in")
  • Width (feet + inches, e.g., "8 ft 0 in")
  • Height (feet + inches, e.g., "6 ft 8 in")

And weight (required):
  • Weight in lbs (must be > 0 and < 150,000 lbs)
  • If weight > 80,000 lbs (federal limit):
    - System shows warning: "Exceeds federal weight limit — confirm this load has or will have a special permit"
    - Shipper must check acknowledgment box before submitting
```

### AC-5: Equipment Type & Payment Terms

```gherkin
Given cargo details are entered
When the shipper specifies equipment requirements
Then they select:
  • Equipment Type (required, one of: Dry Van, Flatbed, Reefer, Step Deck)

When they specify payment
Then they must provide:
  • Pay Rate (required, > $0.01)
  • Pay Rate Type (required, one of):
    - Flat Rate (e.g., "$1,500 for the entire load")
    - Per Mile (e.g., "$2.50 per mile")
  
  And system shows estimated total for per-mile loads:
    - If per-mile: display "≈ $X,XXX estimated total" (rate × distance)
    - If flat rate: display "flat rate"

And optionally:
  • Payment Terms (one of: Quick Pay, Net 7, Net 15, Net 30)
    - Quick Pay = same day or next day
    - Net 7/15/30 = days after delivery
```

### AC-6: Special Instructions

```gherkin
Given all cargo/payment fields are complete
When the shipper adds special instructions (optional)
Then they can enter a free-text field with:
  • Max 500 characters
  • Placeholder text: "Any special handling, hazmat requirements, gate hours, contact notes, etc."
  • Examples: "Hazmat class 3", "No forklifts — hand-unload only", "Loading dock hours: 6am-2pm"
```

### AC-7: Form Submission & Publishing

```gherkin
Given the form is completely filled
When the shipper clicks "Create Load"
Then the system:
  • Validates all required fields
  • Shows clear error messages for any validation failures
  • Displays server errors in a banner if submission fails
  • Disables the submit button during submission (shows loading state)
  • Successfully publishes the load to POSTED status

And the shipper sees confirmation:
  • Success message: "Load created successfully"
  • Automatic redirect to dashboard OR inline notification
```

### AC-8: Dashboard Integration (Post-Creation Visibility)

```gherkin
Given a load has been created and published
When the shipper returns to the Shipper Dashboard (US-823)
Then the load immediately appears in the Shipment Status Panel (US-822) showing:
  • Load ID
  • Status (POSTED)
  • Pickup location
  • Delivery location
  • Equipment type
  • Pay rate
  • Current status indicator

And the load remains visible in the panel
  Until a carrier claims it (status → CLAIMED)
  And the shipper can track progress through IN_TRANSIT → DELIVERED
```

### AC-9: Draft Functionality (Optional for Shipper)

```gherkin
Given the shipper is filling out the form
When they want to save without publishing
Then they can click "Save as Draft"
  And the form is saved with incomplete data
  And the draft is stored in "My Drafts" section on the dashboard
  And they can return later to complete and publish the draft
```

### AC-10: Form Validation & Error Handling

```gherkin
Given the form is being filled
When validation errors occur
Then each field shows:
  • Clear error message below the field (red text)
  • Visual indicator (red border on input)
  
And server errors show:
  • Error banner at top of form (not per-field)
  • Clear message: "Unable to create load: [error reason]"
  • "Retry" button to resubmit

And validation prevents:
  • Missing required fields (origin, destination, dates, weight, equipment, pay rate)
  • Invalid date ranges
  • Weight > 150,000 lbs
  • Pay rate = $0
  • Overweight (>80k) without acknowledgment
```

---

## Business Rules

1. **Load Status Workflow:** DRAFT (if saved as draft) → POSTED (when published) → CLAIMED → IN_TRANSIT → DELIVERED
2. **Multi-tenant Isolation:** Shipper can only create/view their own loads (isolated by tenant_id)
3. **Soft Delete:** Cancelled loads marked with `deleted_at` timestamp, not removed from database
4. **Distance Calculation:** Based on geocoding of full addresses (street + city + state + zip)
5. **Weight Limits:** Loads > 80,000 lbs flagged as needing special DOT permit; shipper must acknowledge
6. **Payment Terms Clarity:** Shippers must choose explicit payment terms to set carrier expectations
7. **Carrier Visibility:** Published loads immediately visible on Load Board (US-104) to all truckers matching equipment
8. **Real-Time Dashboard:** Loads created in this session appear in Shipment Status Panel without page refresh

---

## UI Elements (For HFD Design)

| Element | Purpose | Requirement |
|---|---|---|
| Form Title | "Create New Load" | Bold, uppercase, SORA font |
| Address Section | Pickup/Delivery info | Group with visual separator |
| Distance Display | Auto-calculated | Prominent badge or callout box |
| Date/Time Inputs | Schedule window | Datetime-local HTML5 inputs |
| Cargo Description | What's being shipped | Text input with placeholder |
| Dimensions Inputs | Physical constraints | Feet + inches inputs for L/W/H |
| Weight Input | Cargo mass | Number input with "lbs" label |
| Overweight Warning | Regulatory alert | Amber/warning color callout + checkbox |
| Equipment Dropdown | Truck type | Select with 4 options (Van, Flatbed, Reefer, Step Deck) |
| Pay Rate Toggle | Rate type selection | Radio buttons: "Flat Rate" / "Per Mile" |
| Pay Rate Input | Cost value | Currency input with $ prefix |
| Estimated Total | Auto-calc | Shows only for per-mile rates |
| Payment Terms Dropdown | Settlement timing | Select: Quick Pay, Net 7/15/30 |
| Special Instructions | Free-form notes | Textarea (500 char max) |
| Error Messages | Validation feedback | Red text, per-field or banner |
| Submit Button | Create & publish | Primary color, loading state |
| Save Draft Button | Optional save | Secondary button (if AC-9 required) |

---

## Data Dependencies

**Backend Endpoints Required:**
- `POST /api/v1/loads/draft` — Save draft load
- `POST /api/v1/loads` — Create & publish load
- `GET /api/v1/loads/{id}` — Retrieve for editing
- Distance calculation service (Google Maps / MapBox / similar)

**Frontend Integration:**
- Quick Actions button (US-824) routes to this form
- Shipment Status Panel (US-822) queries for new loads
- useCreateLoad hook + useCreateDraft hook

**Database:**
- `loads` table with all fields from form
- `deleted_at` for soft delete
- `tenant_id` for multi-tenancy
- Status enum: DRAFT, POSTED, CLAIMED, IN_TRANSIT, DELIVERED, CANCELLED

---

## Design Reference Deliverables (For HFD/ARCH)

### ARCH Must Provide:
1. Domain model (Load aggregate, value objects)
2. Service layer contract (CreateLoadService API)
3. REST API specification (POST /loads request/response)
4. Validation rules (as business rules, not code)
5. Status transition state machine (Mermaid diagram)

### HFD Must Provide:
1. UI wireframes (mobile + desktop)
2. Form layout (section grouping, responsive grid)
3. Design system compliance (colors, typography, spacing)
4. Error states (per-field + banner)
5. Loading/success states
6. Accessibility checklist (ARIA labels, keyboard nav)

---

## Routes & Navigation

| Action | Route | Status |
|---|---|---|
| New load from dashboard | Dashboard → Quick Actions "Post Load" | ✅ US-824 button exists |
| Load creation page | `/shipper/loads/create` or modal | TBD |
| Edit draft | `/shipper/loads/{id}/edit` | TBD |
| View created load | Redirect to dashboard + highlight in panel | TBD |

---

## Dependencies

- **Depends On:** US-823 (Dashboard scaffold), US-822 (Shipment Status Panel), US-824 (Quick Actions button)
- **Blocks:** Load Board display (US-104), Carrier claiming workflow (US-104)
- **Related:** US-103 (existing implementation), US-505 (invoice generation from loads)

---

## Acceptance Criteria Traceability

| AC | User Value | Measurable Outcome |
|---|---|---|
| AC-1 | Easy access from dashboard | Clicking "Post Load" opens form |
| AC-2 | Accurate location data | Form captures pickup + delivery with 5 fields each |
| AC-3 | Clear scheduling | Date validation prevents impossible windows |
| AC-4 | Cargo visibility | Commodity + dimensions captured |
| AC-5 | Transparent payment | Shipper sets rate + terms; estimated total shown |
| AC-6 | Special handling noted | Free-text field for instructions |
| AC-7 | Successful publishing | Load created + marked POSTED |
| AC-8 | Real-time visibility | Load appears in dashboard Shipment Panel immediately |
| AC-9 | Draft workflow | Optional: save incomplete loads |
| AC-10 | Error recovery | Clear validation feedback + server error handling |

---

## BA Sign-Off Checklist

- [x] Story written from shipper (operations manager) perspective
- [x] Value focused on fast load creation + dashboard visibility
- [x] All ACs describe user outcomes, not implementation details
- [x] Field list matches 20-year trucking logistics expert input
- [x] Dashboard integration requirement included
- [x] Data dependencies & routes documented
- [x] Related to prior US-103 (but full redesign, not patch)
- [x] Out of scope clear (payment processing, carrier matching, settlement)

**BA Status:** ✅ **READY_FOR_ARCHITECT**  
**Authored:** 2026-06-16  
**Expert Input:** 20-year trucking logistics systems expert (shipper operations workflow)
