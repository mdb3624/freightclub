# ⚠️ Edge Case Registry: Resilience Logistics Platform

This document tracks "non-happy-path" scenarios that must be handled by the Domain logic to ensure the integrity of the Resilience platform.

---

## 🏗️ 1. Identity & Compliance (The Foundation)
| Scenario | Business Risk | Requirement/Logic |
| :--- | :--- | :--- |
| **Expired Authority** | A carrier is matched but their FMCSA authority expires before they claim the load. | **Check-at-Claim:** Re-verify USDOT status via API at the exact moment of the "Claim" request. |
| **Re-instated USDOT** | A carrier has a history of multiple authority revocations (Double Brokering indicator). | **Risk Flag:** Trigger a "Manual Review Required" flag if authority was re-instated > 2 times in 12 months. |
| **Tenant Cross-Talk** | A user tries to guess a Load ID belonging to another Tenant. | **RLS Enforcement:** PostgreSQL must return `404 Not Found` (zero leakage), never an `Unauthorized`. |

## 🧠 2. Intelligent Matching (The Brain)
| Scenario | Business Risk | Requirement/Logic |
| :--- | :--- | :--- |
| **The "Close Enough" City** | Load is in McKinney, TX. Carrier is based in Frisco, TX (5 miles away). | **Spatial Buffer:** Use PostGIS `ST_DWithin` with a 50-mile radius rather than strict city name matching. |
| **Equipment Over-capability** | Load requires a Dry Van. A Reefer (refrigerated) truck is available. | **Hierarchy Matching:** Allow specialized equipment to satisfy "General" requirements (Reefer >= Dry Van). |
| **Deadhead vs. Profit** | A high-paying load is 100 miles away. | **Net-Profit Gate:** Only suggest matches where `(Rate - (DeadheadMiles * CPM))` remains positive. |

## 🚛 3. Operations & Tracking (The Execution)
| Scenario | Business Risk | Requirement/Logic |
| :--- | :--- | :--- |
| **GPS Drift/Ghosting** | Carrier turns off location services or enters a mountain tunnel. | **Heartbeat Alert:** Trigger an "Offline" notification if no Geo-fence update is received for > 60 minutes. |
| **Premature Detention** | Carrier arrives early for an appointment and expects detention pay. | **Logic Constraint:** Detention timer (`REQ-401`) only starts at the *later* of: (Arrival Time) OR (Appointment Time). |
| **Multi-Stop Reroute** | Shipper adds a second drop-off after the carrier has already claimed the load. | **State Reset:** Status reverts to `CLAIMED` (re-negotiation required) and triggers a new rate-confirmation. |

## 💰 4. Financials & Documents (The Value)
| Scenario | Business Risk | Requirement/Logic |
| :--- | :--- | :--- |
| **Blurry/Invalid BOL** | Carrier uploads a photo of a receipt instead of the Bill of Lading. | **Human-in-the-Loop:** Move status to `PENDING_VERIFICATION` rather than auto-advancing to `DELIVERED`. |
| **Duplicate Invoicing** | Carrier accidentally triggers the "Paid" event twice due to poor cell service. | **Idempotency Key:** Every financial event must have a unique `request_id` in the Transactional Outbox. |
| **Negative Margin** | Rate adjustments (lumper fees, etc.) exceed the original load profit. | **Manager Override:** Block any adjustment that results in a negative tenant margin without Admin approval. |