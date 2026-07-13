# US-854: Per-Load Diesel Fuel Cost in Profitability Calculation

**Story ID:** US-854
**Jira:** FREIG-116
**Phase:** Cross (Trucker Load Profitability)
**Status:** DRAFT — AWAITING BA SIGN-OFF (Gate 1)
**Scope:** FULL_STACK
**Priority:** P2

---

## User Story

**As a** Trucker (owner-operator) evaluating whether to claim a load
**I want** the diesel fuel cost used in my profitability estimate to reflect the actual lane the load runs, not just my saved home region
**So that** my GO/NO-GO profitability verdict is accurate for loads that leave my home region, instead of silently over- or under-estimating my real margin

---

## Business Rationale

Diesel prices vary meaningfully by U.S. region, and that variance is persistent, not occasional — a year of historical data shows regional prices differing by an average of ~38 cents/gallon between the East Coast and South regions, and by 90+ cents/gallon across all five U.S. regions, in every single week analyzed.

Today, a Trucker's Cost Profile stores one fixed "home region" that is used for every load's profitability calculation, regardless of where that specific load actually travels. On a long-haul lane (for example, New York City to Tampa, FL), this can misstate the true fuel cost by $60 or more on a single load — enough to flip a load from "profitable" to "not worth it" or vice versa.

**Platform Foundation Mapping:** Load Board → Trucker evaluates load profitability → Trucker claims load. This directly affects the Trucker persona's "evaluate load" step, the point where a bad number causes the most harm (a Trucker accepting a load that actually loses money, or passing on one that was actually fine).

---

## Acceptance Criteria

### AC-1: Load-specific fuel region is used in the profitability calculation
```gherkin
Given a Trucker is viewing the profitability estimate for a specific load
  And that load's origin location is known
When the fuel cost portion of the profitability calculation runs
Then it uses the diesel price for the region the load originates from
  And not simply the Trucker's saved home region (unless they happen to be the same region)
```

### AC-2: Transparency of the fuel price used
```gherkin
Given a Trucker is viewing a load's profitability breakdown
When the fuel cost figure is displayed
Then the Trucker can see which region's diesel price was used
  And the date that price is from
So the Trucker is never guessing whether the number reflects current, real market conditions
```

### AC-3: Fallback when the load's region cannot be resolved
```gherkin
Given a load's origin location cannot be mapped to a known fuel-price region
  (for example, missing or invalid location data)
When the fuel cost is calculated
Then the system falls back to the Trucker's saved home-region price from their Cost Profile
  And clearly indicates to the Trucker that this is an estimate, not lane-specific
```

### AC-4: General Cost Profile summary is unaffected
```gherkin
Given a Trucker is viewing their Cost Profile summary (not a specific load)
When average/typical cost figures are shown
Then the Trucker's saved home-region price is used, since no specific load context exists
```

---

## Field Contract Table

| UI Field | API Param | DB Column | Type | Required |
|---|---|---|---|---|
| Fuel price region used (e.g. "Diesel: East Coast") | *(ARCH fills)* | *(ARCH fills)* | *(ARCH fills)* | Yes |
| Fuel price as-of date (e.g. "as of Jul 6, 2026") | *(ARCH fills)* | *(ARCH fills)* | *(ARCH fills)* | Yes |
| Fallback indicator (shown only when AC-3 applies) | *(ARCH fills)* | *(ARCH fills)* | *(ARCH fills)* | Yes |

---

## Out of Scope (explicitly deferred)

- **Blending fuel cost across multiple regions a long lane crosses** (e.g., weighting by miles driven in each region a load transits). This is a real, valuable future enhancement but is deferred to a follow-up story — origin-region-only is the agreed v1 scope, matching the industry-standard approach used by comparable freight platforms.
- Any change to how a Trucker sets their home region in their Cost Profile.
- Any change to how often diesel price data itself refreshes.
- Any change to the destination-region price (only origin is used in v1 — see follow-up story for destination/multi-region consideration).

---

## Gate 1 Sign-Off

- [ ] User (Michael) has reviewed and approved these Acceptance Criteria
- [ ] Status may be updated to `READY_FOR_DESIGN` only after the box above is checked
