# Phase 7b — Advanced Financial Intelligence (Trucker)

Deepens the financial tooling introduced in Phase 1. Depends on Phase 5 (payments) for accurate per-load earnings data and Phase 3 (documents) for mileage records.

**Dependency:** Requires Phase 3 and Phase 5.

## Features

| Feature | Area | Notes |
|---------|------|-------|
| Per-load earnings log: actual miles driven, fuel used, net profit | Trucker | Stored after delivery confirmation |
| Weekly / monthly P&L report | Trucker | Revenue, costs, net profit over selectable period |
| IFTA mileage tracking by state | Trucker | Required for quarterly fuel tax filing |
| Deadhead mileage estimate (current location → pickup) | Trucker | Requires location permission; affects true CPM |
| Deadhead cost included in per-load profitability calculation | Trucker | Full cost = run cost + deadhead cost |
| Fuel surcharge (FSC) auto-calculation based on DOE national average | Trucker | Shown on load detail if shipper enables FSC |
| Annual earnings + tax summary export | Trucker | PDF/CSV; feeds into Schedule C preparation |
| Extract `trucker_cost_profiles` out of `users` table | Platform | Data migration of existing cost profile data; enables per-user cost history |
