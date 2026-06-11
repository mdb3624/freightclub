
````
# US-820: KPI Summary Display

**Story ID:** US-820  
**Phase:** Phase 10 (Command Center)  
**Status:** READY_FOR_DESIGN  
**Scope:** FULL_STACK  
**Effort:** 3 days
**Priority:** P0

---

## User Story

**As a** Shipper (owner-operator or 3PL dispatcher managing loads)  
**I want to** see my business health metrics (active shipments, on-time %, cost/mile) at a glance on the dashboard  
**So that** I can monitor operational performance and make data-driven decisions about pricing and carrier relationships

---

## Acceptance Criteria

### AC-1: Active Shipments Count
```gherkin
Given a shipper with loads in CLAIMED or IN_TRANSIT status
When they view the KPI Summary card
Then they see a large numeric badge showing the count of active loads
  And the count is accurate (excludes DRAFT, DELIVERED, CANCELED statuses)
  And data isolation is enforced (only the shipper's own loads are counted)
````

### AC-2: On-Time Delivery Rate

Gherkin

```
Given a shipper with completed (DELIVERED) loads
When they view the KPI Summary card
Then they see a percentage badge showing on-time delivery rate
  And the calculation is: (loads_delivered_on_time / total_loads_delivered) * 100
  And the value is rounded to 1 decimal place (e.g., 94.5%)
  And "on-time" is defined as actual delivery time <= scheduled delivery time
  And data isolation is enforced
```

### AC-3: Cost Per Mile

Gherkin

```
Given a shipper with completed (DELIVERED) loads
When they view the KPI Summary card
Then they see a cost/mile metric displaying average cost efficiency
  And the calculation is: Total Cost Base / Total Distance Miles
  And the value is rounded to 2 decimal places (e.g., $2.45)
  And data isolation is enforced
```

### AC-4: Performance

Gherkin

```
Given the KPI Summary is displayed for any shipper
When the dashboard loads
Then the response time is < 2 seconds
  And the displayed data reflects load status updates within 5 minutes.
```

### AC-5: Empty State Handling

Gherkin

```
Given a new shipper with zero active loads and zero completed loads
When they view the KPI Summary
Then they see a friendly empty state message: "No active shipments yet"
  And they see a call-to-action button: "Create Your First Load"
  And the KPI metrics are not displayed.
```

## Field Contract Table

|**UI Field**|**API Param**|**Business Logic Source**|**Type**|**Required**|
|---|---|---|---|---|
|Active Shipments|`activeLoadCount`|Active loads (CLAIMED/IN_TRANSIT)|INTEGER|Yes|
|On-Time %|`onTimePercentage`|Completed loads (on-time vs total)|DECIMAL|Yes|
|Cost/Mile|`costPerMile`|Completed loads (Avg cost/dist)|DECIMAL|Yes|
|CTA Button|N/A|Navigation to Load Creation|N/A|Conditional|

## Platform Foundation Mapping

### Existing Entities

- **Load**: Core entity for status, delivery times, and financial data.
    
- **User/Tenant**: Used to scope data per shipper.
    

### NEW Domain Services

|**Service**|**Purpose**|**Input**|**Output**|
|---|---|---|---|
|**OnTimeRateCalculator**|Calculate shipper on-time delivery percentage|Completed Loads|`onTimePercentage`|
|**CostEfficiencyCalculator**|Calculate average cost per mile|Completed Loads|`costPerMile`|

## BA Sign-Off

- [x] Story ID: US-820
    
- [x] ACs measurable and testable
    
- [x] Business logic defined (What, not How)
    
- [x] Platform Foundation Mapping complete
    
- [x] Scope: FULL_STACK
    

**BA Status:** ✅ **READY_FOR_DESIGN**