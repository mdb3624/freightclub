# Phase 5 — Payments & Invoicing

Completes the financial lifecycle. Depends on Phase 3 (POD triggers settlement) and Phase 4 (disputes reference ratings).

**Dependency:** Requires Phase 3 and Phase 4. Unlocks Phase 7b, Phase 9.

## Features

| Feature | Area | Notes |
|---------|------|-------|
| Automatic invoice generated on delivery confirmation | Platform | PDF with load details, rate, and POD reference |
| Payment processing integration (Stripe or ACH) | Platform | Shipper pays carrier through platform |
| Trucker bank account / direct deposit setup | Trucker | Stripe Connect or equivalent |
| Payment history per load | Both | |
| Receipts per transaction | Both | |
| Mark load as SETTLED after payment confirmed | Platform | Final status transition |
| Payment dispute flow | Shipper | Flag delivery; hold payment pending resolution |
