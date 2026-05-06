# User Stories — Phase 8: Bidding

## Load Posting with Bid Type

- **As a shipper**, I want to choose between "first-come-first-served" and "open to bids" when posting a load so that I can use competitive pricing for high-value or complex lanes where I want to evaluate carriers.
- **As a shipper**, I want bid-type loads to remain on the board without being immediately claimable so that I can receive and compare multiple offers before committing.

## Submitting Bids (Trucker)

- **As a trucker**, I want to submit a bid on bid-type loads with my proposed rate and an optional message so that I can compete for freight on my preferred lanes.
- **As a trucker**, I want to see the status of my submitted bids (pending, accepted, rejected) so that I know which loads I'm still in contention for.
- **As a trucker**, I want to be notified when my bid is accepted or rejected so that I can move on quickly if I don't get the load.

## Reviewing Bids (Shipper)

- **As a shipper**, I want to view all submitted bids for a load, including each trucker's rate, message, rating, and equipment profile so that I can make an informed carrier selection.
- **As a shipper**, I want to accept a bid to claim the load for that trucker so that the load moves into the normal execution flow from that point.
- **As a shipper**, I want to reject individual bids with an optional reason so that truckers understand why they weren't selected.
- **As a shipper**, I want bids to automatically expire and close after a configurable window so that loads don't wait indefinitely for bids when the pickup window is approaching.

## Load Management Utilities

- **As a shipper**, I want to duplicate an existing load to a new draft so that I can quickly re-post the same lane without re-entering all the details.
- **As a shipper**, I want to add a freight class field to a load for LTL shipments so that less-than-truckload freight can be described accurately.
