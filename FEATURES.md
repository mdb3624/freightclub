# FreightClub — Feature Status

Legend: ✅ Built · 🔲 Not yet built

---

## Shipper

### Account & Profile
- ✅ Register with business name, contact info, and billing details
- ✅ Set default pickup location (pre-fills origin on load creation)
- ✅ View and edit profile at any time
- ✅ Manage notification preferences (email, SMS, in-app toggles)
- ✅ Company/tenant system with shareable join code for colleagues

### Load Posting
- ✅ Create a load: pickup/delivery address & window, commodity, weight, dimensions (L×W×H), equipment type, pay rate (flat or per-mile), payment terms, special requirements
- ✅ Auto-calculated road distance from addresses
- ✅ Save load as draft before publishing
- ✅ Publish draft → open
- ✅ Edit a load while in DRAFT or OPEN status
- ✅ Cancel a load (any pre-delivered status)
- ✅ Dashboard shows all loads with status (draft, open, claimed, in transit, delivered, cancelled)
- 🔲 Duplicate a load for recurring lanes
- 🔲 Freight class field (LTL)
- 🔲 Post as open-to-bids vs first-come-first-served

### Carrier Selection
- ✅ View trucker contact info (name, phone, email, MC/DOT) after load is claimed
- 🔲 View trucker profile: rating, reviews, equipment, completed loads
- 🔲 Accept or reject bids from truckers
- 🔲 Assign a load directly to a preferred trucker
- 🔲 Preferred carrier list
- 🔲 Block carriers

### Load Tracking
- ✅ Real-time load status visible on dashboard (OPEN → CLAIMED → IN_TRANSIT → DELIVERED)
- 🔲 Push/email/SMS notifications on status changes
- 🔲 Full status history and timeline per load

### Documentation
- 🔲 Digital Bill of Lading (BOL) generation
- 🔲 Signed BOL upload by trucker at pickup
- 🔲 Proof of Delivery (POD) photo upload
- 🔲 PDF export per load

### Payments
- ✅ Pay rate and payment terms visible on load
- 🔲 Automatic invoice on delivery confirmation
- 🔲 In-platform payment to carrier
- 🔲 Payment history
- 🔲 Payment disputes

### Communication
- 🔲 In-app messaging with assigned trucker
- 🔲 Push/email/SMS notifications

### Ratings & Reviews
- 🔲 Rate and review trucker after completion
- 🔲 View own shipper rating (visible to truckers)

---

## Trucker (Owner/Operator)

### Account & Profile
- ✅ Register with name, contact info, MC number, DOT number
- ✅ Set primary equipment type
- ✅ View and edit profile at any time
- 🔲 Upload truck/trailer information (dimensions, capacity)
- 🔲 Set preferred lanes (origin/destination regions)
- 🔲 Set availability (days/hours)

### Load Discovery
- ✅ Browse open loads on the load board
- ✅ Filter by origin state, destination state, equipment type, pickup date
- ✅ Equipment filter defaults to trucker's assigned type
- ✅ View full load details: origin, destination, distance, weight, dimensions, commodity, pay rate, equipment type, payment terms, special requirements
- 🔲 Filter by weight range or pay rate
- 🔲 See view/interest count per load
- 🔲 Suggested loads based on current location and preferred lanes

### Claiming a Load
- ✅ Claim a load (first-come-first-served; one active load at a time)
- ✅ View active load prominently on dashboard with shipper contact
- ✅ View full load history (delivered, settled, cancelled)
- 🔲 Express interest / bid on a load

### Load Execution
- ✅ Mark load as picked up (CLAIMED → IN_TRANSIT) with confirmation dialog
- ✅ Mark load as delivered (IN_TRANSIT → DELIVERED) with confirmation dialog
- 🔲 BOL photo upload at pickup
- 🔲 Proof of Delivery photo upload at delivery
- 🔲 Report issue during transit (delay, damage)

### Payments
- ✅ View agreed pay rate before claiming (flat or per-mile with estimated total)
- ✅ View payment terms on load
- 🔲 Payment notification after delivery
- 🔲 Payment history per load
- 🔲 Bank account / direct deposit setup

### Communication
- 🔲 In-app messaging with shipper
- 🔲 Push/email/SMS notifications

### Ratings & Reviews
- 🔲 Rate shipper after delivery
- 🔲 View own rating and feedback history

---

## Platform / Infrastructure

- ✅ Multi-tenant shared schema (tenant_id isolation)
- ✅ JWT authentication (RS256, HTTP-only refresh cookie)
- ✅ Role-based access control (SHIPPER / TRUCKER)
- ✅ Flyway schema migrations
- ✅ JPA Specification-based filtering with Hibernate 6 type safety
- ✅ Global exception handling with structured error responses
- ✅ Null-safe tenant context (fail-fast on missing tenant)
- 🔲 Real-time updates (WebSocket or SSE)
- 🔲 Email/SMS notification delivery
- 🔲 File storage (BOL, POD documents)
- 🔲 Payment processing integration
- 🔲 Admin tools
