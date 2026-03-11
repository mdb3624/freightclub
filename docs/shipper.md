# Shipper Persona

This document defines all requirements for the Shipper persona in FreightClub, informed by industry best practices.

---

## Who They Are

A shipper is a business or individual that needs freight transported from one location to another. They may be manufacturers, wholesalers, retailers, or independent businesses. Shippers are responsible for accurately describing their loads, coordinating pickup/delivery, and paying carriers on time.

---

## Goals

- Post loads quickly and get them claimed by reliable, qualified carriers
- Ensure freight arrives on time and undamaged
- Build a preferred network of trusted owner/operators for repeat lanes
- Minimize administrative overhead (paperwork, disputes, tracking)
- Pay and get receipts easily without chasing documentation

---

## Pain Points

- Loads sitting unclaimed due to poor descriptions or uncompetitive rates
- Carriers who are unresponsive, late, or don't have the right equipment
- Disputes over weight, dimensions, or special requirements not communicated upfront
- Late or missing documentation (signed BOL, POD) that delays their own billing
- Managing too many tools — load board, messaging, payments, document storage

---

## Functional Requirements

### Account & Profile
- [ ] Register with business name, contact info, and billing details
- [ ] Set company address(es) as default pickup locations
- [ ] View and edit profile at any time
- [ ] Manage notification preferences (email, SMS, in-app)

### Load Posting
- [ ] Create a new load with the following required fields:
  - Pickup address and date/time window
  - Delivery address and date/time window
  - Freight description (commodity type)
  - Weight (lbs)
  - Dimensions (L x W x H)
  - Freight class (if LTL)
  - Equipment type required (dry van, flatbed, reefer, step deck, etc.)
  - Special requirements (tarps, straps, hazmat, liftgate, team drivers, etc.)
  - Pay rate (flat or per-mile)
  - Payment terms (quick pay, Net 15, Net 30, Net 45)
- [ ] Save loads as drafts before publishing
- [ ] Post a load as first-come-first-served or open to bids
- [ ] Edit a load before it is claimed
- [ ] Cancel a load before pickup (with reason)
- [ ] Duplicate a recurring load to re-post quickly
- [ ] View all active, claimed, in-transit, and completed loads in a dashboard

### Carrier Selection
- [ ] View trucker profiles: rating, reviews, equipment, and completed load history
- [ ] Accept or reject bids from truckers (if posted as open to bids)
- [ ] Assign a load directly to a preferred/trusted trucker
- [ ] Maintain a preferred carrier list for repeat lanes
- [ ] Block carriers who have performed poorly

### Load Tracking
- [ ] Receive notification when a trucker claims the load
- [ ] See real-time load status updates: claimed → in_transit → delivered
- [ ] Receive notification when trucker marks pickup (with timestamp)
- [ ] Receive notification when trucker marks delivery (with timestamp and POD photo)
- [ ] View full status history and timeline per load

### Documentation
- [ ] Receive a digital Bill of Lading (BOL) at time of load creation
- [ ] View signed BOL uploaded by trucker at pickup
- [ ] View Proof of Delivery (POD) uploaded by trucker at delivery
- [ ] Download all documents per load as PDF
- [ ] Store document history per load for auditing

### Payments
- [ ] Set payment terms per load (quick pay, Net 15, Net 30, Net 45)
- [ ] Receive invoice automatically upon delivery confirmation
- [ ] Pay carrier directly through the platform
- [ ] View full payment history by load, carrier, and date range
- [ ] Receive receipts for every transaction
- [ ] Dispute a payment if delivery was incomplete or freight was damaged

### Communication
- [ ] Message the assigned trucker directly within the platform
- [ ] Receive push/email/SMS notifications for load status changes and messages
- [ ] Be notified immediately of any delay or issue reported by the trucker

### Ratings & Reviews
- [ ] Rate and review the trucker after load completion
- [ ] View their own shipper rating (visible to truckers browsing loads)
- [ ] View trucker ratings before assigning a load

---

## Non-Functional Requirements

- Load posting must be fast — a shipper should be able to post a load in under 2 minutes
- Load information must be validated before publishing (required fields enforced)
- Documents (BOL, POD) must be stored securely and accessible at any time
- Payment processing must be reliable and auditable
- The platform must make shipper reputation visible — truckers decide which loads to claim partly based on shipper rating and payment history

---

## Load Posting Best Practices (enforced or prompted by the platform)

These are surfaced as tips or validation warnings to shippers during load creation:

1. **Be accurate** — incorrect weight or dimensions cause disputes at pickup and damage trust with carriers
2. **State all special requirements upfront** — tarps, straps, hazmat certs, liftgate, inside delivery, etc.
3. **Set competitive rates** — loads with below-market rates sit unclaimed; the platform can show market rate benchmarks
4. **Use realistic pickup/delivery windows** — overly tight windows deter experienced carriers
5. **Choose appropriate payment terms** — quick pay options attract more and better carriers
6. **Communicate proactively** — notify truckers immediately if pickup details change

---

## Permissions / Role Constraints

| Action | Shipper |
|--------|---------|
| Post a load | Yes |
| Browse loads | No |
| Claim a load | No |
| Update load status | No (read-only; trucker updates status) |
| View trucker contact info | Yes (after assigning load) |
| Rate a trucker | Yes (after delivery) |
| Access admin tools | No |

---

## Load Status Transitions (Shipper Visibility)

```
draft → open          (shipper publishes the load)
open → claimed        (trucker claims; shipper notified)
claimed → in_transit  (trucker marks pickup; shipper notified)
in_transit → delivered  (trucker marks delivery; shipper notified + POD received)
delivered → settled   (shipper pays invoice; load closed)
```

Shippers can cancel a load while in `open` or `claimed` status (before pickup).

---

## Shipper Reputation

A shipper's public profile visible to truckers includes:
- Overall rating (1–5 stars, from trucker reviews)
- Average payment speed (e.g., "Typically pays in 7 days")
- Number of completed loads
- Any flags for disputes or cancellations

Truckers use this to decide whether to claim a load. Shippers with poor ratings or slow payment histories will see lower claim rates.

---

## Future Considerations

- Recurring load scheduling (post the same lane on a weekly/monthly cadence)
- Volume shipper accounts (multiple users under one company)
- Rate benchmarking tool (show market rate for a lane at time of posting)
- Carrier scorecards (detailed performance metrics per trucker)
- Freight insurance integration
- API access for shippers with their own TMS (Transportation Management System)
