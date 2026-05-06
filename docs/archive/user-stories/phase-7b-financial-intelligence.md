# User Stories — Phase 7b: Advanced Financial Intelligence (Trucker)

## Per-Load Earnings Log

- **As a trucker**, I want to log my actual miles driven, fuel used, and net profit for each completed load so that my profitability analysis is based on real data rather than estimates.
- **As a trucker**, I want my per-load earnings to be recorded automatically after delivery confirmation so that I don't have to enter data manually after every haul.

## P&L Reporting

- **As a trucker**, I want to view a weekly and monthly P&L report showing revenue, costs, and net profit over a selectable time period so that I can track my business performance and identify trends.
- **As a trucker**, I want to export my earnings data as a PDF or CSV so that I can share it with an accountant or use it to prepare my Schedule C.
- **As a trucker**, I want to view my annual earnings and tax summary so that I have all the figures I need at tax time in one place.

## IFTA Mileage Tracking

- **As a trucker**, I want my miles driven per state to be tracked per load so that I can accurately complete my quarterly IFTA fuel tax filing without manual mileage logs.

## Deadhead Cost Analysis

- **As a trucker**, I want to see an estimated deadhead mileage from my current location to a load's pickup address so that I can factor in the cost of driving empty before committing to a load.
- **As a trucker**, I want the per-load profitability calculation to include deadhead cost so that I see the true all-in profit rather than just the revenue run cost.

## Fuel Surcharge

- **As a trucker**, I want the platform to auto-calculate a fuel surcharge based on the DOE national diesel average and estimated load miles so that surcharge is never left on the table when shipper terms allow it.
- **As a trucker**, I want to override the auto-calculated fuel surcharge so that I can enter my actual negotiated amount when it differs.

## Database — Cost Profile Extraction

- **As the platform**, I want trucker cost profile data extracted from the `users` table into a dedicated `trucker_cost_profiles` table so that cost profile history can be tracked independently and the `users` table is not polluted with financial columns.
