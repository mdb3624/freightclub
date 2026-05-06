# User Stories — Phase 3: Document Management (BOL & POD)

## Bill of Lading (BOL)

- **As a shipper**, I want a digital Bill of Lading to be generated automatically when I publish a load so that I have a legally compliant document ready before the trucker arrives, without manual paperwork.
- **As a shipper**, I want the platform-generated BOL to be pre-filled with the load's pickup and delivery addresses, commodity description, weight, and equipment type so that I don't have to enter the same information twice.
- **As a trucker**, I want to upload a photo of the signed BOL at pickup so that there is a confirmed record of the freight being accepted and the shipper is notified.
- **As a trucker**, I want uploading the BOL photo to be required before I can mark a load as picked up so that the platform enforces documentation before status advances.
- **As a shipper**, I want to view the signed BOL photo on the load detail page so that I have confirmation the trucker received the freight in the expected condition.

## Proof of Delivery (POD)

- **As a trucker**, I want to upload a Proof of Delivery photo at delivery so that there is a confirmed record of the freight being received and the shipper is notified.
- **As a trucker**, I want uploading the POD photo to be required before I can mark a load as delivered so that delivery cannot be confirmed without documentation.
- **As a shipper**, I want to view the POD photo on the load detail page so that I have proof of delivery before processing payment.

## Document Access & Export

- **As a shipper**, I want to view and download all documents for a load (BOL, POD) as a PDF so that I can file them for my own records and share with accounts payable.
- **As a trucker**, I want to view and download all documents for my loads so that I have copies of BOL and POD for my own records and any disputes.
- **As a user**, I want to see a timestamped document history for each load (who uploaded what and when) so that there is a clear audit trail of all document activity.

## File Storage

- **As the platform**, I want documents stored in secure cloud storage (S3 or equivalent) using signed upload and download URLs so that files are never exposed publicly and access is controlled per user.
- **As the platform**, I want only the storage key (not the file content) stored in the database so that the document record is lightweight and the file can be served directly from storage.

## Issue Reporting

- **As a trucker**, I want to report an issue during transit (delay, damage, or other problem) with a text description and optional photo so that the shipper is notified immediately and the event is recorded on the load.
- **As a shipper**, I want to be notified immediately when a trucker reports an issue during transit so that I can respond and plan accordingly before delivery.
