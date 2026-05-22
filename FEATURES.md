# FreightClub Features — User Capabilities

FreightClub is a load board platform connecting **shippers** (freight owners) with **owner-operator truckers** (carriers). Users can post loads, claim them, manage documentation, track payments, and build reputation—all from a secure, multi-tenant platform.

---

## 🚚 Shipper Features

### Post & Manage Loads
- **Create loads** with weight, dimensions, origin/destination, and pay rate
- **Save as draft** before publishing to keep private
- **Publish loads** to make visible to all truckers on the board
- **Edit active loads** to adjust details before a trucker claims
- **View load stats** at a glance: active, pending delivery, completed, cancelled
- **Cancel loads** with optional reason (if no trucker has claimed yet)

### Track Load Status
- **Real-time status updates** as loads move through the lifecycle: Draft → Published → Claimed → Picked Up → Delivered
- **View claimed loads** and see which trucker has the freight
- **Monitor pickup & delivery** confirmations from truckers
- **Digital proof of delivery (POD)** from trucker showing load was delivered

### Load Board Management
- **Access your load board** showing all loads you've posted
- **Filter & sort** by status, date posted, pay rate, weight
- **Paginated view** for easy browsing of many loads
- **Quick links** to create new load or view load details

### Manage Documents
- **Auto-generate Bill of Lading (BOL)** PDF with your company info and load details
- **Upload files** to loads (BOL, insurance, special instructions)
- **View Proof of Delivery** photos uploaded by trucker
- **Secure document storage** with access only to involved parties
- **Download documents** for record-keeping (25MB max per file)

### Company Profile
- **Set up company info**: name, address, DOT number, insurance details
- **View profile completeness** score to identify missing information
- **Update contact information** anytime
- **Track onboarding progress** toward full platform access

### Ratings & Reputation
- **Rate truckers** after each delivery (1–5 stars with written review)
- **View your rating score** and see reviews left by truckers
- **Build shipper reputation** across all your loads
- **Reputation badges** help truckers trust you (displayed on your load cards)

### Payment & Finances
- **Link bank account** for ACH deposits (setup in profile)
- **Auto-generate invoices** after each load delivered
- **View payment history** and ledger of all settlements
- **Export receipts** as PDF or CSV for accounting
- **Track payment status**: pending, settled, disputed

### Dashboard & Insights
- **Shipper Dashboard** with quick stats: active loads, pending delivery, completed, cancelled
- **Recent activities** timeline showing load events
- **Quick navigation** to post new load, view all loads, complete profile

---

## 🚛 Trucker (Owner-Operator) Features

### Find & Claim Loads
- **Browse load board** showing all available loads
- **Filter by criteria**: weight range, pay rate, equipment type required
- **See load details**: origin, destination, weight, pickup/delivery windows
- **Claim a load** to reserve it for yourself (one-click claiming)
- **View claimed loads** in your active list
- **Start pickup** when you arrive at origin

### Equipment & Availability
- **Add equipment** (trucks, trailers) to your profile with specs
- **Specify equipment details**: type (flatbed, dry van, specialized), dimensions, weight capacity, condition, year
- **Set preferred lanes** (region pairs) to get matched with better loads
- **Define work hours** and days available (calendar-based availability)
- **Block out unavailable dates** for scheduled downtime
- **1-hour caching** keeps your profile fresh without slowdown

### Load Execution
- **Pickup confirmation**: mark load as picked up when collected from shipper
- **Delivery confirmation**: mark load as delivered at destination
- **Upload Proof of Delivery (POD)** photo (JPEG, PNG, WebP) to verify completion
- **Track earnings per load** as you complete deliveries
- **View full load history** of all loads you've claimed

### Cost & Profitability
- **Set cost profile**: enter cost per mile (CPM) and surcharges (fuel, tolls, etc.)
- **Auto-calculate profitability** for each load recommendation
- **View earnings potential** before claiming loads

### Ratings & Performance
- **Rate shippers** after delivery (1–5 stars with written review)
- **Build carrier reputation** across your loads
- **View your rating score** and shipper reviews
- **Carrier performance metrics** show your on-time rate, completion rate, average response time

### Personalized Dashboard
- **Trucker Dashboard** showing your active loads, earnings summary, equipment inventory
- **Suggested loads** tailored to your preferred lanes and equipment
- **Quick view** of availability and preferences
- **Earnings summary** showing what you've made this month/period

### Onboarding & Setup
- **Trucker Landing Page** when you first join
- **Guided onboarding**: add equipment, set availability, define cost profile
- **Quick Pay information** for fast settlement options
- **Features overview** explaining load board functionality

### Hours of Service (HOS)
- **HOS compliance widget** shows your available hours
- **Cannot claim loads** if insufficient hours available (ELD integration planned)
- **Auto-track hours** from pickup to delivery
- **Integration with calendar availability** to prevent overwork

---

## 🔐 Shared / Platform Features (Both Roles)

### Authentication & Signup
- **Register** with email and password
- **Email verification** required before login
- **Multi-tenant accounts**: separate workspace per company/owner
- **Secure login** with session persistence
- **Logout** clears all session data
- **Session refresh** automatic via HTTP-only cookies

### Notifications
- **Real-time notification bell** with unread badge count
- **Email notifications** on key events:
  - Load claimed
  - Pickup scheduled
  - Load delivered
  - Load cancelled
  - Payment settled
- **In-app notifications** with timestamps
- **Mark as read** to clear notifications

### User Profile
- **Update personal info**: name, email, phone
- **Change password** anytime
- **View account details** and role
- **Multi-role support**: register as shipper OR trucker (or both on separate accounts)

### Pricing Data
- **Real-time diesel prices** from U.S. Energy Information Administration (EIA)
- **Price ticker** displayed on load board for cost calculations
- **6-hour cache** for rate-limit compliance

### Security & Multi-Tenancy
- **Encrypted JWT tokens** for secure sessions
- **Row-level data isolation** ensures your data never visible to other companies
- **HTTPS-only communication** to backend
- **PostgreSQL security** enforces tenant boundaries at database level

---

## 📊 Analytics & Reporting

### Load Board Analytics
- **Posting trends**: how many loads are posted over time
- **Claim rates**: how fast loads get claimed
- **Pricing trends**: average pay rates by region/equipment type
- **Equipment demand**: which equipment types are most needed
- **30-minute cache** for snappy reports

### Carrier Performance (Trucker Metrics)
- **On-time delivery rate**: your consistency
- **Load completion rate**: how often you finish what you start
- **Average claim response time**: how quickly you claim loads
- **Earnings by carrier**: total revenue generated
- **2-hour cache** for dashboard performance

### Revenue Reports (Shipper Analytics)
- **Revenue by load or time period**: how much you've earned
- **Payment breakdown**: pending vs. settled amounts
- **Chargeback tracking**: disputes and refunds
- **Export capability** for accounting/bookkeeping
- **6-hour cache** for efficiency

---

## 🎯 Features In Progress

| Feature | Target Users | Status | What It Does |
|---------|--------------|--------|-------------|
| **Document Audit Log** | Both | 🔄 In Development | Track who created, modified, or deleted documents for compliance |
| **Rating System (Full UI)** | Both | 🟡 Partial | Display shipper/trucker ratings and reviews on profiles; history timeline |
| **Payment Processing** | Both | 🔴 Blocked | Auto-deposit earnings to linked bank account via ACH/Stripe (not yet integrated) |
| **In-App Messaging** | Both | 🔴 Blocked | Direct shipper-to-trucker chat for load negotiation (infrastructure pending) |
| **DOT Compliance** | Trucker | 📋 Planned | Track CDL status, insurance expiration, safety records |
| **Financial Intelligence** | Trucker | 📋 Planned | Advanced P&L, IFTA fuel tax tracking, tax export for accountants |
| **Bidding & Open Loads** | Trucker | 📋 Planned | Bid on loads instead of one-click claiming; dynamic pricing |
| **Admin Dashboard** | Admin | 📋 Planned | System-wide monitoring, user management, compliance audits |

---

## 🏗️ Platform Architecture (Technical Overview)

**For Users:** FreightClub works seamlessly across web browsers on desktop and mobile.

- **Frontend**: React-based responsive design, works on phones, tablets, desktops
- **Backend**: Cloud-based REST API handling all business logic
- **Database**: PostgreSQL with geographic data (PostGIS) for region-based matching
- **Security**: Multi-tenant isolation ensures your data is private
- **Storage**: AWS S3 for secure document uploads
- **Availability**: 99.9% uptime SLA on Google Cloud Run

---

## 📈 Test Coverage & Reliability

- **109+ backend tests** passing; 70%+ code coverage ensures stability
- **17+ frontend tests** with golden-path E2E automation (Playwright)
- **Continuous deployment** to production with automated quality gates
- **Zero-downtime updates** maintain platform availability

---

## 🔄 Data & Privacy

- **GDPR-compliant** data handling for shipper/trucker information
- **Soft-delete** architecture means no data is truly lost (kept for audit trail)
- **Multi-tenant isolation** via PostgreSQL Row-Level Security
- **Encrypted storage** for sensitive documents and payment data
- **Your data never leaves** the secure cloud platform

---

## 🚀 Deployment & Availability

- **Live Production**: https://freightclub-backend-5gecbdg27a-uc.a.run.app
- **Frontend**: https://freightclub-ui-xxxxxxx.web.app (staging/prod)
- **Always available**: 24/7 support for critical issues
- **Regular updates**: new features deployed every 1–2 weeks

---

**Last Updated**: 2026-05-21  
**Phase Status**: Phase 3 (Core Load Lifecycle) Complete | Phase 7 (Fleet Management) In Progress  
**Next Features**: Payment Processor Integration, Admin Dashboard
