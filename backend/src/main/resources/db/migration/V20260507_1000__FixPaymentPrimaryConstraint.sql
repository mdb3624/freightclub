-- Fix: unique_primary_per_trucker was a full UNIQUE(tenant_id, trucker_id),
-- which prevented a trucker from having more than one payment account.
-- Replace with a partial unique index so only one PRIMARY account is enforced.

ALTER TABLE payment_accounts
    DROP CONSTRAINT unique_primary_per_trucker;

CREATE UNIQUE INDEX unique_primary_per_trucker
    ON payment_accounts(tenant_id, trucker_id)
    WHERE is_primary = true AND deleted_at IS NULL;
