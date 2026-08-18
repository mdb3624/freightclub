# FreightClub Platform Features

FreightClub is a load-board and carrier-management platform connecting shippers (those posting freight loads) and owner-operator truckers (those hauling them). The platform manages the complete lifecycle of a load—from posting through delivery—with built-in rating, payment, and performance analytics. The system is multi-tenant with role-based access (Shipper, Trucker/Carrier, Admin) and enforces data isolation at the database level using PostgreSQL row-level security.

---

## Authentication & Account Management

**Multi-Tenant User Registration & Login**
Shippers and truckers register separately with email/password. JWT-based sessions with 15-minute access tokens and HTTP-only refresh cookies. Tenant context is automatically bound to every authenticated request, ensuring queries are scoped to the user's company/account. Password validation, email verification stubs are present.

**Session & Token Management**
Access tokens refresh automatically when expired (no silent logout). Refresh tokens stored in HTTP-only cookies (secure against XSS). Logout clears cached data to prevent data leakage on shared devices.

**User Profiles**
Both shippers and truckers maintain a profile with name, email, company info, and phone. Truckers additionally maintain detailed carrier information (see Carrier Management below).

---

## Load Lifecycle & Workflow

**Load Creation & Publishing (Shipper)**
Shippers post freight loads with origin, destination, weight, equipment type, rate, special instructions. Loads can be saved as drafts before publishing to the load board. Published loads immediately appear on the market (with filters applied by truckers). The system validates load data and prevents invalid state transitions.

**Load Board & Marketplace (Trucker)**
Truckers browse published loads on an interactive load board. The board shows available loads with key details: origin/destination, weight, equipment needed, offered rate, shipper rating, estimated fuel cost. Truckers can filter by weight range, minimum rate, equipment type, lane preference. Shippers can search for specific carriers to offer loads directly.

**Load Claiming**
Truckers claim loads from the board; claims are immediately visible to the shipper. Once a load is claimed, it's no longer available for other truckers. The claiming trucker must accept or the claim can be cancelled.

**Pickup Tracking**
Trucker marks load as picked up via photo upload. The system records the pickup timestamp and can capture exception photos if issues occur. Shipper is notified.

**Delivery & Completion**
Trucker marks load as delivered. The system records the delivery timestamp. Both parties can then view the load status and begin the settlement/payment process.

**Load Settlement & Dispute**
Shipper settles a completed load (payment triggered). If issues occurred, either party can dispute the load with a reason and optional photo evidence. Disputes block payment until resolved.

**Load Cancellation**
Shippers can cancel unpicked loads with a reason. Truckers are notified. Cancelled loads don't generate payment or ratings.

**Status & Event Tracking**
Every load tracks all state transitions (OPEN → CLAIMED → PICKED_UP → DELIVERED → SETTLED). All transitions trigger notifications and audit logs. Status counts available at a glance.

---

## Carrier Management & Profiles

**Carrier Profile Dashboard**
Truckers have a dedicated mobile-first operations dashboard (dark theme, ≥48px touch targets) showing:
- Hero card: next available load with key details
- Performance stats: on-time percentage, average revenue per mile (RPM), total loads completed, total miles driven
- Load board tab: filterable list of open loads
- Equipment management tab: add/edit equipment with specs (type, dimensions, capacity, condition, year model)
- Lanes management tab: define preferred lanes by region with minimum rates
- Availability tab: set working hours/days
- Profile tab: identity verification, DOT/MC/CDL credentials with expiry tracking, insurance info, preferred lanes

**Cost Profile Setup**
Truckers configure a cost profile to calculate profitability:
- Base cost per mile (fuel, maintenance, insurance)
- Per-load overhead
- Desired profit margin percentage
- System calculates the minimum acceptable rate (RPM) needed to hit margin targets
- Real diesel prices from EIA API automatically factored in (regional), with fallback for missing data
- Profitability indicators shown on each load card (meets margin? exceeds?)

**Equipment Management**
Truckers add their equipment (trailers, specialized containers) with capacity, dimensions, condition, and availability. Used for load-matching and filtering.

**Lane Preferences**
Truckers define preferred lanes (origin/destination region pairs) with minimum acceptable rates and frequency preferences. Used for targeted load recommendations.

**Availability Tracking**
Truckers set their working hours/days. Used for load recommendations and status indication.

**Public Carrier Profile**
Shippers can view a carrier's public profile: overall rating, on-time percentage, average cargo rating, review history. Used when assigning loads directly.

---

## Ratings & Reputation

**Bidirectional Rating System**
After a load is delivered, both shipper and trucker can rate each other on a 5-star scale with optional written feedback. Ratings are locked once submitted and cannot be edited.

**Rating Aggregation**
Ratings are averaged per-person. Trucker ratings include: safety, professionalism, communication, on-time delivery. Shipper ratings include: professionalism, payment speed, communication, fairness.

**Public Reputation Display**
Trucker ratings and summary visible to shippers on load board and carrier profile pages. Shipper ratings and payment-speed metrics visible to truckers. Reputation badges shown during load assignment.

**Rating History**
Both parties can view their historical ratings paginated, with timestamps and feedback text.

---

## Document Management

**Bill of Lading (BOL)**
System auto-generates a BOL for each load with shipper/trucker/load details. BOL can be viewed and downloaded by both parties.

**BOL Photo Upload (Carrier)**
Trucker uploads a photo of the BOL at pickup to confirm load details match. System stores the photo and generates an attestation record.

**Proof of Delivery (POD) Photo Upload (Carrier)**
Trucker uploads a photo at delivery. System stores and links it to the load for dispute resolution.

**Document Vault (Shipper)**
Shippers can view all documents (BOLs, PODs) across their loads in one place, searchable and downloadable.

**Issue Reporting**
Either party can report an issue with a load (damage, short count, etc.) with a description and optional photo. Creates an audit trail for dispute resolution.

**Document Audit Log**
All document uploads, downloads, and issue reports are logged with timestamp, user, and action. Supports compliance and dispute investigation.

**PDF Export**
Loads can be exported as PDF with all details (BOL, POD photos, ratings, settlement info) for recordkeeping.

---

## Notifications

**Event-Driven Notifications**
Key load events trigger notifications:
- Load claimed by a trucker
- Load picked up (trucker notifies shipper)
- Load delivered (system notifies shipper)
- Load settled (shipper confirms payment)
- Load disputed (shipper/trucker conflict)
- Rating received (after delivery)

**Email Notifications**
Immediate emails sent for all major events. Configurable per-event subscription preferences (future enhancement).

**In-App Notification Center**
Paginated list of all notifications with timestamps. Mark individual notifications as read or mark all as read. Unread count badge on navigation. Notifications are timestamped and persistent (24h retention or longer).

**SMS Notifications (Stub)**
SMS infrastructure present; currently awaiting carrier integration for production use.

---

## Market Data & Analytics

**Diesel Fuel Pricing**
Real-time diesel prices from the U.S. Energy Information Administration (EIA) integrated into cost profitability calculations. Prices cached for 6 hours to reduce API calls. Regional pricing applied based on pickup state (EIA PADD regions). Fallback pricing available for states without coverage.

**KPI Dashboard (Shipper)**
Shippers see key metrics on their dashboard:
- Estimated cost per mile (aggregate across active loads)
- On-time carrier percentage (from ratings)
- Active shipments count
- Performance trends

---

## Shipper-Specific Features

**Shipper Dashboard Home**
Centralized operations view showing:
- KPI tiles (estimated cost, on-time carrier %, active loads)
- Quick action panel (create load, assign carrier, manage team)
- Carrier search panel (find and filter truckers to assign loads)
- Shipment status feed (recent load updates)

**Preferred Carrier List**
Shippers maintain a list of preferred truckers. Can directly assign loads to preferred carriers or search for new ones. Integration with carrier public profiles.

**Direct Load Assignment**
Shippers can offer a load directly to one or more carriers instead of posting to the public board. Notification sent to targeted carriers.

**Carrier Search**
Full-text search across carrier name/email. Filter by:
- Equipment type (tractor-trailer, box truck, flatbed, etc.)
- Lane coverage (origin/destination regions)
- Minimum rate requirement
- On-time rating threshold

---

## Trucker-Specific Features (Carrier Operations)

**Trucker Dashboard**
Unified operations hub with tabs:
- **Active Load**: featured next available load with full details and profitability calculation
- **Load Board**: searchable/filterable list of open loads; filter by lane, weight, rate, equipment, profitability
- **My Stats**: personal performance metrics (on-time %, average RPM, lifetime loads, lifetime miles)
- **Profile**: equipment, lanes, availability, cost profile, credentials, identity verification
- **Cost Profile Wizard**: dedicated screen to set up revenue/cost targets with step-by-step guidance

**Load Filtering & Search**
On the trucker load board:
- Filter by origin/destination region
- Filter by weight range
- Filter by minimum offered rate
- Filter by equipment type required
- Filter by profitability (shows loads that meet your cost targets)
- Sort by recent, distance, rate

**Payment Acknowledgment (Read-Only)**
Truckers can see invoice/payment status for completed loads, including amount paid and payment date. Settlement finalized by shipper.

**Earnings Analytics**
Per-load earnings visible with cost calculation. Lifetime RPM and total earnings tracked.

**Onboarding Checklist (Stub)**
Onboarding workflow present to ensure carriers complete required verifications before claiming loads (currently in design phase).

---

## Payment & Settlement (Partial Implementation)

**Auto Invoice Generation**
Upon load delivery, system generates an invoice with shipper, trucker, load details, and calculated fee.

**Payment Status Tracking**
Truckers can view payment status for each load (pending, settled, disputed). Shippers approve payment after delivery/acceptance.

**Settlement Workflow**
Shipper settles a completed load, triggering a backend payment processing flow. Status transitions to SETTLED. Dispute capability available before settlement.

**Dispute Tracking**
Disputes logged with reason and optional evidence. Blocks payment until resolved or manually cleared.

**Stripe Integration (Stub)**
Backend infrastructure for Stripe Connect payment processing is present. Full payout flow awaiting processor configuration.

---

## Admin & System Features (Planned/Stub)

**Theme Preferences**
Dark/light mode toggle, persisted per-user.

**RLS & Data Isolation**
All data queries enforced at database level via PostgreSQL row-level security. Tenant context automatic and mandatory for every operation.

**Audit Trail**
All major operations (document uploads, payments, disputes, deletions) logged with user, timestamp, and action description.

---

## Platform-Level Features

**Home Page & Marketing**
Public-facing home page with hero section, feature highlights, pricing comparison, how-it-works explainer, call-to-action buttons. In-page login/signup modals for quick onboarding (no separate /login or /register pages).

**Error Handling & Validation**
User input validated client-side (email format, phone, rate, weight, etc.) and server-side. Clear error messages for failed operations. Proper HTTP status codes returned.

**Responsive Design**
Mobile-first UI optimized for truckers (small screens, touch targets). Dark theme for low-light use. Tablet and desktop views also supported.

**Performance Caching**
Strategic caching at the database/API level:
- Loads list: 5 min
- Shipper profiles: 1 hour
- Carrier profiles: 1 hour
- Ratings: 30 min to 2 hours depending on aggregation type
- Diesel prices: 6 hours
- Theme preferences: user session

**Access Control**
Role-based (SHIPPER vs. TRUCKER) authorization on all endpoints. Delete/PUT endpoints secured with ownership checks. Public endpoints for registration and password reset. Pre-auth endpoints for login and public carrier profiles.

---

## Implementation Status by Phase

**Phases 1–3: Complete** (Core load lifecycle, notifications, documents, ratings)
- Load creation, board, claiming, pickup, delivery, settlement, cancellation
- Email notifications and in-app notification center
- Document management (BOL, POD, audit trail)
- Bidirectional ratings and reputation
- Multi-tenant registration and login

**Phase 4: Complete** (Ratings & Reviews)
- Full rating system with aggregation and public profiles

**Phase 5: In Progress** (Payments)
- Invoice generation and settlement workflow implemented
- Stripe Connect infrastructure present; awaiting processor configuration
- Dispute tracking implemented

**Phase 6: Planned** (In-App Messaging)
- Per-load messaging threads, WebSocket/SSE real-time updates, message notifications blocked on external message-broker dependency

**Phase 7a: Complete** (Carrier Dashboard MVP)
- Full trucker operations dashboard with equipment, lanes, availability, cost profile
- Mobile-first design with dark theme
- Performance metrics and load filtering
- Direct carrier-to-shipper integration

**Phase 7: In Progress** (Carrier & Shipper Management)
- Carrier profiles and preferred carrier lists complete
- Shipper dashboard home (KPI tiles, carrier search) completed
- Shipper company profile setup complete
- Direct load assignment, blocking carriers, interest tracking in design/backlog

**Phase 8+: Planned** (Bidding, Admin portals, Advanced analytics)

---

## Known Limitations & Stubs

- **Payment Processor**: Stripe/ACH integration awaiting provider configuration; settlement currently mocked
- **Message Broker**: In-app real-time messaging blocked on WebSocket/message-queue infrastructure
- **SMS Notifications**: Infrastructure present; awaiting carrier integration
- **Onboarding Checklist**: UI designed, backend enforcement pending
- **Admin Portal**: Planned but not yet implemented; no Admin persona live features
- **Bid System**: Truckers cannot yet submit counter-offers on posted loads (Phase 8)
- **Advanced Analytics**: Multi-load forecasting, regional pricing trends available in backend only (Phase 7b+)

---

## Technology & Architecture

- **Frontend**: React 18 + TypeScript + Vite, React Query (state management), Zustand (global state), Tailwind CSS (styling), Playwright (E2E tests)
- **Backend**: Spring Boot 3.x (Java 21), JPA/Hibernate, PostgreSQL (Neon)
- **Authentication**: JWT (access token + refresh token), bcrypt password hashing, HTTP-only cookies
- **Storage**: AWS S3 (signed URLs for document uploads)
- **Caching**: Spring Cache abstraction (Redis-ready but currently in-memory)
- **Notifications**: Email (transactional), in-app (database-backed), SMS (infrastructure only)
- **Deployment**: Google Cloud Run (backend + frontend), GitHub Actions CI/CD
- **Testing**: 940+ backend unit/integration tests (65% branch coverage enforced), 50+ frontend unit tests, 60+ E2E tests

---

**Last Updated**: 2026-07-23 | **Catalog Status**: 87 stories mapped | **Test Coverage**: 65% branch (enforced), target 80% | **Deployment**: Production-ready (Cloud Run)
