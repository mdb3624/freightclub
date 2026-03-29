# FREIGHTCLUB — EIA Fuel Price API Integration
## User Requirements Document (URD)

---

| Field | Detail |
|---|---|
| **Document ID** | FREIGHTCLUB-URD-EIA-001 |
| **Version** | 1.0 |
| **Date** | March 25, 2026 |
| **Status** | Draft — For Review |
| **Author** | Product Team |
| **Reviewer** | Engineering Lead |
| **System** | FreightClub Trucking Analytics Platform |
| **API Source** | U.S. Energy Information Administration (EIA) Open Data API v2 |

---

## 1. Purpose and Scope

This User Requirements Document defines the functional and non-functional requirements for integrating real-time and weekly diesel fuel price data from the U.S. Energy Information Administration (EIA) Open Data API (v2) into the FreightClub trucking analytics platform.

The EIA integration will power the live market ticker displayed at the top of every screen in FreightClub, specifically supplying the following two data fields:

- **Diesel West** — national average on-highway diesel price for the West Coast region
- **Diesel South** — national average on-highway diesel price for the South region

Fuel cost is a primary variable in trucking profitability. Having accurate, up-to-date regional diesel prices directly within the platform eliminates the need for drivers and owner-operators to consult external sources before making load acceptance decisions.

---

## 2. Stakeholders

| Stakeholder | Role | Interest in Integration |
|---|---|---|
| Owner-Operators / Drivers | Primary end user | Accurate fuel cost in real time for profitability calculations |
| Product Team | Requirements owner | Delivering reliable market data with minimal maintenance overhead |
| Engineering Team | Implementation owner | Clean, rate-limited, cacheable API integration |
| EIA (External) | Data provider | Public data made accessible per Terms of Service |

---

## 3. Background and Context

### 3.1 The EIA API

The U.S. Energy Information Administration (EIA) is a federal agency that publishes energy data including weekly retail diesel and gasoline prices by region. The EIA Open Data API v2 provides free, machine-readable access to this dataset under a public domain license. Registration is required to obtain an API key, but the service carries no subscription cost.

Key characteristics of the EIA diesel price data:

- Updated weekly, every Monday (data reflects the previous week)
- Regional breakdowns align to EIA Petroleum Administration for Defense Districts (PADDs)
- Available in JSON format via REST endpoint
- Requires a free API key obtained at [eia.gov/developer](https://www.eia.gov/developer/)

### 3.2 Relevant EIA Endpoint

The relevant EIA v2 endpoint for on-highway diesel prices by region is:

```
https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key={KEY}&frequency=weekly&data[0]=value&facets[product][]=EPD2D&facets[duoarea][]=R50&facets[duoarea][]=R4&sort[0][column]=period&sort[0][direction]=desc&length=2
```

The `duoarea` facet codes map to:

| Code | Region |
|---|---|
| R1X | New England, Central Atlantic, Lower Atlantic |
| R3 | Midwest |
| R4 | Gulf Coast (South) |
| R5 | Rocky Mountain |
| R50 | West Coast (West) |

For FreightClub's ticker, the two primary target regions are **R4 (South)** and **R50 (West Coast)**.

---

## 4. User Stories

| ID | As a... | I want to... | So that... |
|---|---|---|---|
| US-EIA-01 | Driver / owner-operator | See the current diesel price for my region in the ticker bar | I can factor accurate fuel cost into my load decision without leaving the app |
| US-EIA-02 | Driver | See West and South diesel prices separately | I know what fuel will cost depending on where my lane takes me |
| US-EIA-03 | Driver | See how diesel price compares to last week | I can tell if fuel costs are rising or falling and plan accordingly |
| US-EIA-04 | Driver | Trust the data is current | I don't make load decisions based on stale or incorrect fuel prices |
| US-EIA-05 | Product team | Monitor API health and receive alerts if the feed fails | The ticker never shows outdated data silently |

---

## 5. Functional Requirements

### 5.1 Data Retrieval

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| FR-01 | The system shall retrieve on-highway diesel prices for the West Coast (R50) and South/Gulf Coast (R4) PADD regions from the EIA v2 API on application startup. | Must Have | Ticker shows both price values within 3 seconds of app load |
| FR-02 | The system shall refresh diesel price data on a scheduled basis not less frequently than once every 24 hours. | Must Have | Data timestamp is visible; values do not grow stale beyond 24hrs |
| FR-03 | The system shall display the most recently available EIA weekly price even when the API has not yet published the current week's update. | Must Have | No blank or zero values appear in the ticker at any time |
| FR-04 | The system shall display the EIA data period (e.g. "Week of Mar 17") alongside each diesel price in a tooltip or secondary label. | Should Have | Hovering or tapping the diesel price shows the reporting week |
| FR-05 | The system shall display a week-over-week price change indicator (e.g. +$0.08) alongside each price value. | Should Have | Change delta is shown with up/down directional indicator |

### 5.2 Ticker Display

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| FR-06 | The system shall display diesel prices in the format: `DIESEL WEST: $X.XX/gal` and `DIESEL SOUTH: $X.XX/gal` in the market live ticker bar. | Must Have | Text matches format shown in FreightClub design spec |
| FR-07 | The diesel price values in the ticker shall be displayed in USD per gallon, rounded to two decimal places. | Must Have | Value shown as `$3.72` not `$3.7215` |
| FR-08 | Rising prices shall be visually distinguished from falling prices using color (e.g. red for rise, green for fall) consistent with FreightClub's existing design system. | Should Have | Color coding renders correctly in both light and dark mode |
| FR-09 | The ticker shall continue displaying the last known diesel prices during temporary API unavailability, with a visual indicator that the data may be stale. | Must Have | Stale indicator appears if data is older than 48 hours |

### 5.3 Load Profitability Analyzer Integration

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| FR-10 | The system shall auto-populate the Fuel Surcharge field in the Load Profitability Analyzer with a calculated value based on the current EIA diesel price and the loaded miles entered by the user. | Should Have | Fuel surcharge auto-fills when miles are entered; user can override |
| FR-11 | The system shall expose the current diesel price via an internal data store so that the CPM Calculator can reference it when computing fuel cost per mile. | Should Have | CPM Calculator does not re-fetch separately; uses shared data store |

---

## 6. Non-Functional Requirements

### 6.1 Performance

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| NFR-01 | EIA API calls shall complete within 3,000ms under normal network conditions. Requests exceeding this threshold shall time out and fall back to cached data. | Must Have | Timeout measured from request initiation to response received |
| NFR-02 | Diesel price data shall be cached locally (server-side or client-side) with a minimum TTL of 6 hours to reduce unnecessary API calls. | Must Have | API call count per day does not exceed 10 per user session |
| NFR-03 | The ticker shall not block or delay page render. Diesel price data shall load asynchronously after the initial page paint. | Must Have | Core layout visible within 1s; ticker populates within 3s |

### 6.2 Reliability and Error Handling

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| NFR-04 | The system shall implement exponential backoff retry logic for failed EIA API requests, with a maximum of 3 retry attempts. | Must Have | 3 retries observed in logs before fallback to cached data |
| NFR-05 | If the EIA API is unavailable and no cached data exists, the system shall display `DIESEL WEST: --` and `DIESEL SOUTH: --` rather than showing an error or blank field. | Must Have | Graceful degradation confirmed via API mock test |
| NFR-06 | API errors shall be logged with full request context (endpoint, response code, timestamp) for diagnostic purposes. | Must Have | Error log entry visible in monitoring system within 60s |

### 6.3 Security

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| NFR-07 | The EIA API key shall never be exposed in client-side JavaScript, browser network requests, or source control. It shall be stored as a server-side environment variable only. | Must Have | Key not present in browser DevTools network tab |
| NFR-08 | All calls to the EIA API shall be proxied through FreightClub's backend server. No direct client-to-EIA API communication is permitted. | Must Have | Network inspection shows requests originating from server IP |
| NFR-09 | The system shall validate EIA API responses before use, rejecting any response that does not conform to the expected schema. | Must Have | Malformed response triggers fallback; does not crash app |

### 6.4 Compliance and Terms of Service

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| NFR-10 | The integration shall comply with EIA API Terms of Service, including attribution. The data source shall be credited as "Data: U.S. EIA" in the app's data sources or about section. | Must Have | Attribution text present in app |
| NFR-11 | The system shall not store or redistribute raw EIA API responses beyond the caching TTL defined in NFR-02. | Must Have | No long-term EIA data storage in database |

---

## 7. EIA Data Field Mapping

| EIA Field | EIA Code / Value | FreightClub Display Element | Format |
|---|---|---|---|
| Product | EPD2D (On-Highway Diesel) | Both ticker fields | Filter only |
| duoarea (West) | R50 — West Coast | `DIESEL WEST: $X.XX/gal` | $/gal, 2 decimal |
| duoarea (South) | R4 — Gulf Coast | `DIESEL SOUTH: $X.XX/gal` | $/gal, 2 decimal |
| period | YYYY-MM-DD (week start) | Tooltip: "Week of [date]" | Human-readable date |
| value | Numeric price in USD | Price display | Float → $X.XX |
| Previous value | Derived (prior week fetch) | Change indicator +/- | Delta in $0.00 |

---

## 8. API Call Specification

### 8.1 Endpoint

```
https://api.eia.gov/v2/petroleum/pri/gnd/data/
```

### 8.2 Required Query Parameters

| Parameter | Value | Purpose |
|---|---|---|
| `api_key` | `{EIA_API_KEY}` | Authentication — server-side env variable |
| `frequency` | `weekly` | Return weekly price observations |
| `data[0]` | `value` | Include the price value field in response |
| `facets[product][]` | `EPD2D` | Filter to on-highway diesel only |
| `facets[duoarea][]` | `R50` | West Coast region price |
| `facets[duoarea][]` | `R4` | Gulf Coast / South region price |
| `sort[0][column]` | `period` | Sort by date |
| `sort[0][direction]` | `desc` | Most recent first |
| `length` | `2` | Return 2 records (current + prior week for delta) |

### 8.3 Expected Response Structure

```json
{
  "response": {
    "data": [
      {
        "period": "2026-03-17",
        "duoarea": "R50",
        "value": "4.21",
        "product": "EPD2D"
      },
      {
        "period": "2026-03-17",
        "duoarea": "R4",
        "value": "3.72",
        "product": "EPD2D"
      }
    ]
  }
}
```

---

## 9. Out of Scope

The following are explicitly excluded from this requirement document:

- Gasoline prices (only diesel is in scope)
- Historical price trend charts or graphs within FreightClub
- Price alerts or push notifications when diesel crosses a threshold
- Integration with any EIA dataset other than EPD2D on-highway diesel by PADD region
- Real-time (intra-day) diesel price data — EIA only publishes weekly; real-time fuel prices require a separate commercial data vendor

---

## 10. Assumptions and Dependencies

- The FreightClub backend has a Node.js or equivalent server layer capable of making outbound HTTP requests and storing environment variables securely.
- An EIA API key has been registered at [eia.gov/developer](https://www.eia.gov/developer/) prior to development start.
- The EIA API maintains its current free and open access policy for the duration of the product roadmap.
- EIA's weekly diesel update cadence (Mondays) remains unchanged.
- The FreightClub design system supports the color-coded directional indicators required by FR-08.

---

## 11. Overall Acceptance Criteria

The EIA API integration will be considered complete and accepted when all of the following conditions are verified:

- The ticker displays accurate `DIESEL WEST` and `DIESEL SOUTH` values within 3 seconds of app load on a standard broadband connection
  - Values match the most recent EIA weekly publication
- Diesel prices update automatically without user action at least once every 24 hours
- API key is not exposed in any client-side request or version-controlled file
- Graceful fallback displays `--` values (not errors or blanks) when EIA API is unreachable
- Week-over-week delta indicator is displayed and directionally correct (tested against two consecutive EIA publications)
- EIA attribution is present in the app's data sources section
- Load test confirms caching prevents more than 10 EIA API calls per user session per day

---

## 12. Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | Mar 25, 2026 | Product Team | Initial draft |
