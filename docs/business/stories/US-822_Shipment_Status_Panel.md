# US-822: Shipment Status Panel

**Story ID:** US-822  
**Phase:** Phase 10 (Command Center)  
**Status:** ✅ **READY_FOR_DESIGN**  

---

## User Story

**As a** Shipper (operations/dispatch manager)  
**I want to** see a searchable list of all my active shipments with their status, assigned carriers, and progress on the dashboard  
**So that** I can quickly monitor my load portfolio, assess carrier performance, identify shipments needing attention, and access management actions without leaving the dashboard

---

## Shipper Persona Context

**Who:** Operations manager or dispatcher at a shipping company  
**Environment:** Office-based, working at desk/laptop  
**Goals:** 
- Monitor multiple customer shipments in motion
- Identify problems before customers call
- Make decisions about carrier relationships
- Track business metrics (shipments moving, revenue, carrier quality)
- Coordinate with team members

**Usage Pattern:**
- Logs in at start of shift to assess daily operations
- Checks dashboard throughout day to monitor progress
- Searches for specific shipments when issues arise
- Reviews carrier performance to guide future assignments
- May delegate load management to team members

---

## Business Context

Shippers need **operational visibility** into their load portfolio. The dashboard panel should serve as the primary workspace where they can:

1. **See all active shipments at once** — understand current workload
2. **Quickly identify problems** — stuck loads, delayed pickups, carrier issues
3. **Assess carrier performance** — ratings, reliability to inform future assignments
4. **Find specific shipments fast** — search by load ID or destination
5. **Take action immediately** — access management actions without navigating away

---

## Acceptance Criteria

### AC-1: Display Active Shipments List

```gherkin
Given a shipper navigates to the dashboard
When the Shipment Status panel loads
Then I see a list showing all my active shipments
  And each shipment displays: load ID, current status/stage, assigned carrier, carrier rating, equipment type, and destination
  And the list includes all loads not yet delivered or cancelled
  And the list automatically updates when shipment statuses change
```

---

### AC-2: Visually Identify Shipments Needing Attention

```gherkin
Given I'm reviewing the shipment list
When I scan the list
Then I can immediately see which shipments need my attention:
  • Shipments stuck or delayed (visually distinct)
  • Shipments progressing normally (standard appearance)
  • Completed shipments (visually marked as done)
  And this visual distinction helps me prioritize without reading every row
```

---

### AC-3: Search & Filter Shipments

```gherkin
Given I have many active shipments
When I search using the search box (load ID, destination, or carrier name)
Then the list filters to show only matching shipments
  And the search is case-insensitive
  And empty search shows all active shipments
  And I can clear the search and return to full list with one action
```

---

### AC-4: View Carrier Information & Ratings

```gherkin
Given a shipment is assigned to a carrier
When I view the shipment row
Then I see:
  • Carrier company name
  • Carrier rating/score (from shipper reviews)
  And I can assess carrier quality without clicking through
  And this helps me make decisions about future carrier assignments
```

---

### AC-5: Access Quick Actions

```gherkin
Given I'm viewing the shipment list
When I identify a shipment that needs action
Then I can access management actions directly from the dashboard
  And I can view full shipment details or navigate to the full management page
```

---

### AC-6: Monitor Business Metrics

```gherkin
Given I'm on the dashboard
When I review the Shipment Status panel
Then I understand:
  • How many shipments are currently active/moving
  • The distribution across statuses (posted, claimed, in transit, delivered)
  • Which carriers I'm working with and their quality
  And this gives me operational visibility at a glance
```

---

### AC-7: Responsive & Accessible

```gherkin
Given the Shipment Status panel is displayed
When I view it on different devices
Then the list is readable, scannable, and organized
  And column headers are clear
  And rows are properly spaced for readability
  And search box and action buttons are easily accessible
```

---

## UI Elements (For Design)

| Element | Purpose |
|---|---|
| Load/Shipment ID | Identify which shipment |
| Current Status/Stage | Know progression |
| Assigned Carrier Name | Know who's handling it |
| Carrier Rating/Score | Assess carrier quality/reliability |
| Equipment Type | See what type of cargo/truck |
| Destination | Know where it's going |
| Progress Indicator | Visualize how far along |
| Search Box | Find shipments quickly |
| Action Button | Access management options |
| Status Indicators (visual) | Highlight problems/alerts |

---

## BA Sign-Off Checklist

- [x] Story written from shipper (operations manager) perspective
- [x] Value focused on operational visibility + decision-making
- [x] ACs describe user outcomes, not implementation
- [x] Out of scope clear
- [x] Aligned with Command Center goals
- [x] Shipper persona constraints considered (office-based, desktop-primary, monitoring use case)

**BA Status:** ✅ **READY_FOR_DESIGN**  
**Audited:** 2026-06-15 (Renumbered from US-826 to US-822)
