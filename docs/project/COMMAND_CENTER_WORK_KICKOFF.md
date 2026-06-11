# Command Center Dashboard: Work Kickoff Plan

**Status:** Ready to Schedule  
**Total Effort:** 8 days (Phase 7 sprint)  
**Stories:** 12 user stories + 1 spike  
**Start Date:** 2026-06-16 (After BA NFR sign-off + old work archived)  
**Delivery Date:** 2026-06-27  
**Authority:** SDLC_GOVERNANCE_ALL_ROLES.md

---

## Work Breakdown Structure (WBS)

### Phase 1: Domain Layer (2 days)

| Story | Title | Type | Effort | Dependencies | CODER | REVIEWER |
|-------|-------|------|--------|--------------|-------|----------|
| **US-800** | Create Domain Value Objects (Money, Percentage) | Task | 1d | None | CODER | REVIEWER |
| **US-801** | Create Domain Calculators (OnTimeRate, CostPerMile) | Task | 1d | US-800 | CODER | REVIEWER |

**Cumulative effort:** 2 days

---

### Phase 2: Repository Port Design (0.5 days)

| Story | Title | Type | Effort | Dependencies | ARCHITECT |
|-------|-------|------|--------|--------------|-----------|
| **US-802** | Design ShipmentDashboardRepository Port | Spike | 0.5d | US-801 | ARCHITECT |

**Cumulative effort:** 2.5 days

---

### Phase 3: Infrastructure Implementation (1.5 days)

| Story | Title | Type | Effort | Dependencies | CODER | REVIEWER |
|-------|-------|------|--------|--------------|-------|----------|
| **US-803** | Implement ShipmentDashboardRepositoryImpl (JPA) | Task | 1d | US-802 | CODER | REVIEWER |
| **US-804** | Create Flyway Migration: Dashboard Indexes | Task | 0.5d | US-803 | CODER | REVIEWER |

**Cumulative effort:** 4 days

---

### Phase 4: Application Service (1 day)

| Story | Title | Type | Effort | Dependencies | CODER | REVIEWER |
|-------|-------|------|--------|--------------|-------|----------|
| **US-805** | Create GetDashboardSummaryUseCase | Task | 1d | US-803 | CODER | REVIEWER |

**Cumulative effort:** 5 days

---

### Phase 5: API Endpoint (0.5 days)

| Story | Title | Type | Effort | Dependencies | CODER | REVIEWER |
|-------|-------|------|--------|--------------|-------|----------|
| **US-806** | Create DashboardController REST Endpoint | Task | 0.5d | US-805 | CODER | REVIEWER |

**Cumulative effort:** 5.5 days

---

### Phase 6: Caching & Observability (1 day)

| Story | Title | Type | Effort | Dependencies | CODER | REVIEWER |
|-------|-------|------|--------|--------------|-------|----------|
| **US-807** | Add @Cacheable & Cache Invalidation Events | Task | 0.5d | US-806 | CODER | REVIEWER |
| **US-808** | Setup Datadog Observability & Alerts | Task | 0.5d | US-806 | CODER | REVIEWER |

**Cumulative effort:** 6.5 days

---

### Phase 7: Testing & Integration (1.5 days)

| Story | Title | Type | Effort | Dependencies | CODER | REVIEWER |
|-------|-------|------|--------|--------------|-------|----------|
| **US-809** | Write Integration Tests (Repository + Controller) | Task | 0.75d | US-808 | CODER | REVIEWER |
| **US-810** | Performance Testing & Load Validation | Task | 0.5d | US-809 | CODER | REVIEWER |
| **US-811** | Archive Old Work & Final Documentation | Task | 0.25d | All | CODER | LIBRARIAN |

**Cumulative effort:** 8 days

---

## Sprint Schedule

### Sprint: Command Center Dashboard KPI (Phase 7 Deliverable)

**Sprint Window:** 2026-06-16 → 2026-06-27 (10 business days)

**Daily Breakdown:**

```
Week 1:
MON 2026-06-16  — US-800, US-801 (Domain layer)
TUE 2026-06-17  — US-801 (continued), US-802 starts
WED 2026-06-18  — US-803 (Repository impl)
THU 2026-06-19  — US-803, US-804 (Indexes)
FRI 2026-06-20  — US-804, US-805 (Application service)

Week 2:
MON 2026-06-23  — US-805, US-806 (Endpoint)
TUE 2026-06-24  — US-807, US-808 (Caching + observability)
WED 2026-06-25  — US-809 (Integration tests)
THU 2026-06-26  — US-810 (Performance tests)
FRI 2026-06-27  — US-811 (Cleanup + close-out)
```

### Parallel Workstreams

**If team has multiple engineers:**

```
Engineer A (CODER):           Engineer B (CODER):
MON: US-800                   MON: (blocked, waiting for 800)
TUE: US-801                   TUE: US-802 spike
WED: US-803                   WED: (wait for 803)
THU: US-804                   THU: US-805
FRI: US-805                   FRI: US-806
MON: US-807                   MON: US-808
TUE: US-809                   TUE: US-810
WED: US-811                   WED: (wrap-up)
```

---

## Story Details (READY_FOR_DESIGN Gate Format)

Each story below follows the **BA Input Acceptance Gate** checklist and is ready for ARCHITECT review.

### US-800: Create Domain Value Objects (Money, Percentage)

**Actor:** Developer (CODER)  
**Value:** Enable domain calculations without Spring/JPA dependencies

**User Story:**
As a developer implementing the Command Center KPI metrics, I need value objects for Money (currency with precision) and Percentage (0-100 with rounding), so that domain services can perform calculations without worrying about primitive type safety or null handling.

**Acceptance Criteria:**

```gherkin
Feature: Domain Value Objects

  Scenario: Money value object handles decimal precision
    Given a Money value object with amount 2.45 and currency "USD"
    When I convert to decimal
    Then the result has exactly 2 decimal places

  Scenario: Percentage handles boundary values
    Given a Percentage value object with value 0
    When I ask for displayString
    Then the result is "0.0%"

  Scenario: Percentage prevents invalid values
    Given a Percentage constructor
    When I try to create with value -1
    Then it raises InvalidPercentageException

  Scenario: Money supports arithmetic
    Given Money(10.00) and Money(20.00)
    When I add them
    Then the result is Money(30.00)
```

**Contract Table:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Money.amount | BigDecimal | Yes | 2 decimal precision |
| Money.currency | String | Yes | ISO code (USD, etc.) |
| Percentage.value | Double | Yes | 0-100 |
| Percentage.displayString | String | Yes | Formatted as "XX.X%" |

**Scope:** BACKEND_ONLY

**Size:** 1 day (8 hours)

**Effort Breakdown:**
- Create Money class: 2h
- Create Percentage class: 2h
- Unit tests (16 tests): 3h
- Code review + feedback: 1h

**Definition of Done:**
- [ ] Money and Percentage classes created in `/domain/`
- [ ] Zero Spring/JPA imports
- [ ] 16 unit tests passing (100% coverage)
- [ ] No nullability issues (use Optional or non-null contracts)
- [ ] CODER sign-off: "Ready for review"

---

### US-801: Create Domain Calculators (OnTimeRate, CostPerMile)

**Actor:** Developer (CODER)  
**Value:** Encapsulate KPI calculation logic in domain services

**User Story:**
As a developer, I need domain services to calculate on-time delivery rate and estimated cost per mile, so that these business metrics are centralized, testable, and independent of the database or HTTP layer.

**Acceptance Criteria:**

```gherkin
Feature: Domain Calculators

  Scenario: OnTimeRateCalculator handles happy path
    Given 20 delivered loads
    And 16 delivered on-time
    When I call calculate()
    Then the result is Percentage(80.0)

  Scenario: OnTimeRateCalculator handles zero loads
    Given 0 delivered loads
    When I call calculate()
    Then the result is Percentage(0)

  Scenario: CostPerMileCalculator normalizes FLAT_RATE
    Given load with payRate=500.00, payRateType=FLAT_RATE, distance=250 miles
    When I call calculate()
    Then the result is Money(2.00)

  Scenario: CostPerMileCalculator averages multiple loads
    Given 3 loads: $2/mi, $3/mi, $1/mi
    When I call calculate()
    Then the result is Money(2.00)

  Scenario: CostPerMileCalculator excludes incomplete loads
    Given 3 loads: 2 complete, 1 missing deliveredAt
    When I call calculate()
    Then the result uses only 2 loads in average
```

**Contract Table:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| DeliveredLoad.id | String | Yes | Identifier |
| DeliveredLoad.payRate | BigDecimal | Yes | Base rate |
| DeliveredLoad.payRateType | Enum | Yes | FLAT_RATE or PER_MILE |
| DeliveredLoad.distanceMiles | BigDecimal | Yes | Distance |
| DeliveredLoad.deliveredAt | LocalDateTime | Yes | Completion time |

**Scope:** BACKEND_ONLY

**Size:** 1 day (8 hours)

**Effort Breakdown:**
- Create OnTimeRateCalculator: 2h
- Create CostPerMileCalculator: 2h
- Unit tests (16 tests): 3h
- Code review + feedback: 1h

**Definition of Done:**
- [ ] Both calculators in `/domain/` (no Spring imports)
- [ ] 16 unit tests passing (100% coverage)
- [ ] Handles edge cases: 0 loads, null values, type mismatches
- [ ] Uses Money and Percentage value objects from US-800
- [ ] CODER sign-off: "Ready for review"

---

### US-802: Design ShipmentDashboardRepository Port

**Actor:** Architect (ARCHITECT)  
**Value:** Define clean contract between application and infrastructure layers

**User Story:**
As an architect, I need to design the ShipmentDashboardRepository port interface so that the application service can fetch KPI data without depending on Spring Data JPA or any infrastructure frameworks.

**Acceptance Criteria:**

```gherkin
Feature: Repository Port Design

  Scenario: Port interface specifies required methods
    Given ShipmentDashboardRepository interface
    When I review the methods
    Then I find:
      - countActiveShipments(tenantId: String): Long
      - findDeliveredShipmentsForTenant(tenantId: String): List<DeliveredShipment>
      - countByStatus(tenantId: String): Map<LoadStatus, Long>

  Scenario: DeliveredShipment projection is lightweight
    Given DeliveredShipment record
    When I inspect fields
    Then I find only: id, deliveredAt, deliveryTo, payRate, payRateType, distanceMiles
    And NO Spring Data annotations

  Scenario: Port is Spring-agnostic
    Given ShipmentDashboardRepository interface
    When I analyze imports
    Then NO org.springframework.* or jakarta.persistence.* imports
```

**Contract Table:**

| Interface | Method | Input | Output |
|-----------|--------|-------|--------|
| ShipmentDashboardRepository | countActiveShipments | tenantId: String | Long |
| ShipmentDashboardRepository | findDeliveredShipmentsForTenant | tenantId: String | List<DeliveredShipment> |
| ShipmentDashboardRepository | countByStatus | tenantId: String | Map<LoadStatus, Long> |

**Scope:** BACKEND_ONLY

**Size:** 0.5 days (4 hours)

**Effort Breakdown:**
- Define interface: 1.5h
- Create DeliveredShipment projection: 1h
- Document usage: 1h
- Peer review: 0.5h

**Definition of Done:**
- [ ] Interface created in `/application/ports/out/`
- [ ] Projection record created (lightweight, no ORM annotations)
- [ ] Zero Spring/JPA imports
- [ ] Methods documented (JavaDoc)
- [ ] ARCHITECT sign-off: "Ready for implementation"

---

### US-803: Implement ShipmentDashboardRepositoryImpl (JPA)

**Actor:** Developer (CODER)  
**Value:** Provide JPA implementation of repository port with optimized queries

**User Story:**
As a developer, I need to implement the ShipmentDashboardRepository interface using Spring Data JPA and EntityManager, so that the application can fetch KPI data efficiently from the database with proper multi-tenancy filtering.

**Acceptance Criteria:**

```gherkin
Feature: Repository Implementation

  Scenario: Count active shipments uses single query
    Given tenant_id = "acme-corp"
    When I call countActiveShipments("acme-corp")
    Then exactly 1 database query is executed
    And the query filters: status IN (OPEN, CLAIMED, IN_TRANSIT) AND deleted_at IS NULL

  Scenario: Delivered shipments fetch uses projection
    Given tenant_id = "acme-corp"
    When I call findDeliveredShipmentsForTenant("acme-corp")
    Then the query projects only: id, delivered_at, delivery_to, pay_rate, pay_rate_type, distance_miles
    And full Load entities are NOT hydrated

  Scenario: Results respect soft-delete filtering
    Given 10 loads: 8 active, 2 deleted (deleted_at IS NOT NULL)
    When I call countActiveShipments() or findDelivered()
    Then results exclude the 2 deleted loads

  Scenario: Multi-tenancy isolation enforced
    Given Tenant A: 5 loads, Tenant B: 3 loads
    When I call countActiveShipments("tenant-a")
    Then the result is 5 (not 8)
    And Tenant B data is not accessible
```

**Contract Table:**

| Method | Query Type | Performance Target | Cacheability |
|--------|-----------|-------------------|--------------|
| countActiveShipments | COUNT | < 50ms | @Cacheable (5min TTL) |
| findDeliveredShipmentsForTenant | SELECT projection | < 500ms | @Cacheable (5min TTL) |
| countByStatus | GROUP BY | < 100ms | @Cacheable (5min TTL) |

**Scope:** BACKEND_ONLY

**Size:** 1 day (8 hours)

**Effort Breakdown:**
- Implement countActiveShipments: 1.5h
- Implement findDeliveredShipmentsForTenant: 2h
- Implement countByStatus: 1h
- Integration tests (6 tests): 2h
- Code review + feedback: 1.5h

**Definition of Done:**
- [ ] All 3 methods implemented using JPA/EntityManager
- [ ] Queries use projections (no full entity hydration)
- [ ] Soft-delete filtering verified (deletedAt IS NULL)
- [ ] Multi-tenancy isolation verified (different tenants get different data)
- [ ] 6 integration tests passing (test with real database)
- [ ] SQL queries logged and verified (no N+1 queries)
- [ ] CODER sign-off: "Ready for review"

---

### US-804: Create Flyway Migration: Dashboard Indexes

**Actor:** Developer (CODER)  
**Value:** Create database indexes for KPI query performance

**User Story:**
As a developer, I need to create a Flyway migration that adds composite indexes on the loads table, so that the KPI dashboard queries (countActive, findDelivered) execute efficiently even on large datasets.

**Acceptance Criteria:**

```gherkin
Feature: Dashboard Indexes

  Scenario: Composite index supports active shipment count
    Given loads table with 100K rows
    When I execute: SELECT COUNT(*) FROM loads WHERE tenant_id=? AND status IN (...) AND deleted_at IS NULL
    Then the query uses index: idx_loads_tenant_status_soft_delete
    And execution time is < 50ms

  Scenario: Index covers all KPI queries
    Given index: (tenant_id, status, deleted_at)
    When I execute various COUNT/SELECT queries
    Then all queries use the index (verified with EXPLAIN ANALYZE)

  Scenario: Migration is idempotent
    Given migration: V###__create_dashboard_indexes.sql
    When I run the migration twice
    Then no "already exists" error on second run
    And the migration is idempotent (uses IF NOT EXISTS)
```

**Contract Table:**

| Index Name | Columns | Purpose |
|------------|---------|---------|
| idx_loads_tenant_status_soft_delete | (tenant_id, status, deleted_at) | Active count + delivered fetch |

**Scope:** BACKEND_ONLY

**Size:** 0.5 days (4 hours)

**Effort Breakdown:**
- Write Flyway migration: 1.5h
- Test migration (apply and verify): 1.5h
- Verify with EXPLAIN ANALYZE: 1h

**Definition of Done:**
- [ ] Flyway migration created: V###__create_dashboard_indexes.sql
- [ ] Migration uses IF NOT EXISTS (idempotent)
- [ ] Index created successfully on local/staging database
- [ ] EXPLAIN ANALYZE confirms index usage
- [ ] Migration rollback script tested
- [ ] CODER sign-off: "Ready for review"

---

### US-805: Create GetDashboardSummaryUseCase

**Actor:** Developer (CODER)  
**Value:** Orchestrate domain + repository for KPI summary

**User Story:**
As a developer, I need to create the GetDashboardSummaryUseCase application service that orchestrates domain calculators and repository calls, so that the API endpoint can fetch KPI metrics with clean separation of concerns.

**Acceptance Criteria:**

```gherkin
Feature: Use Case Orchestration

  Scenario: Use case fetches KPIs successfully
    Given shipper tenant with completed loads
    When I call useCase.getSummary()
    Then the result contains:
      - activeShipmentCount (integer)
      - onTimeRate (Percentage)
      - costPerMile (Money)

  Scenario: Use case handles pricing engine failure gracefully
    Given pricingEngine service fails (500 error)
    When I call getSummary()
    Then cached pricing is used (fallback)
    And result is still returned (not null)

  Scenario: Use case respects tenant isolation
    Given Tenant A and Tenant B
    When Tenant A calls getSummary()
    Then results are scoped to Tenant A only
    And Tenant B data is not leaked

  Scenario: Use case wraps errors in custom exception
    Given repository throws SQLException
    When I call getSummary()
    Then a DashboardQueryException is raised
    And error message is non-technical (security)
```

**Contract Table:**

| Component | Input | Output | Error |
|-----------|-------|--------|-------|
| GetDashboardSummaryUseCase.getSummary() | (none; uses TenantContextHolder) | DashboardSummaryResponse | DashboardQueryException |

**Scope:** BACKEND_ONLY

**Size:** 1 day (8 hours)

**Effort Breakdown:**
- Create use case class: 1.5h
- Inject dependencies: 1h
- Implement getSummary() logic: 1.5h
- Unit tests (12 tests): 2.5h
- Code review + feedback: 1.5h

**Definition of Done:**
- [ ] Use case created in `/application/`
- [ ] Injects ShipmentDashboardRepository (via constructor)
- [ ] Calls OnTimeRateCalculator and CostPerMileCalculator (domain services)
- [ ] 12 unit tests passing
- [ ] TenantContextHolder integration verified
- [ ] Error handling wrapped in DashboardQueryException
- [ ] CODER sign-off: "Ready for review"

---

### US-806: Create DashboardController REST Endpoint

**Actor:** Developer (CODER)  
**Value:** Expose KPI metrics via REST API

**User Story:**
As a shipper user, I need a REST endpoint that returns my dashboard KPI metrics (active shipments, on-time rate, cost/mile), so that my dashboard can display real-time operational metrics.

**Acceptance Criteria:**

```gherkin
Feature: Dashboard Endpoint

  Scenario: Endpoint returns KPI metrics successfully
    Given authenticated shipper user
    When I call GET /api/v1/shipper/dashboard-summary
    Then I receive HTTP 200 OK
    And the response contains:
      - activeShipments { value, unit, label }
      - estimatedCostPerMile { value, unit, label }
      - onTimeCarrierPct { value, unit, label }

  Scenario: Endpoint enforces authentication
    Given unauthenticated user
    When I call GET /api/v1/shipper/dashboard-summary without auth token
    Then I receive HTTP 401 Unauthorized

  Scenario: Endpoint sets Cache-Control headers
    Given successful KPI fetch
    When I check response headers
    Then Cache-Control = "public, max-age=300"

  Scenario: Endpoint returns appropriate error on failure
    Given repository throws exception
    When I call GET /api/v1/shipper/dashboard-summary
    Then I receive HTTP 500 Internal Server Error
    And response body contains generic error message (not technical details)
```

**Contract Table:**

| Field | Type | Required | Example |
|-------|------|----------|---------|
| activeShipments.value | Long | Yes | 12 |
| activeShipments.unit | String | No | null |
| activeShipments.label | String | Yes | "Active Shipments" |
| estimatedCostPerMile.value | Double | Yes | 2.45 |
| estimatedCostPerMile.unit | String | Yes | "$" |
| onTimeCarrierPct.value | Double | Yes | 94.5 |
| onTimeCarrierPct.unit | String | Yes | "%" |

**Scope:** BACKEND_ONLY

**Size:** 0.5 days (4 hours)

**Effort Breakdown:**
- Create DashboardController: 1h
- Add @PreAuthorize annotation: 0.5h
- Configure Cache-Control headers: 0.5h
- Integration tests (4 tests): 1.5h

**Definition of Done:**
- [ ] Controller created in `/infrastructure/rest/`
- [ ] Endpoint: GET /api/v1/shipper/dashboard-summary
- [ ] @PreAuthorize("hasRole('SHIPPER')") enforced
- [ ] Cache-Control headers set (max-age=300)
- [ ] 4 integration tests passing
- [ ] Error responses are non-technical
- [ ] CODER sign-off: "Ready for review"

---

### US-807: Add @Cacheable & Cache Invalidation Events

**Actor:** Developer (CODER)  
**Value:** Reduce database queries via caching

**User Story:**
As a developer, I need to add @Cacheable decorators to repository methods and event-driven cache invalidation, so that repeated dashboard loads within the 5-minute cache window don't hit the database.

**Acceptance Criteria:**

```gherkin
Feature: Caching

  Scenario: Repository methods are cached
    Given shipper loads first dashboard
    When shipper reloads dashboard within 5 minutes
    Then no database query is executed (cache hit)
    And response is returned from cache (< 10ms)

  Scenario: Cache is evicted on load status change
    Given cached active shipment count = 5
    When a load status changes (e.g., OPEN → CLAIMED)
    Then LoadStatusChangedEvent is published
    And cache is evicted via @CacheEvict
    And next request fetches fresh data from database

  Scenario: Cache TTL expires after 5 minutes
    Given cached data from 5:00 PM
    When current time is 5:06 PM
    Then cache is expired
    And next request queries database (fresh data)

  Scenario: Cache is tenant-scoped
    Given Tenant A cache and Tenant B cache
    When Tenant A reloads dashboard
    Then only Tenant A cache is hit
    And Tenant B cache is untouched
```

**Contract Table:**

| Cache Name | TTL | Key | Eviction Trigger |
|-----------|-----|-----|------------------|
| dashboard-active-count | 5min | tenantId | LoadStatusChangedEvent |
| dashboard-delivered | 5min | tenantId | LoadStatusChangedEvent |
| dashboard-status-counts | 5min | tenantId | LoadStatusChangedEvent |

**Scope:** BACKEND_ONLY

**Size:** 0.5 days (4 hours)

**Effort Breakdown:**
- Add @Cacheable to repository methods: 1h
- Create event listener for cache eviction: 1.5h
- Integration tests (4 tests): 1h
- Code review + feedback: 0.5h

**Definition of Done:**
- [ ] All 3 repository methods decorated with @Cacheable
- [ ] Cache names defined in application.yml (caffeine or redis)
- [ ] TTL set to 300 seconds (5 minutes)
- [ ] LoadStatusChangedEventListener created
- [ ] @CacheEvict triggers on load status change
- [ ] 4 integration tests passing (cache hit/miss verified)
- [ ] CODER sign-off: "Ready for review"

---

### US-808: Setup Datadog Observability & Alerts

**Actor:** Developer (CODER)  
**Value:** Monitor KPI dashboard performance and failures

**User Story:**
As an engineer, I need to emit telemetry events to Datadog and configure alerts, so that when the pricing engine fails or queries are slow, the team is notified immediately.

**Acceptance Criteria:**

```gherkin
Feature: Observability & Alerts

  Scenario: Pricing engine failure triggers alert
    Given pricingEngine API returns 500
    When fallback to cached quotes occurs
    Then TelemetryEvent is emitted with severity="warning"
    And Datadog alert is sent to Slack #incidents

  Scenario: Slow queries trigger warning
    Given query execution time > 2 seconds
    When query completes
    Then TelemetryEvent is emitted with severity="warning"
    And logged to Datadog (not alerted, reviewed in standup)

  Scenario: Soft delete without audit is flagged
    Given load is deleted without audit entry
    When deletion occurs
    Then TelemetryEvent is emitted with severity="error"
    And PagerDuty escalation triggered

  Scenario: Datadog dashboard displays metrics
    Given configured Datadog dashboard
    When I view dashboard
    Then I see:
      - Query execution time (p50, p95, p99)
      - Cache hit rate (%)
      - Error rate by endpoint
      - Alert status (critical/warning)
```

**Contract Table:**

| Event | Severity | Destination | Alerting |
|-------|----------|-------------|----------|
| pricing.engine.fallback | WARNING | Datadog | Slack #incidents |
| query.timeout | WARNING | Datadog | No alert (standup review) |
| soft_delete.audit_missing | ERROR | Datadog | PagerDuty |

**Scope:** BACKEND_ONLY

**Size:** 0.5 days (4 hours)

**Effort Breakdown:**
- Create TelemetryClient: 1h
- Emit events from repository/use case: 1h
- Setup Datadog integration: 1h
- Configure alerts + dashboard: 1h

**Definition of Done:**
- [ ] TelemetryClient created (interfaces with Datadog SDK)
- [ ] Telemetry events emitted from repository methods
- [ ] Datadog integration configured (API key in env vars)
- [ ] Slack webhook configured for critical alerts
- [ ] Datadog dashboard created (metrics + trends)
- [ ] Alerts tested (manual trigger to verify notification)
- [ ] CODER sign-off: "Ready for review"

---

### US-809: Write Integration Tests (Repository + Controller)

**Actor:** Developer (CODER)  
**Value:** Verify KPI dashboard works end-to-end

**User Story:**
As a QA engineer, I need integration tests that verify the repository queries and API endpoint work correctly, so that we can be confident the KPI dashboard functions as designed.

**Acceptance Criteria:**

```gherkin
Feature: Integration Tests

  Scenario: Repository integrates with test database
    Given test database with 20 loads
    When I call countActiveShipments()
    Then the result matches expected count
    And soft-delete filtering is verified

  Scenario: Use case integrates calculators correctly
    Given delivered loads in test database
    When I call getSummary()
    Then on-time rate is calculated correctly
    And cost-per-mile is calculated correctly

  Scenario: Controller endpoint returns correct response shape
    Given authenticated test user
    When I call GET /api/v1/shipper/dashboard-summary
    Then response matches DashboardSummaryResponse contract
    And all required fields are present

  Scenario: Cache invalidation works end-to-end
    Given dashboard loaded (cached)
    When load status changes
    Then cache is evicted
    And next request fetches fresh data
```

**Contract Table:**

| Test | Type | Coverage | Expected Result |
|------|------|----------|-----------------|
| Repository query correctness | Integration | 6 scenarios | All pass |
| Use case orchestration | Integration | 4 scenarios | All pass |
| Controller response shape | Integration | 3 scenarios | All pass |
| Cache invalidation | Integration | 2 scenarios | All pass |

**Scope:** BACKEND_ONLY

**Size:** 0.75 days (6 hours)

**Effort Breakdown:**
- Setup test database & fixtures: 1h
- Write repository integration tests: 1.5h
- Write controller integration tests: 1.5h
- Write cache invalidation tests: 1h
- Debug failing tests: 1h

**Definition of Done:**
- [ ] 15 integration tests created (repository + controller + cache)
- [ ] All tests use @SpringBootTest (real database)
- [ ] Test database seeded with realistic data
- [ ] All tests passing (0 failures)
- [ ] Coverage verified with JaCoCo
- [ ] CODER sign-off: "Ready for review"

---

### US-810: Performance Testing & Load Validation

**Actor:** Developer (CODER)  
**Value:** Verify KPI dashboard meets performance targets

**User Story:**
As a performance engineer, I need to run load tests against the KPI dashboard endpoints, so that we can confirm the system handles 100+ concurrent dashboard loads without degradation.

**Acceptance Criteria:**

```gherkin
Feature: Performance Testing

  Scenario: Query executes within target time under load
    Given 100 concurrent shipper users
    When each loads dashboard
    Then avg query time < 100ms
    And p95 < 500ms
    And p99 < 1000ms

  Scenario: Cache hit rate exceeds target
    Given 100 concurrent users, 5-minute session
    When first 10 users load dashboard
    And next 90 users load within 5 minutes
    Then cache hit rate > 80%

  Scenario: No N+1 queries in load test
    Given JPA query logging enabled
    When 100 concurrent loads execute
    Then total queries = 100 (not 1000+)
    And verification: exactly 1 COUNT + 1 SELECT per request

  Scenario: Memory usage stays constant
    Given test running for 10 minutes
    When query load generated
    Then heap memory stable (no memory leak)
    And GC pause time < 100ms
```

**Contract Table:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| Query latency (p50) | < 100ms | Local test |
| Query latency (p95) | < 500ms | Local test |
| Cache hit rate | > 80% | After warmup |
| Memory stability | Stable | 10-min test |

**Scope:** BACKEND_ONLY

**Size:** 0.5 days (4 hours)

**Effort Breakdown:**
- Setup JMeter or k6 load test: 1h
- Run load test scenarios: 1.5h
- Analyze results & tune if needed: 1.5h

**Definition of Done:**
- [ ] Load test script created (100 concurrent users)
- [ ] Load test executed successfully
- [ ] Results meet performance targets
- [ ] Query analysis verified (no N+1 queries)
- [ ] Memory profile stable (no leaks)
- [ ] Results documented in PR
- [ ] CODER sign-off: "Ready for review"

---

### US-811: Archive Old Work & Final Documentation

**Actor:** Developer (CODER)  
**Value:** Clean up old dashboard code and finalize deliverables

**User Story:**
As a developer, I need to archive the old dashboard implementation and create final documentation, so that the codebase is clean and future developers understand what was replaced and why.

**Acceptance Criteria:**

```gherkin
Feature: Archival & Documentation

  Scenario: Old dashboard code is archived
    Given old ShipperDashboard.tsx and related files
    When I move to /archive directory
    Then files are preserved in git history
    And marked as deprecated in README

  Scenario: Design specs are archived
    Given old design v1.0 documents
    When I move to docs/archive/
    Then docs are preserved
    And referenced in ARCHIVED_WORK.md

  Scenario: Final documentation is complete
    Given Command Center implementation
    When I create deployment guide
    Then it includes:
      - How to enable/disable via feature flag
      - Datadog dashboard link
      - Alerting configuration
      - Rollback procedure

  Scenario: Story_Map.md is updated
    Given all 11 stories completed
    When I update Story_Map.md
    Then all 11 stories marked DONE with commit hash
    And linked to Phase 7 deliverable
```

**Contract Table:**

| Document | Location | Purpose |
|----------|----------|---------|
| ARCHIVED_WORK.md | docs/ | Tracks what was replaced |
| DEPLOYMENT_GUIDE.md | docs/command-center/ | How to deploy KPI dashboard |
| Story_Map.md | docs/project/ | Master story index (updated) |

**Scope:** FULL_STACK

**Size:** 0.25 days (2 hours)

**Effort Breakdown:**
- Move files to /archive: 0.5h
- Create ARCHIVED_WORK.md: 0.5h
- Create deployment guide: 0.5h
- Update Story_Map.md: 0.5h

**Definition of Done:**
- [ ] Old code moved to /archive with deprecation notes
- [ ] Old docs archived to docs/archive/
- [ ] ARCHIVED_WORK.md created (tracks what/why/when)
- [ ] Deployment guide created
- [ ] Story_Map.md updated with all 11 stories + Phase 7 completion date
- [ ] README.md updated (references new KPI dashboard)
- [ ] LIBRARIAN sign-off: "Story complete"

---

## Parallel Dependencies & Critical Path

```
US-800 (Domain Value Objects)
  ↓
US-801 (Domain Calculators) — blocks US-802 (critical path)
  ↓
US-802 (Repository Port) — blocks US-803 (critical path)
  ↓
US-803 (Repository Impl) — blocks US-805, US-807 (critical path)
  ├→ US-804 (Flyway migration) — parallel, ready after US-803 starts
  ├→ US-805 (Use case) — blocks US-806
  │   ↓
  │   US-806 (Controller) — blocks US-807, US-808
  │   ├→ US-807 (Caching) — blocks US-809 (critical path)
  │   ├→ US-808 (Observability) — parallel
  │   ├→ US-809 (Integration tests) — blocks US-810
  │   │   ↓
  │   │   US-810 (Performance tests)
  │   │     ↓
  │   └→ US-811 (Archive & docs)
```

**Critical Path Length:** 8 days (no slack)  
**Parallelization Opportunities:** US-804, US-808, US-809, US-810 can overlap

---

## Team Assignments (Assuming 1-2 Engineers)

### Single Engineer (1 CODER):
Follow the sprint schedule exactly (8 days, sequential).

### Two Engineers (CODER A + CODER B):
```
A: US-800 → US-801 → US-803 → US-805 → US-807 → US-809 → US-811
B: (wait) → (wait) → US-804 → US-806 → US-808 → US-810
```

Estimated parallel compression: 8 days → 5 days

---

## Immediate Action Items (Next 24 Hours)

### Step 1: BA Team Sign-Off (By EOD 2026-06-09)
- [ ] Review COMMAND_CENTER_BA_SIGN_OFF.md
- [ ] Confirm all 7 decisions locked (Concurrency, Pricing, Accessibility, etc.)
- [ ] Reply with thumbs-up confirmation

### Step 2: Archive Old Work (2026-06-16)
- [ ] Create `/archive` directory
- [ ] Move `frontend/src/pages/ShipperDashboard.tsx` → `/archive/`
- [ ] Move old design docs → `docs/archive/`
- [ ] Create `docs/ARCHIVED_WORK.md` with explanation
- [ ] Commit: "chore: archive old dashboard before Command Center pivot"

### Step 3: Create Story Files (2026-06-16)
- [ ] Create `docs/business/stories/US-800.md` (Domain value objects)
- [ ] Create `docs/business/stories/US-801.md` (Domain calculators)
- [ ] ... (create all 11 story files following template above)
- [ ] Update `docs/business/Story_Map.md` with all 11 new stories
- [ ] Commit: "chore(US-800..811): create Command Center KPI stories"

### Step 4: Setup Development Environment (2026-06-16)
- [ ] Create feature branch: `feature/command-center-kpi-ddd`
- [ ] Verify JaCoCo is configured (pom.xml)
- [ ] Verify Datadog SDK is available (Maven dependency)
- [ ] Verify Flyway is configured (migration directory exists)
- [ ] Run existing tests (ensure baseline passes)

### Step 5: Kickoff Meeting (2026-06-16, 10:00 AM)
- [ ] CODER(s) review all 11 story files
- [ ] Review SDLC_GOVERNANCE_ALL_ROLES.md (understand gates/escalations)
- [ ] Review DDD implementation plan (PLAN_CommandCenter_KPI_DDD.md)
- [ ] Confirm CODER ready to begin US-800 (Domain value objects)
- [ ] Identify any blockers before starting

### Step 6: Begin Phase 1 (2026-06-16, 2:00 PM)
- [ ] CODER creates `/domain/` directory structure
- [ ] CODER begins US-800 (Create Money, Percentage value objects)
- [ ] Tests created first (Red phase of TDD)
- [ ] Daily standup at 9:00 AM (10-min sync)

---

## Success Metrics

### By End of Sprint (2026-06-27)

- ✅ All 12 stories complete (DONE status)
- ✅ 50+ unit/integration tests passing (0 failures)
- ✅ Code coverage ≥ 80% (JaCoCo enforced)
- ✅ Complexity ≤ 10 (cyclomatic, per method)
- ✅ DDD compliance verified (no Spring in /domain/)
- ✅ Multi-tenancy isolation verified
- ✅ Datadog observability configured
- ✅ Performance targets met (< 100ms query time)
- ✅ Cache hit rate > 80% under load
- ✅ All stories linked in Story_Map.md
- ✅ Deployment guide created
- ✅ Old work archived

### Post-Sprint (2026-06-30)

- ✅ Feature deployed to staging
- ✅ Smoke test executed (endpoint returns KPI data)
- ✅ Feature flag evaluated (FEATURE_NEW_DASHBOARD_ENABLED=true)
- ✅ Ready for production rollout

---

## Risk Management

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Domain calculator logic is complex | Medium | Medium | Write detailed unit tests (mutation testing) |
| JPA queries have N+1 issues | Medium | High | Use SQL logging + integration tests to verify |
| Cache invalidation is missed | High | Medium | Event-driven eviction + 5-min TTL fallback |
| Performance targets not met | Low | High | Load test early (US-810); optimize queries if needed |
| Coverage drops below 80% | Medium | High | Discipline on TDD (tests first) |
| Multi-tenancy bug causes data leak | Low | Critical | Careful review of all queries for tenant_id filter |

---

## Approval & Kickoff

**Ready to Proceed:**
- [ ] BA team signed off on 7 NFR decisions
- [ ] Old work archived
- [ ] Story files created (all 11)
- [ ] SDLC Governance document reviewed by team
- [ ] DDD Plan reviewed by ARCHITECT
- [ ] Kickoff meeting completed

**Proceed to Phase 1 once all boxes checked.**

---

**Document Status:** Ready for Execution  
**Last Updated:** 2026-06-09  
**Prepared by:** Architecture + BA Role
