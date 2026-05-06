# User Stories — Phase 5: Payments & Invoicing

## Invoicing

- **As a trucker**, I want an invoice to be automatically generated when a delivery is confirmed so that I don't have to create one manually and billing starts immediately.
- **As a shipper**, I want to receive the invoice automatically on delivery confirmation so that I can process payment without chasing documentation.
- **As a user**, I want the invoice to include load details, agreed pay rate, mileage, and a reference to the POD so that it is self-contained and auditable.
- **As a user**, I want to download the invoice as a PDF so that I can file it for accounting purposes.

## Payment Processing

- **As a shipper**, I want to pay a trucker directly through the platform (via Stripe or ACH) so that payments are tracked, auditable, and I don't have to manage off-platform transfers.
- **As a trucker**, I want to connect my bank account or payment method for direct deposit so that I receive payment to my account after delivery without manual coordination.
- **As a user**, I want to view payment history per load, including amount, status, and payment date, so that I can reconcile payments against delivered freight.
- **As a user**, I want a receipt for each completed transaction so that I have documentation for accounting and tax purposes.

## Settlement

- **As the platform**, I want a load to be marked as `SETTLED` after payment is confirmed so that the load lifecycle is fully closed and the status accurately reflects the financial state.

## Dispute Flow

- **As a shipper**, I want to flag a delivery as incomplete or disputed so that payment is held while the issue is investigated rather than automatically released to the trucker.
- **As a trucker**, I want to be notified immediately when a shipper flags my delivery as disputed so that I can respond with documentation and context.
- **As the platform**, I want disputed payments to be held in escrow until the dispute is resolved so that neither party loses funds pending a decision.
