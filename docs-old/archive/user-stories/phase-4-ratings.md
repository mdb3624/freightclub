# User Stories — Phase 4: Ratings & Reviews

## Post-Delivery Rating

- **As a trucker**, I want to rate a shipper (1–5 stars with an optional comment) after completing a delivery so that other truckers can make informed decisions about whether to work with that shipper.
- **As a shipper**, I want to rate a trucker (1–5 stars with an optional comment) after a load is delivered so that I have a record of carrier performance and other shippers can benefit from my experience.
- **As the platform**, I want the rating flow to be triggered only after delivery is confirmed so that ratings are always based on a completed load experience.
- **As the platform**, I want ratings to be linked to the `claims` record (not just the load) so that the rater and ratee are unambiguously identified even if a load is re-claimed after cancellation.

## Trucker Reputation

- **As a trucker**, I want my aggregate rating (average stars, total reviews) to be displayed on my public profile so that shippers can see my reputation before assigning me a load.
- **As a trucker**, I want to view all ratings I have received, including the comment and the load it relates to, so that I can understand what shippers value and where I can improve.

## Shipper Reputation

- **As a shipper**, I want a public reputation profile visible to truckers before they claim, showing my overall rating, average payment speed, completed load count, and any dispute or cancellation flags so that truckers can assess whether I'm a reliable shipper.
- **As a trucker**, I want to see a shipper reputation badge (star rating + average payment speed) on every load card on the load board so that I can factor in shipper reliability before committing my one active load slot.
- **As a trucker**, I want to see the shipper's full reputation profile before claiming so that I can review their history in detail if the badge raises questions.
- **As a shipper**, I want to view my own reputation profile and the reviews I've received so that I understand how truckers perceive me and can improve my practices.

## Reputation Signals

- **As a trucker**, I want the shipper's average payment speed (e.g. "Typically pays in 7 days") calculated from the last 90 days of completed loads to be visible before I claim so that I can factor in cash flow when evaluating a load.
- **As a trucker**, I want to see a warning indicator on a shipper's profile if they have dispute or cancellation flags so that I am alerted to patterns of unreliable behavior before committing.
