# US-883: Platform Health Alerting (Webhook)

**Story Type:** New Feature
**Status:** DONE
**Priority:** P1
**Persona:** Super User (platform ADMIN role) — but the "recipient" is outside the app (Slack/email)
**Scope:** BACKEND
**Depends On:** US-752 (Platform Health Metrics)
**Jira:** [FREIG-146](https://mdb-intergrated-logistics.atlassian.net/browse/FREIG-146)

---

## User Story

As the **platform operator**, I want to be notified (via Slack or email webhook) when platform health degrades past a threshold, so that I learn about a problem from the system instead of from a customer, without needing to keep the Health tab open and watch it.

---

## Background

Resolved via `/council-review` (2026-09-02): multiple council members (Contrarian, Logician, Expansionist) independently converged on the same point — the Health tab's real gap isn't a missing drill-down UI, it's that read-only telemetry with no alerting is "observability theater" for a solo operator who isn't going to sit and watch a dashboard. The Contrarian specifically recommended bolting a webhook onto existing metrics rather than building custom incident-tracking UI, which duplicates tools (Slack, PagerDuty) that already do this better.

---

## Business Rules

- BR-1: Uses the existing `PlatformHealthService` (US-752) metrics as the data source — no new metrics collection, just a threshold check against what's already computed.
- BR-2: Fires a webhook (Slack incoming-webhook URL or a generic HTTP POST, configurable via env var — matching this platform's existing external-integration pattern, e.g. `app.eia.*`/`app.hibp.*`) when backend health flips from healthy to unhealthy, or when the error-response rate crosses a configurable threshold.
- BR-3: Debounced — must not fire repeatedly for the same ongoing incident (e.g., re-notify at most once per N minutes while the unhealthy state persists, not on every poll).
- BR-4: No custom incident-log UI in this story — the webhook payload should include enough context (what changed, current metric values, timestamp) to be useful standalone in Slack/email without requiring the operator to open the dashboard.
- BR-5: Fail-open, matching `PlatformHealthService`'s existing design principle — if the webhook call itself fails, it must not take down health-check processing or throw an unhandled error into the health-check path.

---

## Acceptance Criteria

- AC-1: Given backend health flips from healthy to unhealthy, when the next health check runs, then a webhook fires with the current status and relevant metric values.
- AC-2: Given the unhealthy state persists across multiple health-check cycles, then the webhook does not re-fire on every cycle — it respects the debounce window.
- AC-3: Given health recovers to healthy after being unhealthy, then a recovery notification fires (so the operator knows it's resolved, not just that it broke).
- AC-4: Given the webhook URL is not configured (env var unset), then health checking continues to function normally with no errors — alerting is an optional add-on, not a hard dependency.
- AC-5: Given the webhook HTTP call itself fails (network error, non-2xx response), then this is logged but does not affect the health-check response returned to the dashboard.

---

## Field Contract Table

| Field | API Param | Config | Type | Required |
|-------|-----------|--------|------|----------|
| Webhook URL | N/A (server-side config) | `APP_HEALTH_ALERT_WEBHOOK_URL` env var | String | No (feature is optional if unset) |
| Debounce window | N/A (server-side config) | `app.health-alerting.debounce-minutes` (with default) | Integer | No |

---

## Platform Foundation Mapping

Actor: Platform/Super User (as notification recipient outside the app). Sequence: operational monitoring, not part of the load lifecycle.

---

## INVEST Self-Check

- [x] **Independent** — depends only on US-752's existing health metrics.
- [x] **Negotiable** — describes the trigger/debounce/recovery behavior, not exact payload format.
- [x] **Valuable** — turns passive metrics into an actual "tell me when something's wrong" tool.
- [x] **Estimable** — one webhook call, one debounce mechanism, reusing existing health data.
- [x] **Small** — no new UI, no new metrics collection.
- [x] **Testable** — AC-1 through AC-5 are concrete.

---

## Decision Log (Tier B — non-financial, BA autonomous, council-reviewed)

- **Webhook, not custom incident-log UI:** per the Contrarian's specific recommendation — Slack/PagerDuty already do this well; building a parallel incident-tracking system inside this dashboard would duplicate better-existing tools for no real gain at 13-tenant scale.
- **Optional/fail-open:** matches the platform's existing external-integration conventions (EIA, HIBP) and `PlatformHealthService`'s own fail-open design — alerting must never become a new source of instability.

---

## Approval

Approved by Mike, 2026-09-02, as part of the "Super User feature gaps" council-reviewed batch (US-880 through US-885).
