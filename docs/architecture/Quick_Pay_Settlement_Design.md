# Quick Pay Settlement Module — Architecture Design

**Module:** Phase 5 Payment Settlement & Quick Pay  
**Story:** US-501 Load Settlement with 2% Commission & Quick Pay  
**Requirements:** REQ-5.1 through REQ-5.8  
**Architect:** Michael  
**Date:** 2026-04-26

---

## Domain Model

### Entities & Value Objects

```mermaid
classDiagram
    class Load {
        id: String[36]
        tenant_id: String[36]
        shipper_id: String[36]
        trucker_id: String[36]
        status: LoadStatus
        rate_per_unit: BigDecimal
        quantity_value: BigDecimal
        created_at: OffsetDateTime
        delivered_at: OffsetDateTime
        settled_at: OffsetDateTime
        deleted_at: OffsetDateTime
    }
    
    class FinancialTransaction {
        id: String[36]
        tenant_id: String[36]
        load_id: String[36]
        transaction_type: TransactionType
        amount_cents: Long
        commission_rate_percent: BigDecimal
        shipper_id: String[36]
        trucker_id: String[36]
        payment_intent_id: String[36]
        status: TransactionStatus
        created_at: OffsetDateTime
        completed_at: OffsetDateTime
        created_by: String[36]
        deleted_at: OffsetDateTime
        +validate()
        +isImmutable()
    }
    
    class QuickPayElection {
        id: String[36]
        tenant_id: String[36]
        load_id: String[36]
        trucker_id: String[36]
        payout_tier: PayoutTier
        base_payout_cents: Long
        quick_pay_fee_cents: Long
        final_payout_cents: Long
        requested_at: OffsetDateTime
        processed_at: OffsetDateTime
        completed_at: OffsetDateTime
        status: ElectionStatus
        created_at: OffsetDateTime
        deleted_at: OffsetDateTime
        +calculateFee(): Long
        +validateTiming(): Boolean
    }
    
    class PaymentIntent {
        id: String[36]
        tenant_id: String[36]
        trucker_id: String[36]
        load_id: String[36]
        gross_amount_cents: Long
        net_amount_cents: Long
        platform_fee_cents: Long
        payment_method: PaymentMethod
        status: PaymentStatus
        created_at: OffsetDateTime
        updated_at: OffsetDateTime
        +initiate(): void
        +complete(): void
    }
    
    class TenantCommissionOverride {
        id: String[36]
        tenant_id: String[36]
        commission_rate_percent: BigDecimal
        effective_from_date: LocalDate
        reason: String
        approved_by: String[36]
        created_at: OffsetDateTime
        updated_at: OffsetDateTime
        deleted_at: OffsetDateTime
    }
    
    class Payout {
        id: String[36]
        tenant_id: String[36]
        trucker_id: String[36]
        payment_intent_id: String[36]
        amount_cents: Long
        status: PayoutStatus
        scheduled_at: OffsetDateTime
        completed_at: OffsetDateTime
        created_at: OffsetDateTime
        deleted_at: OffsetDateTime
    }
    
    class SettlementCalculator {
        +calculate(load, commissionRate, tier): SettlementBreakdown
        +validateTiming(tier): Boolean
        +getPayoutDate(tier): OffsetDateTime
    }
    
    class SettlementBreakdown {
        gross_amount_cents: Long
        commission_cents: Long
        quick_pay_fee_cents: Long
        final_payout_cents: Long
        commission_rate_percent: BigDecimal
    }
    
    Load --> FinancialTransaction : "settled via"
    Load --> QuickPayElection : "references"
    QuickPayElection --> PaymentIntent : "triggers"
    PaymentIntent --> Payout : "creates"
    TenantCommissionOverride --> FinancialTransaction : "affects commission"
    SettlementCalculator --> SettlementBreakdown : "produces"
    
    enum TransactionType {
        LOAD_SETTLEMENT
        PLATFORM_COMMISSION
        QUICK_PAY_FEE
        DISPUTE_HOLD
        DISPUTE_RESOLUTION
        REFUND
    }
    
    enum PayoutTier {
        STANDARD
        QUICK_PAY
        ULTRA_FAST
    }
    
    enum TransactionStatus {
        PENDING_APPROVAL
        COMPLETED
        REVERSED
        DISPUTED
        CANCELLED
    }
    
    enum PaymentMethod {
        ACH
        WIRE
        CHECK
    }
    
    enum PaymentStatus {
        PENDING
        PROCESSING
        SUCCEEDED
        FAILED
        DISPUTED
    }
    
    enum ElectionStatus {
        PENDING
        PROCESSING
        COMPLETED
        FAILED
    }
    
    enum PayoutStatus {
        PENDING
        IN_TRANSIT
        COMPLETED
        FAILED
        CANCELLED
    }
```

---

## Domain Rules (Business Logic)

### Settlement Calculation Rules
- Gross amount = `load.rate_per_unit × load.quantity_value` (in cents)
- Commission = gross × commission_rate_percent ÷ 100
- Base payout = gross − commission
- Quick Pay fee (if elected) = base_payout × payout_tier_fee_percent ÷ 100
- Final payout = base_payout − quick_pay_fee

### Payout Tier Timing Rules
- **STANDARD:** 2–3 business days, 0% fee
- **QUICK_PAY:** Next business day (by 5pm EST), 1% fee
- **ULTRA_FAST:** Same day (2–4 hours), 2% fee, M–F before 3pm EST only

### Immutability Rules
- `FinancialTransaction` is append-only; no UPDATE on `amount_cents`, `transaction_type`, `commission_rate_percent`
- Soft-delete only: status = 'CANCELLED'
- All transactions atomic: settlement + commission + fee + payout written all-or-nothing

### Tenant Isolation Rules
- Every financial operation scoped to `TenantContextHolder`
- RLS policy enforces: `tenant_id = current_setting('app.current_tenant')::uuid`
- No cross-tenant fee visibility or calculation

---

## Service Layer (TDD)

### SettlementService
```java
@Transactional
public SettlementResult settleLoad(String loadId, String tenantId, PayoutTier tier)
  → Validates tier timing
  → Calculates settlement breakdown
  → Creates 3–4 financial transactions atomically
  → Creates payment intent
  → Schedules payout per tier
  → Returns SettlementResult with estimated payout date
```

### SettlementCalculator (Domain Service, no Spring deps)
```java
public SettlementBreakdown calculate(Load load, BigDecimal commissionRate, PayoutTier tier)
  → Pure function: no side effects
  → Returns breakdown object
  → Testable with unit tests
```

---

## Data Model (PostgreSQL)

See Flyway migration for schema.

**Key Design Decisions:**
- ✅ All PKs: VARCHAR(36) (UUID standard)
- ✅ All FKs: VARCHAR(36) (consistency)
- ✅ All timestamps: TIMESTAMPTZ (timezone aware)
- ✅ All IDs immutable: UNIQUE(tenant_id, load_id) for `financial_transactions`
- ✅ Soft-delete: deleted_at on all tables
- ✅ RLS: POLICY on every table WHERE tenant_id = current_setting(...)
- ✅ Indexes: (tenant_id, created_at), (load_id), (transaction_type, status)

---

## API Endpoints

### Settlement Workflow
| Endpoint | Method | Actor | Purpose |
|----------|--------|-------|---------|
| `/api/v1/loads/{id}/settle` | POST | ADMIN | Force settlement (edge cases) |
| `/api/v1/loads/{id}/payout-tier` | PATCH | TRUCKER | Elect Quick Pay or Ultra-Fast |
| `/api/v1/financial-ledger` | GET | TENANT | Query audit trail |
| `/api/v1/financial-ledger/{txnId}` | GET | TENANT | Single transaction details |

---

## Testing Strategy (TDD)

### Unit Tests
- `SettlementCalculatorTest` (pure function, no DB)
- `QuickPayElectionValidationTest` (timing rules)
- Immutability constraints

### Integration Tests
- `SettlementServiceIntegrationTest` (full atomic transaction)
- Tenant isolation (RLS enforcement)
- Soft-delete (deleted_at filtering)

### Target: 80%+ branch coverage

---

**Status:** ✅ DESIGN COMPLETE — Ready for Coder TDD implementation.
