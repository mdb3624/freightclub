# User Stories — Phase 1.1: UX Hardening

## State Field Validation

- **As a shipper**, I want origin and destination state fields to be validated dropdowns so that I can only enter a valid 2-letter state code and my loads are never invisible to truckers filtering by state.
- **As a trucker**, I want load board state filters to match exactly against stored state codes so that filtering by "IL" always returns every load departing from Illinois.

## Cancellation Safety

- **As a shipper**, I want a confirmation dialog to appear before I cancel a live load so that I cannot accidentally cancel freight that a trucker is counting on.

## Hours of Service — Regulatory Compliance

- **As a trucker**, I want the HOS widget to track my cumulative on-duty hours across a rolling 8-day window so that I can stay compliant with the FMCSA 70-hour/8-day rule in addition to per-shift limits.
- **As a trucker**, I want the HOS widget to prompt me to enter my shift start time before the bars activate so that the display is never misleadingly empty at the start of a day.
- **As a trucker**, I want HOS warnings at both 4 hours and 2 hours remaining so that I have enough time to plan a stop before hitting a legal limit.

## Load Form UX

- **As a shipper**, I want address fields ordered as street → city → state → zip so that the form matches US postal convention and I don't enter information out of order.
- **As a shipper**, I want the load form to validate that "Latest Pickup" is after "Earliest Pickup", "Earliest Delivery" is after "Latest Pickup", and "Latest Delivery" is after "Earliest Delivery" so that I cannot post a load with an impossible time window.
- **As a shipper**, I want pickup and delivery time fields labeled "Earliest Pickup", "Latest Pickup", "Earliest Delivery", and "Latest Delivery" so that the labels clearly describe time windows rather than locations.
- **As a shipper**, I want to see a contextual hint "Legal max: 80,000 lbs" next to the weight field so that I'm prompted to check compliance before posting an overweight load.

## Load Board UX (Trucker)

- **As a trucker**, I want my load board filter state to be stored in the URL so that navigating to a load detail page and pressing back returns me to exactly the filtered view I left.
- **As a trucker**, I want to unlock and change the equipment type filter even when my profile has a default type set so that I can browse loads for other trailer types I can haul.
- **As a trucker**, I want to see a clear inline message when the load board is grayed out explaining that I have an active load so that I understand why I can't claim and what I need to do.
- **As a trucker**, I want RPM values displayed to 2 decimal places instead of 4 so that the numbers are easier to read and compare.

## Load Detail UX (Trucker)

- **As a trucker**, I want the profitability breakdown to remain visible on the load detail page after I claim a load so that I can reference the financials during execution.
- **As a trucker**, I want to receive a success toast notification after claiming a load so that I have clear confirmation the claim went through.

## Shipper Dashboard UX

- **As a shipper**, I want a status summary strip above the loads table showing counts of loads by status (open, claimed, in transit, delivered) so that I can assess my workload at a glance without scanning the full table.

## Cost Profile Discoverability (Trucker)

- **As a trucker**, I want a prominent call-to-action to set up my cost profile when none is configured so that I know why RPM badges and profitability cards are empty and how to fix it.

## Database Hardening

- **As the platform**, I want origin and destination state columns constrained to `CHAR(2)` with a `CHECK` constraint so that no free-text state values can enter the database and corrupt load board filters.
- **As the platform**, I want a `claims` table so that every claim event is recorded and available for future ratings, cancellation notifications, and bidding features.
- **As the platform**, I want a `load_events` table stub so that Phase 2 can write status transition events to a structured log.
- **As the platform**, I want load board query indexes on `(tenant_id, equipment_type, status)`, `(tenant_id, origin_state)`, `(tenant_id, pickup_from, status)`, and `(trucker_id, status)` so that load board queries remain fast as the dataset grows.
