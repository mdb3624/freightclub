# US-103-v4: Load Templates Feature

**Story ID:** US-103-v4  
**Phase:** Phase 11+ (Backlog)  
**Status:** BACKLOG  
**Scope:** Enhancement to US-103-v2  
**Effort:** 3-4 days  
**Priority:** P2

---

## User Story

**As a** Shipper (high-volume dispatcher with recurring lanes)  
**I want to** save frequently used load profiles as "Templates"  
**So that** I can create new loads from templates in under 30 seconds by just entering new dates

---

## Acceptance Criteria

### AC-1: Save as Template

```gherkin
Given I've filled out a load form with recurring lane details (e.g., "Weekly Produce Run")
When I click "Save as Template"
Then a modal appears asking:
  • Template name (required, e.g., "Weekly Chicago to Detroit Produce")
  • Optional description
  And I can confirm to save

When confirmed
Then the template is saved (not published as a load)
  And I'm returned to the form or dashboard
  And I see confirmation: "Template 'Weekly Chicago to Detroit Produce' saved"
```

### AC-2: Load from Template

```gherkin
Given I'm on the load creation page
When I click "Load from Template"
Then a list of my saved templates appears
  And I can search/filter templates by name
  And I can click a template to select it

When I select a template
Then the form pre-fills with all template details:
  • Origin/Destination addresses
  • Commodity, weight, dimensions
  • Equipment type, pay rate, payment terms
  • Special instructions
  But date/time fields are EMPTY (I must enter new dates)

When I enter new dates and click "Create Load"
Then the load is created and published
```

### AC-3: Manage Templates

```gherkin
Given I have saved templates
When I view my templates list
Then I can:
  • Edit a template (update details)
  • Duplicate a template (create variant)
  • Delete a template
  • Set a template as "default" (pre-loaded when creating new load)
```

---

## Business Value

- Ultra-fast load creation for high-volume dispatchers (< 30 seconds)
- Reduces data entry errors significantly
- Improves productivity for shippers handling 50+ loads/day on 5-10 recurring lanes
- Creates a personalized dispatcher workflow

---

## Data Requirements

**New Database Table: `load_templates`**
- id (UUID, PK)
- tenant_id (FK to tenants)
- name (VARCHAR, required)
- description (TEXT, optional)
- origin_address1, origin_city, origin_state, origin_zip (template data)
- destination_address1, destination_city, destination_state, destination_zip (template data)
- commodity (VARCHAR)
- weight_lbs (DECIMAL)
- length_ft, width_ft, height_ft (DECIMAL, optional)
- equipment_type (ENUM)
- pay_rate (DECIMAL)
- pay_rate_type (ENUM: FLAT_RATE, PER_MILE)
- payment_terms (ENUM)
- special_requirements (TEXT)
- is_default (BOOLEAN)
- created_at (TIMESTAMPTZ)
- deleted_at (TIMESTAMPTZ, soft delete)
- updated_at (TIMESTAMPTZ)

---

## Dependencies

- Depends On: US-103-v2 (Load Creation Redesign), AC-11 (Address Book)
- Blocks: None (enhancement only)
- Related: US-103-v3 (Load Duplication) — both provide speed optimizations

---

## Design Considerations

**For HFD:**
- Template list UI (modal or sidebar?)
- Template edit/delete/duplicate actions
- "Load from Template" button placement on form
- Default template indicator (star icon? bold text?)

**For ARCH:**
- Template CRUD endpoints: GET, POST, PUT, DELETE
- Template selection endpoint
- Data validation (can't save incomplete template?)

---

## BA Status

**Status:** ✅ **BACKLOG**  
**Priority for Phase 11+**  
**Depends on:** User feedback from US-103-v2 MVP (validation that templates are needed)
