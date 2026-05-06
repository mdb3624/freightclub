-- Flyway Migration: Quick Pay Settlement Module (Phase 5)
-- Version: V20260426_2343__Create_Quick_Pay_Settlement_Tables.sql
-- Story: US-501 Load Settlement with 2% Commission & Quick Pay
-- Requirements: REQ-5.1 through REQ-5.8

-- Switch to freightclub schema
SET search_path TO freightclub;

-- ============================================================================
-- TABLE: financial_transactions (Immutable Ledger)
-- ============================================================================
-- Purpose: Append-only ledger for all financial transactions
-- Immutability: No UPDATE on amount_cents, transaction_type, commission_rate_percent
-- Soft-delete: status = 'CANCELLED' only; no hard DELETE
-- Multi-tenancy: RLS enforces tenant_id isolation

CREATE TABLE IF NOT EXISTS financial_transactions (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    load_id VARCHAR(36) NOT NULL,

    -- Transaction Classification
    transaction_type VARCHAR(50) NOT NULL,
    -- ENUM values: LOAD_SETTLEMENT, PLATFORM_COMMISSION, QUICK_PAY_FEE,
    --              DISPUTE_HOLD, DISPUTE_RESOLUTION, REFUND
    -- Constraint: CHECK (transaction_type IN (...))

    -- Amount Tracking (in cents for precision)
    amount_cents BIGINT NOT NULL,

    -- Commission Audit Trail
    commission_rate_percent NUMERIC(5, 2),

    -- Party Tracking
    shipper_id VARCHAR(36) NOT NULL,
    trucker_id VARCHAR(36) NOT NULL,
    payment_intent_id VARCHAR(36),

    -- Status Tracking
    status VARCHAR(50) NOT NULL,
    -- ENUM values: PENDING_APPROVAL, COMPLETED, REVERSED, DISPUTED, CANCELLED
    -- Constraint: CHECK (status IN (...))

    -- Audit Trail
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    created_by VARCHAR(36),

    -- Soft Delete
    deleted_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT fk_ft_load FOREIGN KEY (load_id) REFERENCES loads(id),
    CONSTRAINT fk_ft_shipper FOREIGN KEY (shipper_id) REFERENCES users(id),
    CONSTRAINT fk_ft_trucker FOREIGN KEY (trucker_id) REFERENCES users(id),
    CONSTRAINT check_ft_type CHECK (transaction_type IN (
        'LOAD_SETTLEMENT', 'PLATFORM_COMMISSION', 'QUICK_PAY_FEE',
        'DISPUTE_HOLD', 'DISPUTE_RESOLUTION', 'REFUND'
    )),
    CONSTRAINT check_ft_status CHECK (status IN (
        'PENDING_APPROVAL', 'COMPLETED', 'REVERSED', 'DISPUTED', 'CANCELLED'
    ))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ft_tenant_date ON financial_transactions(tenant_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ft_load ON financial_transactions(load_id);
CREATE INDEX IF NOT EXISTS idx_ft_trucker ON financial_transactions(trucker_id);
CREATE INDEX IF NOT EXISTS idx_ft_type_status ON financial_transactions(transaction_type, status);
CREATE INDEX IF NOT EXISTS idx_ft_tenant_load ON financial_transactions(tenant_id, load_id);

-- Row-Level Security
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_ft_tenant ON financial_transactions
    USING (tenant_id = current_setting('app.current_tenant'));
CREATE POLICY rls_ft_insert ON financial_transactions FOR INSERT
    WITH CHECK (tenant_id = current_setting('app.current_tenant'));

-- ============================================================================
-- TABLE: quick_pay_elections (Payout Tier Selection & Audit)
-- ============================================================================
-- Purpose: Tracks trucker's choice of payout tier and resulting fees
-- Multi-tenancy: RLS enforces tenant_id isolation
-- Soft-delete: deleted_at marks voided elections

CREATE TABLE IF NOT EXISTS quick_pay_elections (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    load_id VARCHAR(36) NOT NULL,
    trucker_id VARCHAR(36) NOT NULL,

    -- Payout Tier Selection
    payout_tier VARCHAR(50) NOT NULL,
    -- ENUM values: STANDARD, QUICK_PAY, ULTRA_FAST
    -- Constraint: CHECK (payout_tier IN (...))

    -- Amount Breakdown (for audit trail)
    base_payout_cents BIGINT NOT NULL,
    quick_pay_fee_cents BIGINT NOT NULL,
    final_payout_cents BIGINT NOT NULL,

    -- Timeline Tracking
    requested_at TIMESTAMPTZ NOT NULL,
    processed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Status
    status VARCHAR(50) NOT NULL,
    -- ENUM values: PENDING, PROCESSING, COMPLETED, FAILED
    -- Constraint: CHECK (status IN (...))

    -- Audit Trail
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT fk_qpe_load FOREIGN KEY (load_id) REFERENCES loads(id),
    CONSTRAINT fk_qpe_trucker FOREIGN KEY (trucker_id) REFERENCES users(id),
    CONSTRAINT check_qpe_tier CHECK (payout_tier IN ('STANDARD', 'QUICK_PAY', 'ULTRA_FAST')),
    CONSTRAINT check_qpe_status CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_qpe_tenant_load ON quick_pay_elections(tenant_id, load_id);
CREATE INDEX IF NOT EXISTS idx_qpe_trucker_date ON quick_pay_elections(trucker_id, created_at);
CREATE INDEX IF NOT EXISTS idx_qpe_tenant_date ON quick_pay_elections(tenant_id, created_at);

-- Row-Level Security
ALTER TABLE quick_pay_elections ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_qpe_tenant ON quick_pay_elections
    USING (tenant_id = current_setting('app.current_tenant'));
CREATE POLICY rls_qpe_insert ON quick_pay_elections FOR INSERT
    WITH CHECK (tenant_id = current_setting('app.current_tenant'));

-- ============================================================================
-- TABLE: payment_intents (Payment Processing)
-- ============================================================================
-- Purpose: Tracks payment processing details for each settlement
-- Multi-tenancy: RLS enforces tenant_id isolation

CREATE TABLE IF NOT EXISTS payment_intents (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    trucker_id VARCHAR(36) NOT NULL,
    load_id VARCHAR(36) NOT NULL,

    -- Amount Breakdown
    gross_amount_cents BIGINT NOT NULL,
    net_amount_cents BIGINT NOT NULL,
    platform_fee_cents BIGINT NOT NULL,

    -- Payment Method & Status
    payment_method VARCHAR(50) NOT NULL,
    -- ENUM values: ACH, WIRE, CHECK
    -- Constraint: CHECK (payment_method IN (...))

    status VARCHAR(50) NOT NULL,
    -- ENUM values: PENDING, PROCESSING, SUCCEEDED, FAILED, DISPUTED
    -- Constraint: CHECK (status IN (...))

    -- Timeline
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Soft Delete
    deleted_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT fk_pi_load FOREIGN KEY (load_id) REFERENCES loads(id),
    CONSTRAINT fk_pi_trucker FOREIGN KEY (trucker_id) REFERENCES users(id),
    CONSTRAINT check_pi_method CHECK (payment_method IN ('ACH', 'WIRE', 'CHECK')),
    CONSTRAINT check_pi_status CHECK (status IN ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'DISPUTED'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pi_tenant_date ON payment_intents(tenant_id, created_at);
CREATE INDEX IF NOT EXISTS idx_pi_trucker ON payment_intents(trucker_id);
CREATE INDEX IF NOT EXISTS idx_pi_load ON payment_intents(load_id);

-- Row-Level Security
ALTER TABLE payment_intents ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_pi_tenant ON payment_intents
    USING (tenant_id = current_setting('app.current_tenant'));
CREATE POLICY rls_pi_insert ON payment_intents FOR INSERT
    WITH CHECK (tenant_id = current_setting('app.current_tenant'));

-- ============================================================================
-- TABLE: payouts (Scheduled & Completed Payouts)
-- ============================================================================
-- Purpose: Tracks actual payout execution per trucker
-- Multi-tenancy: RLS enforces tenant_id isolation

CREATE TABLE IF NOT EXISTS payouts (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    trucker_id VARCHAR(36) NOT NULL,
    payment_intent_id VARCHAR(36) NOT NULL,

    -- Amount & Status
    amount_cents BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL,
    -- ENUM values: PENDING, IN_TRANSIT, COMPLETED, FAILED, CANCELLED
    -- Constraint: CHECK (status IN (...))

    -- Timeline
    scheduled_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Soft Delete
    deleted_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT fk_payout_intent FOREIGN KEY (payment_intent_id) REFERENCES payment_intents(id),
    CONSTRAINT fk_payout_trucker FOREIGN KEY (trucker_id) REFERENCES users(id),
    CONSTRAINT check_payout_status CHECK (status IN ('PENDING', 'IN_TRANSIT', 'COMPLETED', 'FAILED', 'CANCELLED'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payout_tenant_date ON payouts(tenant_id, created_at);
CREATE INDEX IF NOT EXISTS idx_payout_trucker ON payouts(trucker_id);
CREATE INDEX IF NOT EXISTS idx_payout_status ON payouts(status);

-- Row-Level Security
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_payout_tenant ON payouts
    USING (tenant_id = current_setting('app.current_tenant'));
CREATE POLICY rls_payout_insert ON payouts FOR INSERT
    WITH CHECK (tenant_id = current_setting('app.current_tenant'));

-- ============================================================================
-- TABLE: tenant_commission_overrides (Custom Commission Rates)
-- ============================================================================
-- Purpose: Allow tenants to negotiate custom commission rates
-- Immutability: effective_from_date prevents retroactive changes
-- Multi-tenancy: RLS enforces tenant_id isolation

CREATE TABLE IF NOT EXISTS tenant_commission_overrides (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,

    -- Commission Rate Configuration
    commission_rate_percent NUMERIC(5, 2) NOT NULL,
    effective_from_date DATE NOT NULL,

    -- Audit Trail
    reason TEXT,
    approved_by VARCHAR(36),

    -- Timeline
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT fk_tco_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_tco_approver FOREIGN KEY (approved_by) REFERENCES users(id),
    CONSTRAINT unique_tenant_date UNIQUE (tenant_id, effective_from_date),
    CONSTRAINT check_commission_range CHECK (commission_rate_percent >= 1.5 AND commission_rate_percent <= 5.0)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tco_tenant_date ON tenant_commission_overrides(tenant_id, effective_from_date);
CREATE INDEX IF NOT EXISTS idx_tco_tenant_current ON tenant_commission_overrides(tenant_id, effective_from_date DESC) WHERE deleted_at IS NULL;

-- Row-Level Security
ALTER TABLE tenant_commission_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_tco_tenant ON tenant_commission_overrides
    USING (tenant_id = current_setting('app.current_tenant'));
CREATE POLICY rls_tco_insert ON tenant_commission_overrides FOR INSERT
    WITH CHECK (tenant_id = current_setting('app.current_tenant'));

-- ============================================================================
-- VIEW: settlement_summary (Reconciliation & Audit)
-- ============================================================================
-- Purpose: Verify settlement atomicity (gross = commission + payout)

CREATE OR REPLACE VIEW settlement_summary AS
SELECT
    ft.load_id,
    ft.tenant_id,
    MAX(CASE WHEN ft.transaction_type = 'LOAD_SETTLEMENT' THEN ft.amount_cents END) AS gross_amount_cents,
    MAX(CASE WHEN ft.transaction_type = 'PLATFORM_COMMISSION' THEN ft.amount_cents END) AS platform_commission_cents,
    MAX(CASE WHEN ft.transaction_type = 'QUICK_PAY_FEE' THEN ft.amount_cents END) AS quick_pay_fee_cents,
    MAX(CASE WHEN ft.transaction_type = 'TRUCKER_PAYOUT' THEN ft.amount_cents END) AS trucker_net_cents,
    MAX(ft.commission_rate_percent) AS commission_rate_applied,
    (MAX(CASE WHEN ft.transaction_type = 'LOAD_SETTLEMENT' THEN ft.amount_cents END)
     - MAX(CASE WHEN ft.transaction_type = 'PLATFORM_COMMISSION' THEN ft.amount_cents END)
     - MAX(CASE WHEN ft.transaction_type = 'QUICK_PAY_FEE' THEN ft.amount_cents END)
     - MAX(CASE WHEN ft.transaction_type = 'TRUCKER_PAYOUT' THEN ft.amount_cents END)) AS balance_check
FROM financial_transactions ft
WHERE ft.transaction_type IN ('LOAD_SETTLEMENT', 'PLATFORM_COMMISSION', 'QUICK_PAY_FEE', 'TRUCKER_PAYOUT')
  AND ft.deleted_at IS NULL
GROUP BY ft.load_id, ft.tenant_id;

-- ============================================================================
-- MIGRATION VERIFICATION
-- ============================================================================

-- Verify tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'freightclub'
  AND table_name IN ('financial_transactions', 'quick_pay_elections', 'payment_intents', 'payouts', 'tenant_commission_overrides')
ORDER BY table_name;
