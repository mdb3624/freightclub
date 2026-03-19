# Owner/Operator Persona

This document defines all requirements for the Owner/Operator (trucker) persona in FreightClub.

---

## Who They Are

An owner/operator is an independent truck driver who owns their own vehicle and operates as a sole proprietor or small business. They are self-employed, responsible for finding their own loads, and rely on load boards like FreightClub to keep their truck moving and profitable.

---

## Goals

- Find loads that match their truck type, preferred lanes, and schedule
- Maximize revenue per mile (RPM) and minimize deadhead (empty) miles
- Know immediately whether a load is profitable before claiming it
- Stay compliant with FMCSA Hours of Service (HOS) regulations
- Get paid quickly and reliably after delivery
- Manage their business with minimal administrative overhead

---

## Pain Points

- Wasted time browsing irrelevant or already-claimed loads
- Accepting loads below break-even because RPM isn't visible at a glance
- Brokers or shippers who are unresponsive or unreliable
- Unclear or late payments
- Too much paperwork (BOL, POD, invoicing)
- Loads that don't match their equipment type or preferred region
- No visibility into earnings trends or cost-per-mile performance

---

## Functional Requirements

### Account & Profile
- [x] Register with name, contact info, and business details (MC number, DOT number)
- [x] Set primary equipment type
- [x] View and edit profile at any time
- [x] Cost profile: monthly fixed costs, fuel cost per gallon, MPG, maintenance cost per mile, monthly miles target, target profit margin per mile
- [ ] Upload and manage truck/trailer information (type, dimensions, capacity)
- [ ] Set preferred lanes (origin/destination regions)
- [ ] Set availability (days/hours available to pick up)

### Financial Intelligence
- [x] Cost Per Mile (CPM) calculator — live breakdown on profile: fixed CPM, variable CPM (fuel + maintenance), total CPM, minimum RPM
- [x] Minimum RPM = total CPM + target margin per mile
- [x] 30-day earnings summary: loads completed, total miles, total revenue, effective CPM
- [ ] Per-load earnings log with actual miles driven and fuel used
- [ ] Weekly/monthly P&L report
- [ ] IFTA mileage tracking by state

### Load Discovery
- [x] Browse open loads on the load board
- [x] Filter by origin state, destination state, equipment type, pickup date
- [x] Equipment filter defaults to trucker's assigned type; hides irrelevant types
- [x] View full load details: origin, destination, distance, weight, dimensions (L×W×H), commodity, equipment type, pay rate, payment terms, special requirements
- [x] RPM column on load board with color-coded profitability badge:
  - Green — at or above minimum RPM
  - Yellow — within 10% below minimum RPM
  - Red — significantly below minimum RPM
- [x] Profitability breakdown on load detail: estimated revenue, fuel cost, maintenance, net profit, effective RPM vs minimum RPM
- [ ] Filter by weight range or minimum pay rate
- [ ] See view/interest count per load
- [ ] Suggested loads based on current location and preferred lanes
- [ ] Deadhead mileage estimate from current location to pickup

### Claiming a Load
- [x] Claim a load directly (first-come-first-served)
- [x] One active load at a time enforced; must deliver before claiming another
- [x] View active load prominently on dashboard with shipper contact info
- [x] Scroll automatically to active load after claiming
- [x] View full load history (delivered, settled, cancelled)
- [ ] Express interest / bid on a load
- [ ] Receive push/email confirmation when a load is assigned

### Load Execution
- [x] Mark load as picked up (CLAIMED → IN_TRANSIT) with confirmation dialog
- [x] Mark load as delivered (IN_TRANSIT → DELIVERED) with confirmation dialog
- [x] Hours of Service (HOS) widget:
  - 11-hour drive rule progress bar with remaining time
  - 14-hour on-duty window progress bar with remaining time
  - Color-coded warnings: amber < 30% remaining, red < 15% remaining
  - "Under 2 hours" alert prompting stop planning
  - Persisted across sessions via localStorage
- [ ] BOL photo upload at pickup
- [ ] Proof of Delivery (POD) photo upload at delivery
- [ ] Report issue during transit (delay, damage, etc.)

### Payments
- [x] View agreed pay rate (flat or per-mile) before claiming
- [x] View estimated total pay on per-mile loads
- [x] View payment terms on every load (Quick Pay, Net 7/15/30)
- [ ] Receive payment notification after delivery confirmation
- [ ] View payment history and status per load
- [ ] Connect a bank account or payment method for direct deposit

### Communication
- [ ] Message the shipper directly within the platform
- [ ] Receive push/email notifications for load status changes, messages, and payment updates

### Ratings & Reviews
- [ ] Be rated by shippers after load completion
- [ ] View their own rating and feedback history
- [ ] Rate shippers after completing a load

---

## Non-Functional Requirements

- Mobile-first experience — most truckers operate from a phone or tablet while on the road
- Fast load board refresh — loads should update in near real-time to avoid claiming already-taken loads
- Offline tolerance — key info (current load details, BOL) should be accessible with poor connectivity
- Simple, low-friction UI — minimize steps to claim a load or update status
- HOS widget must be visible without navigating away from the load board

---

## Permissions / Role Constraints

| Action | Owner/Operator |
|--------|---------------|
| Post a load | No |
| Browse loads | Yes |
| Claim a load | Yes |
| Update load status | Yes (only loads assigned to them) |
| View shipper contact info | Yes (after claiming) |
| Rate a shipper | Yes (after delivery) |
| Access admin tools | No |

---

## Load Status Transitions (Trucker Actions)

```
open → claimed        (trucker claims the load)
claimed → in_transit  (trucker marks pickup)
in_transit → delivered  (trucker marks delivery)
```

---

## Cost Profile Formula

```
Fixed CPM      = Monthly Fixed Costs ÷ Monthly Miles Target
Fuel CPM       = Fuel Cost per Gallon ÷ Miles per Gallon
Variable CPM   = Fuel CPM + Maintenance Cost per Mile
Total CPM      = Fixed CPM + Variable CPM
Minimum RPM    = Total CPM + Target Margin per Mile
```

A load is **profitable** if its RPM ≥ Minimum RPM.
A load **breaks even** if its RPM = Total CPM.
A load **loses money** if its RPM < Total CPM.

---

## Future Considerations

- Deadhead cost inclusion in profitability calculations
- IFTA mileage log by state for quarterly tax filing
- Fuel surcharge (FSC) calculation based on DOE national average
- Document upload: insurance certificates, CDL, medical card
- Preferred shipper / blocklist
- In-app navigation integration (Google Maps, Waze)
- Annual earnings and tax summary
- Team drivers / co-driver support
- ELD integration for automated HOS tracking
