# User Stories — Phase 1: Core Load Lifecycle

## Authentication & Onboarding

- **As a shipper**, I want to register an account with my business name and contact info so that I can post loads on the platform.
- **As a trucker**, I want to register an account with my name, contact info, MC number, and DOT number so that I can browse and claim loads.
- **As a user**, I want to log in with my email and password so that I can access my dashboard.
- **As a user**, I want my session to stay active without re-logging in so that I can work without constant interruption.
- **As a user**, I want to log out securely so that my account is protected on shared devices.
- **As a shipper**, I want to create a company tenant and share a join code with colleagues so that my team can collaborate on load management.
- **As a team member**, I want to join an existing company using a join code so that I can work under the same tenant without separate setup.

## Load Posting (Shipper)

- **As a shipper**, I want to create a load with pickup address, delivery address, date windows, commodity description, weight, dimensions, equipment type, pay rate, and payment terms so that truckers have everything they need to evaluate and claim it.
- **As a shipper**, I want to save a load as a draft so that I can complete and review it before making it visible to truckers.
- **As a shipper**, I want to publish a draft load to make it open for claiming so that truckers can see and act on it immediately.
- **As a shipper**, I want to edit a load while it is in draft or open status so that I can correct mistakes before it is claimed.
- **As a shipper**, I want to cancel a load at any pre-delivery stage so that I can handle changes in freight plans.
- **As a shipper**, I want the road distance between pickup and delivery addresses to be calculated automatically so that I don't have to look it up manually.

## Load Board (Trucker)

- **As a trucker**, I want to browse all open loads on a load board so that I can find freight that matches my truck and schedule.
- **As a trucker**, I want to filter the load board by origin state, destination state, equipment type, and pickup date so that I only see relevant loads.
- **As a trucker**, I want to view full load details — origin, destination, distance, weight, dimensions, commodity, equipment type, pay rate, payment terms, and special requirements — so that I can make an informed decision before claiming.
- **As a trucker**, I want to see a color-coded RPM badge (green / yellow / red) on each load card so that I can instantly assess whether a load is profitable.
- **As a trucker**, I want to view a per-load profitability breakdown (revenue, fuel cost, maintenance, net profit, effective RPM vs minimum RPM) so that I can see exactly why a load is or isn't worth taking.

## Claiming & Executing a Load (Trucker)

- **As a trucker**, I want to claim a load directly so that I can secure the freight on a first-come-first-served basis.
- **As a trucker**, I want the platform to enforce one active load at a time so that I stay focused on my current delivery before taking on another.
- **As a trucker**, I want to see the shipper's contact information after claiming a load so that I can coordinate pickup.
- **As a trucker**, I want to mark a load as picked up so that the shipper knows I have the freight and the status reflects reality.
- **As a trucker**, I want to mark a load as delivered so that the shipper is notified and the load moves to settlement.
- **As a trucker**, I want to see a confirmation dialog before marking pickup or delivery so that I don't accidentally advance the status.

## Shipper Dashboard

- **As a shipper**, I want to see all my loads in a single dashboard with their current statuses (draft, open, claimed, in transit, delivered, cancelled, settled) so that I know the state of my freight at a glance.
- **As a shipper**, I want to see the assigned trucker's contact information after a load is claimed so that I can coordinate with them.

## Trucker Dashboard

- **As a trucker**, I want to see my active load prominently at the top of my dashboard so that I always know what I'm currently hauling and can act on it quickly.
- **As a trucker**, I want to view my full load history (delivered, settled, cancelled) so that I can track my completed work.

## Financial Intelligence (Trucker)

- **As a trucker**, I want to set a cost profile with my monthly fixed costs, fuel cost per gallon, MPG, maintenance cost per mile, monthly miles target, and target profit margin so that the platform can calculate my break-even and minimum acceptable rate.
- **As a trucker**, I want to see a live CPM breakdown (fixed CPM, variable CPM, total CPM, minimum RPM) on my profile so that I always know my numbers.
- **As a trucker**, I want to see a 30-day earnings summary (loads completed, total miles, total revenue, effective CPM) so that I can track my business performance over time.
- **As a trucker**, I want an Hours of Service widget showing my 11-hour drive and 14-hour on-duty progress bars with color-coded warnings so that I can stay compliant with FMCSA rules without tracking manually.

## Profiles

- **As a trucker**, I want to view and edit my profile (name, contact info, equipment type, cost profile) so that my information stays accurate.
- **As a shipper**, I want to view and edit my profile (business name, contact info, default pickup location) so that my information stays accurate.
