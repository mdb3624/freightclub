# US-761 / US-762 Reuse-First Audit (Backend)

Per the Reuse-First Mandate: every service/repository/entity below was checked against existing
infrastructure before deciding what to write. Findings carried into the PR description.

| Need | Existing candidate(s) checked | Verdict | Why |
|---|---|---|---|
| `dashboard-summary` aggregate query/RLS pattern | `LoadQueryService.getLoadStats()` (`backend/.../shipper/application/LoadQueryService.java:48-75`) | **Reused — RLS setup + count pattern** | `setTenantForRls()` (line 34-38, native `set_config('app.current_tenant', ...)`) and `countByTenantAndStatus` are the established pattern for tenant-scoped aggregates; `DashboardSummaryService` reuses both rather than inventing a new RLS bootstrap. |
| Active shipment count | `LoadRepository.countByTenantIdAndStatusAndDeletedAtIsNull` | **Reused as-is** | `activeShipments = OPEN + CLAIMED + IN_TRANSIT` via existing count methods — zero new repository surface for this metric. |
| Cost-per-mile / on-time % source data | `Load` entity (`domain/Load.java`) | **Fields present — confirmed via direct read** | `distanceMiles` (BigDecimal), `payRate`/`payRateType`, `deliveryFrom`/`deliveryTo`, `deliveredAt` all exist; no schema change needed — confirms the audit's original "new endpoint required" verdict was about the *aggregation*, not new columns. |
| Test pattern for read-only aggregate controller | `ShipperControllerTest` (`@SpringBootTest` + `@MockBean` service + `MockMvc`/`jsonPath`) | **Reused as-is** | Same `@WithMockUser(roles="SHIPPER")` + mocked-service + jsonPath assertion shape applies directly to `DashboardSummaryControllerTest`. |
| RLS migration pattern (if new table needed) | `V20260422_11__Setup_rls_and_roles.sql` | **Not needed** | US-761 is a pure read-aggregate over existing `loads`/`users` tables — no new persisted table, so no new RLS policy required. |
| Lane modeling for carrier search filter | `CarrierLaneEntity` / `CarrierLaneRepository` (`modules/carrier/infrastructure/`) | **Reused — join target identified** | `originRegion`/`destinationRegion` columns + composite index `idx_carrier_lanes_regions` already exist and are indexed for exactly this filter shape — confirms ARCH's "extend, don't fork" ruling from the original US-760 audit. |
| Carrier search query mechanism | `UserRepository.searchTruckers` (JPQL, `repository/UserRepository.java:21-36`) | **Extended, not duplicated** | Added an optional-param JPQL variant that LEFT JOINs `CarrierLaneEntity` and filters by region/equipment — same repository, same `User` aggregate root, no parallel query stack. |
| Search response DTO | `CarrierSearchResult` (`modules/carrier/application/CarrierSearchResult.java`) | **Contract mismatch found — new DTO added, existing one untouched** | ⚠️ `useCarrierSearch.ts:10-16` (lane-search hook) expects `{companyName, equipmentTypes: string[], onTimePct?}`, but the *existing* `CarrierSearchResult` (`firstName`/`lastName`/`equipmentType: String`) is the live contract for `AddCarrierModal.tsx`'s name/email search (US-707-v2). Reshaping the existing DTO would silently break that shipped consumer. Added a second, purpose-built `CarrierLaneSearchResult` record for the lane-search response rather than forcing one DTO to serve two divergent shapes — same service class and repository, new minimal result type. Logged as a CHG-worthy finding for LIBRARIAN: the frontend hook (`useCarrierSearch`) and the existing backend DTO drifted within the same US-760 story chain — worth a backlog note to prevent recurrence. |
| Search service pass-through | `CarrierSearchService` | **Reused — extended signature** | Added `origin`/`destination`/`equipmentType` parameters to the existing `searchCarriers` method rather than introducing a parallel `LaneSearchService`. |

## Net New Work (irreducible)
1. `DashboardSummaryService` + `DashboardSummaryController` (`GET /api/v1/shipper/dashboard-summary`) — no existing aggregation computes per-mile cost or on-time percentage from `Load` rows.
2. `searchTruckersByLane` JPQL query on `UserRepository` — optional-param lane/equipment filter joining `CarrierLaneEntity`, additive to the existing `searchTruckers`.
3. `CarrierSearchResult` field correction (`companyName`, `equipmentTypes: List<String>`, `originRegion`, `destinationRegion`, `onTimePct`) to reconcile the backend DTO with the already-shipped frontend contract.

## Audit Method
All claims verified by direct source reads (not inferred): `LoadQueryService.java`, `Load.java`,
`LoadRepository`, `ShipperControllerTest.java`, `CarrierLaneEntity.java`, `CarrierLaneRepository.java`,
`UserRepository.java`, `CarrierSearchService.java`, `CarrierSearchResult.java`,
`useDashboardSummary.ts`, `useCarrierSearch.ts` — consistent with `feedback_no_assumptions`.
