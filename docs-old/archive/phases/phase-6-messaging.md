# Phase 6 — In-App Messaging

Direct communication between shipper and trucker reduces off-platform dependency and keeps context in the load record.

**Dependency:** Requires Phase 1.2. Independent of Phases 2–5.

## Features

| Feature | Area | Notes |
|---------|------|-------|
| Per-load message thread (shipper ↔ trucker) | Both | Only visible after load is claimed |
| Real-time delivery (WebSocket or SSE) | Platform | Falls back to polling |
| Unread message badge on dashboard | Both | |
| Message notification (email + in-app) | Both | |
