# Phase 8 — Bidding

Adds a competitive pricing model alongside first-come-first-served. Depends on carrier profiles (Phase 7) and ratings (Phase 4) since shippers need context to evaluate bids.

**Dependency:** Requires Phase 4 and Phase 7.

## Features

| Feature | Area | Notes |
|---------|------|-------|
| Post load as open-to-bids vs first-come-first-served | Shipper | New field on load creation |
| Trucker submits bid (rate + message) | Trucker | Only on bid-type loads |
| Shipper reviews and accepts/rejects bids | Shipper | Accepting a bid claims the load |
| Bid expiry and auto-close | Platform | Configurable window |
| Duplicate load for recurring lanes | Shipper | Copy all fields to new draft |
| Freight class field (LTL support) | Shipper | |
