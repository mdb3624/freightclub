# US-888: EIA Fuel Price — Background Refresh (Fail-Fast for the Synchronous Path)

**Type:** BUG_FIX (new) — reliability gap, no prior story covered this behavior
**Scope:** BACKEND_ONLY
**Persona:** Platform (affects Owner-Operator CPM calculator and the public market-price endpoint indirectly, no UI change)
**Depends on:** US-854 (original EIA integration)

## Actor + Value Statement

As the platform, I want `EiaFuelPriceService.getDieselPrices()` to never block a user-facing request thread on a live EIA fetch, so that a slow (not just down) EIA API cannot tie up request threads for up to a minute per call.

## Root Cause

`getDieselPrices()` is called synchronously from `MarketController` (a REST endpoint) and `CarrierCostProfileService` (the CPM calculation path used by the Owner-Operator cost profile / CPM calculator). On a cache miss or expiry, it calls `fetchWithRetry()`, which does 3 attempts at up to 20s each (5s connect + 15s read timeout) plus 1s/2s backoff sleeps — a worst case of ~63 seconds blocking the calling thread before the existing cache-fallback path is ever reached. The fallback-to-cache behavior itself is correct and already shipped (US-854); the problem is purely how slowly the synchronous path reaches it.

Found via direct code investigation (`backend/src/main/java/com/freightclub/service/EiaFuelPriceService.java:72-91`), not a production incident.

## Acceptance Criteria (Gherkin)

**AC1 — Steady state never blocks on network.**
```
Given the cache has a value (fresh or stale)
When getDieselPrices() is called
Then it returns the cached value immediately with no HTTP call made
```

**AC2 — Background refresh keeps the cache warm without blocking any caller.**
```
Given the scheduled refresh runs
When it succeeds
Then the cache is updated with the fresh value and timestamp
And no caller of getDieselPrices() was blocked waiting for it
```

**AC3 — Cold start is bounded, not a 63-second worst case.**
```
Given there is no cached value at all (e.g. app just started)
When getDieselPrices() is called
Then exactly one fetch attempt is made with a short timeout (no retry/backoff loop on this path)
And it returns unavailable() if that single attempt fails
```

**AC4 — Background refresh retains the existing retry/backoff behavior.**
```
Given the scheduled refresh's live fetch fails
When it retries
Then it uses the existing 3-attempt exponential backoff (unchanged) — since nothing user-facing is waiting on it, the cost of retrying there is free
```

## Out of Scope

- EIA/Jira are being treated as separate concerns per the `/council-review --debate` verdict on 2026-09-06 (see Sprint discussion) — this story is EIA only.
- No circuit-breaker library or generic resilience framework — this is a scoped timing fix, not new infrastructure.
- Claim-a-load double-submit idempotency (a separate, higher-priority UX finding from the same review) is tracked separately, not in this story.

## Field Contract Table

N/A — no new API surface, no new DB columns, no UI change. Existing `DieselPriceResponse` contract unchanged.

## Tier Decision Log

Tier B (technical implementation detail, no fee/compliance/legal exposure) — decided autonomously per BUSINESS_ANALYST.md §5-6, no Director escalation needed.
