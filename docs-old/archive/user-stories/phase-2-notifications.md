# User Stories — Phase 2: Notifications & Status Timeline

## Email Notifications

- **As a shipper**, I want to receive an email when a trucker claims my load so that I know freight is moving and can prepare for pickup coordination.
- **As a shipper**, I want to receive an email when a trucker marks my load as picked up so that I know the freight is in transit.
- **As a shipper**, I want to receive an email when a trucker marks my load as delivered, including the delivery timestamp so that I have a record of when the delivery was confirmed.
- **As a trucker**, I want to receive an email when a shipper cancels a load I have claimed so that I am informed immediately and can pursue other loads.
- **As a user**, I want all email notifications to include the relevant load details (origin, destination, load ID) so that I can identify which load the notification refers to without logging in.

## In-App Notifications

- **As a user**, I want an in-app notification bell showing an unread count so that I can see at a glance whether something needs my attention.
- **As a user**, I want to click the notification bell and see a list of recent notifications so that I can review what has changed since my last visit.
- **As a user**, I want notifications to be marked as read when I view them so that the unread count accurately reflects only genuinely new activity.

## Status Timeline

- **As a shipper**, I want to view a full status history and timeline for each load (event type, timestamp, actor) so that I have an audit trail of exactly what happened and when.
- **As a trucker**, I want to view the status timeline of my active and historical loads so that I can see a clear record of the events for each haul.

## Cancellation with Reason

- **As a shipper**, I want to be required to provide a reason when cancelling a claimed load so that the trucker understands why their load was cancelled and the platform has a record.
- **As a trucker**, I want to see the cancellation reason in my notification and on the load detail page so that I have full context when a shipper cancels my active load.
- **As a trucker**, I want my active load slot to be freed immediately when a shipper cancels a claimed load so that I can claim a new load without delay.

## SMS Notifications (Optional)

- **As a user**, I want to opt in to SMS notifications for load status changes so that I receive alerts on my phone even when I don't have the app open.

## EIA Fuel Price Integration

- **As a trucker**, I want to see live regional diesel prices (Diesel West, Diesel South) in a market ticker so that I have current fuel cost data when evaluating load profitability.
- **As a trucker**, I want to see a week-over-week price delta indicator (color-coded: red = rising, green = falling) so that I can factor in fuel price trends when planning loads.
- **As a trucker**, I want the Load Profitability Analyzer to auto-populate a fuel surcharge from the current diesel price and estimated miles so that my profitability calculation uses real-world fuel costs without manual entry.
- **As a trucker**, I want to be able to override the auto-populated fuel surcharge so that I can adjust for my actual fuel cost if it differs from the regional average.
- **As a user**, I want to see a stale data indicator in the market ticker if diesel prices are more than 48 hours old so that I am never shown silently outdated fuel prices.
- **As the platform**, I want the EIA API key to be stored server-side and proxied through `GET /api/v1/market/diesel-prices` so that the key is never exposed to the browser.
- **As the platform**, I want the EIA response cached server-side with a 6-hour TTL so that repeated page loads don't exhaust the API quota and the app degrades gracefully during an EIA outage.
- **As the platform**, I want a single shared React Query store for diesel prices so that the CPM Calculator and Load Profitability Analyzer both read from the same cache with no duplicate API calls.
- **As the platform**, I want EIA attribution ("Data: U.S. EIA") displayed in the app's data sources section so that the platform complies with EIA Terms of Service.
