# User Stories — Phase 6: In-App Messaging

## Per-Load Message Thread

- **As a trucker**, I want to message the shipper directly within the platform after claiming a load so that I can ask questions and coordinate without exchanging personal phone numbers or using outside tools.
- **As a shipper**, I want to message the assigned trucker directly within the platform so that all communication is tied to the load and visible in one place.
- **As a user**, I want the message thread to only be accessible after the load is claimed so that messaging is scoped to confirmed working relationships.
- **As a user**, I want the full message history for a load to remain visible after delivery so that I can reference prior communication if a dispute arises.

## Real-Time Delivery

- **As a user**, I want new messages to appear in real time (via WebSocket or SSE) without refreshing the page so that conversation flows naturally and I don't miss time-sensitive updates.
- **As the platform**, I want messaging to fall back to polling if a WebSocket connection cannot be established so that the feature works reliably across all network conditions.

## Notifications

- **As a user**, I want to see an unread message badge on my dashboard so that I know immediately when the other party has replied.
- **As a user**, I want to receive an email notification when I receive a new message so that I am alerted even when I'm not actively using the app.
- **As a user**, I want in-app notifications for new messages to appear in the notification bell alongside status change notifications so that I have a single place to check for all activity.
