# User Stories — Phase 9: Admin & Operations

## Admin Dashboard

- **As an admin**, I want to view all users, loads, and tenants in an admin dashboard so that I can monitor platform activity and take action when needed.
- **As an admin**, I want to search and filter users by role, tenant, and registration date so that I can find specific accounts quickly during support or moderation.
- **As an admin**, I want to view all loads regardless of tenant so that I can investigate disputes, reports, or anomalies across the platform.

## Dispute Resolution

- **As an admin**, I want to view all flagged payments and disputed loads in a queue so that I can prioritize and resolve disputes in order.
- **As an admin**, I want to manually settle a disputed payment so that I can unblock the load lifecycle when the parties cannot resolve it themselves.
- **As an admin**, I want a full audit trail of all actions taken on a disputed load (status changes, messages, documents, payment events) so that I have all the context needed to make a fair decision.

## Platform Health Metrics

- **As an admin**, I want to see platform health metrics (load volume, claim rate, average time-to-claim) so that I can identify trends, bottlenecks, and growth patterns.

## Shipper Tools

- **As a shipper**, I want to see market rate benchmarks for a lane (origin/destination/equipment) at the time of posting so that I can price my load competitively and reduce time unclaimed.
- **As a shipper**, I want to view a detailed carrier scorecard for any trucker (on-time rate, cancellation rate, average rating, completed loads) so that I can make data-driven carrier selections.
- **As a shipper**, I want to set up recurring load scheduling for a regular lane (weekly or monthly cadence) so that routine freight is posted automatically without manual re-entry.

## Trucker Tools

- **As a trucker**, I want ELD integration so that my Hours of Service data is pulled automatically from my electronic logging device instead of entered manually in the HOS widget.
- **As a trucker**, I want to upload and manage my credentials (insurance certificate, CDL, medical card) on my profile so that shippers can verify I am compliant before assigning loads.

## Platform Integrations

- **As a shipper**, I want optional per-load cargo insurance at booking so that my freight is protected without having to arrange separate coverage.
- **As a shipper**, I want REST API (TMS) access so that I can integrate FreightClub directly with my Transportation Management System and post loads programmatically.
