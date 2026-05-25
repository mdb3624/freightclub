-- Flyway Migration: Stripe Connect Invoices (Phase 5)
-- Version: V20260524_1000__Add_Stripe_Invoices.sql
-- Story: A5 — Stripe Connect Payments with Platform Fee & Trucker Direct Transfer
-- Requirements: Invoice per delivered load, 1.75% platform fee, Stripe Connect transfer

SET search_path TO freightclub;

DO $$ BEGIN

  -- ============================================================================
  -- TABLE: invoices
  -- Purpose: One invoice per delivered load. Tracks Stripe PaymentIntent and
  --          Transfer IDs for end-to-end reconciliation.
  -- ============================================================================
  CREATE TABLE IF NOT EXISTS freightclub.invoices (
      id                        VARCHAR(36)  PRIMARY KEY,
      tenant_id                 VARCHAR(36)  NOT NULL,
      load_id                   VARCHAR(36)  NOT NULL UNIQUE,
      trucker_user_id           VARCHAR(36)  NOT NULL,
      shipper_user_id           VARCHAR(36)  NOT NULL,
      load_amount_cents         BIGINT       NOT NULL,
      platform_fee_cents        BIGINT       NOT NULL,
      trucker_payout_cents      BIGINT       NOT NULL,
      status                    VARCHAR(20)  NOT NULL DEFAULT 'PENDING'
          CONSTRAINT check_invoice_status CHECK (status IN ('PENDING','PAID','FAILED','REFUNDED')),
      stripe_payment_intent_id  VARCHAR(255),
      stripe_transfer_id        VARCHAR(255),
      trucker_stripe_account_id VARCHAR(255),
      created_at                TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      paid_at                   TIMESTAMPTZ,
      deleted_at                TIMESTAMPTZ,
      CONSTRAINT fk_invoice_load    FOREIGN KEY (load_id)    REFERENCES freightclub.loads(id),
      CONSTRAINT fk_invoice_tenant  FOREIGN KEY (tenant_id)  REFERENCES freightclub.tenants(id),
      CONSTRAINT fk_invoice_trucker FOREIGN KEY (trucker_user_id) REFERENCES freightclub.users(id),
      CONSTRAINT fk_invoice_shipper FOREIGN KEY (shipper_user_id) REFERENCES freightclub.users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_invoices_tenant_status
      ON freightclub.invoices(tenant_id, status)
      WHERE deleted_at IS NULL;

  CREATE INDEX IF NOT EXISTS idx_invoices_load
      ON freightclub.invoices(load_id);

  CREATE INDEX IF NOT EXISTS idx_invoices_trucker
      ON freightclub.invoices(trucker_user_id)
      WHERE deleted_at IS NULL;

  -- Row-Level Security
  ALTER TABLE freightclub.invoices ENABLE ROW LEVEL SECURITY;

  CREATE POLICY invoices_select ON freightclub.invoices
      FOR SELECT
      USING (tenant_id = CURRENT_SETTING('app.current_tenant_id')::VARCHAR AND deleted_at IS NULL);

  CREATE POLICY invoices_insert ON freightclub.invoices
      FOR INSERT
      WITH CHECK (tenant_id = CURRENT_SETTING('app.current_tenant_id')::VARCHAR);

  CREATE POLICY invoices_update ON freightclub.invoices
      FOR UPDATE
      USING (tenant_id = CURRENT_SETTING('app.current_tenant_id')::VARCHAR);

  -- ============================================================================
  -- COLUMN: users.stripe_account_id
  -- Purpose: Trucker's Stripe Connect account ID for direct transfers
  -- ============================================================================
  ALTER TABLE freightclub.users
      ADD COLUMN IF NOT EXISTS stripe_account_id VARCHAR(255);

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Migration V20260524_1000 partial failure: %', SQLERRM;
END $$;
