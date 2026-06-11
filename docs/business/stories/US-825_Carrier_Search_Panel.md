# US-825: Carrier Search Panel

**Story ID:** US-825  
**Phase:** Phase 10 (Command Center)  
**Status:** READY_FOR_DESIGN  
**Scope:** UI_ONLY  
**Effort:** 2 days  
**Priority:** P1

---

## User Story

**As a** Shipper  
**I want to** search for available carriers by specifying origin and destination locations  
**So that** I can find suitable carriers for my loads directly from the dashboard

---

## Acceptance Criteria

### AC-1: Carrier Search Form
```gherkin
Given the Carrier Search section on the dashboard
When the section is visible
Then I see a form with:
  1. Origin location field (required)
  2. Destination location field (required)
  3. Equipment Type selector (optional)
  4. "Find Carriers" button to submit the search
```

### AC-2: Form Validation
```gherkin
Given the Carrier Search form
When I try to submit without entering origin and destination
Then the form prevents submission
  And error messages tell me which fields are required
```

### AC-3: Search Results
```gherkin
Given I fill in the origin and destination
When I click "Find Carriers"
Then I am shown search results
  And the results display available carriers for that lane
  And I can see carrier information (name, contact, equipment types, ratings)
```

### AC-4: Panel Integration
```gherkin
Given the dashboard renders
When the Carrier Search section displays
Then the form fits naturally in the dashboard layout
  And the section is easy to find and use
```

## Form Fields & Data

| **Field** | **Required** | **Type** | **Purpose** |
|---|---|---|---|
| Origin | Yes | Location (city/state/zip) | Search starting point |
| Destination | Yes | Location (city/state/zip) | Search ending point |
| Equipment Type | No | Enum (Dry Van, Flatbed, etc.) | Filter by equipment capability |

## Data Dependencies

- **Search API:** GET /api/v1/carriers/search (existing, may need extension for location params)
- **Carrier Display:** Results should show carrier name, contact, equipment types, ratings
- **RLS:** Ensure shippers can only see public carrier profiles

## Routes Required

| **Action** | **Route** | **Status** |
|---|---|---|
| Search Results | TBD — route for carrier search results | ❓ To be confirmed by ARCH |

## Dependencies

- **Depends on:** US-823 (provides dashboard grid structure)
- **May depend on:** Backend API extension to support origin/destination search params

## BA Sign-Off

- [x] Story ID: US-825
- [x] ACs describe user value (find carriers by location)
- [x] Form fields and validation rules defined
- [x] Scope: UI_ONLY (backend API extension is separate technical concern)

**BA Status:** ✅ **READY_FOR_DESIGN**
