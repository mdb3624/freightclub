# Phase 4 — Ratings & Reviews

Ratings are the trust layer that determines which loads get claimed and which truckers get repeat work. They unlock the carrier selection features in Phase 7. The shipper reputation model is particularly important — truckers use it to decide whether to claim before committing their one active load slot.

**Dependency:** Requires Phase 2 (load_events for post-delivery trigger). Unlocks Phase 5, Phase 7, Phase 8.

## Features

| Feature | Area | Notes |
|---------|------|-------|
| Trucker rates shipper after delivery | Trucker | 1–5 stars + optional comment |
| Shipper rates trucker after delivery | Shipper | 1–5 stars + optional comment |
| Aggregate rating displayed on trucker profile | Trucker | Visible to shippers browsing claimed loads |
| Shipper public reputation profile | Shipper | Overall rating, avg payment speed (e.g. "Typically pays in 7 days"), completed load count, dispute/cancellation flags |
| Shipper reputation badge on load board cards | Trucker | Visible before claiming — star rating + payment speed |
| Rating history page (own ratings received) | Both | |
