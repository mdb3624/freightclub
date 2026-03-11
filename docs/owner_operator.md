# Owner/Operator Persona

This document defines all requirements for the Owner/Operator (trucker) persona in FreightClub.

---

## Who They Are

An owner/operator is an independent truck driver who owns their own vehicle and operates as a sole proprietor or small business. They are self-employed, responsible for finding their own loads, and rely on load boards like FreightClub to keep their truck moving and profitable.

---

## Goals

- Find loads that match their truck type, preferred lanes, and schedule
- Maximize revenue per mile and minimize deadhead (empty) miles
- Get paid quickly and reliably after delivery
- Manage their business with minimal administrative overhead

---

## Pain Points

- Wasted time browsing irrelevant or already-claimed loads
- Brokers or shippers who are unresponsive or unreliable
- Unclear or late payments
- Too much paperwork (BOL, POD, invoicing)
- Loads that don't match their equipment type or preferred region

---

## Functional Requirements

### Account & Profile
- [ ] Register with name, contact info, and business details (MC number, DOT number)
- [ ] Upload and manage truck/trailer information (type, dimensions, capacity)
- [ ] Set preferred lanes (origin/destination regions)
- [ ] Set availability (days/hours available to pick up)
- [ ] View and edit profile at any time

### Load Discovery
- [ ] Browse open loads on the load board
- [ ] Filter loads by origin, destination, equipment type, weight, and pay rate
- [ ] Search loads by pickup/delivery date range
- [ ] View load details: origin, destination, distance, weight, dimensions, freight type, pay rate, shipper info
- [ ] See how many truckers have viewed or expressed interest in a load
- [ ] Receive suggested loads based on current location and preferred lanes

### Claiming a Load
- [ ] Express interest / bid on a load
- [ ] Claim a load directly if posted as first-come-first-served
- [ ] Receive confirmation when a load is assigned to them
- [ ] View all loads currently assigned to them

### Load Execution
- [ ] Mark a load as picked up (with timestamp and optional photo of BOL)
- [ ] Update load status to in-transit
- [ ] Mark a load as delivered (with timestamp and optional proof of delivery photo)
- [ ] Report issues during transit (delay, damage, etc.)

### Payments
- [ ] View agreed pay rate before claiming a load
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
open → claimed      (trucker claims the load)
claimed → in_transit  (trucker marks pickup)
in_transit → delivered  (trucker marks delivery)
```

---

## Future Considerations

- Document upload: insurance certificates, CDL, medical card
- Preferred shipper / blocklist
- In-app navigation integration (Google Maps, Waze)
- Earnings dashboard and tax summary
- Team drivers / co-driver support
