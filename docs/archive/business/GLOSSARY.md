# 📖 Domain Glossary: Resilience Logistics Platform

This document defines the core terminology used across Requirements, User Stories, and Code. Consistent use of these terms is mandatory for all Domain logic.

---

## 🚛 1. Logistics Operations
* **Accessorials:** Supplemental services provided by the carrier (e.g., tarping, lumper fees, extra stops) that incur additional charges.
* **Backhaul:** A return trip moving cargo back toward the carrier's primary home base.
* **Deadhead:** Miles driven with an empty trailer, typically to reach a pick-up location.
* **Detention:** Compensation paid to a carrier when they are delayed at a shipper or receiver facility beyond a standard "free time" (typically 2 hours).
* **Dry Van:** A standard, enclosed non-refrigerated trailer used for general freight.
* **ELROD (Estimated Load Return on Dispatch):** A platform-specific metric calculating the net profitability of a match before acceptance.
* **Lane:** A specific geographic route frequently traveled (e.g., "The Dallas-to-Atlanta Lane").
* **Lumper:** A third-party worker hired to load or unload a trailer at a warehouse.
* **Reefer:** A refrigerated trailer used for temperature-sensitive cargo.
* **Service Area:** The geographic radius (calculated via PostGIS) within which a carrier is willing to accept loads.

## 🛡️ 2. Identity & Compliance
* **Authority:** The legal permission granted by the FMCSA to operate as a motor carrier (MC) or broker.
* **Double Brokering:** An illegal/fraudulent practice where a carrier accepts a load and then re-assigns it to another carrier without the shipper's knowledge.
* **FMCSA:** Federal Motor Carrier Safety Administration; the primary regulatory body.
* **JWT (RS256):** JSON Web Token using asymmetric encryption; used for stateless, secure authentication across our microservices.
* **RLS (Row Level Security):** A PostgreSQL security feature that restricts which data rows a user can see based on their `tenant_id`.
* **USDOT Number:** A unique identifier assigned to companies performing interstate commerce; our primary key for identity verification.

## ⚙️ 3. Engineering & Architecture
* **Complexity (v(G)):** Cyclomatic Complexity; a measurement of the number of linear paths through code. Enforced at ≤ 10.
* **Enon:** The codename for our primary PostgreSQL 16 database instance.
* **Hexagonal Architecture:** An architectural pattern that decouples the "Core Domain" from external concerns (DB, UI, APIs) via Ports and Adapters.
* **Idempotency:** The property of an operation where it can be applied multiple times without changing the result beyond the initial application (critical for our Outbox events).
* **Transactional Outbox:** A pattern that ensures a database update and an event notification are sent atomically.

## 💰 4. Financials
* **CPM (Cost Per Mile):** The total operational cost for a carrier to move one mile (includes fuel, insurance, and maintenance).
* **Factoring:** A financial transaction where a carrier sells its invoices to a third party at a discount to get immediate cash.
* **Net Margin:** The profit remaining after all expenses (including fuel and accessorials) are deducted from the total load rate.
* **Rate Confirmation (Rate-Con):** The legal contract between the broker/shipper and carrier detailing the agreed price for a specific load.