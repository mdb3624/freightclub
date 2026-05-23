-- ===========================================================================
-- Description: Standardize schema for 2026 Resilience Logistics Platform.
-- Fixes: Column type mismatch between ID and Tenant ID while handling RLS.
-- ===========================================================================

DO $$
BEGIN
  -- 1. Drop the policy that is currently using the tenant_id column
  -- This prevents the "cannot alter type of a column used in a policy definition" error.
  DROP POLICY IF EXISTS claims_tenant_isolation ON freightclub.claims;

  -- 2. Alter the freightclub.claims table columns to the standardized VARCHAR(36)
  -- Standardizing both ID and Tenant ID to match the rest of the logistics schema.
  ALTER TABLE freightclub.claims
      ALTER COLUMN id TYPE VARCHAR(36),
      ALTER COLUMN tenant_id TYPE VARCHAR(36);

  -- 3. Recreate the Row-Level Security policy
  -- This ensures tenant isolation remains active after the type change.
  CREATE POLICY claims_tenant_isolation ON freightclub.claims
      USING (tenant_id = current_setting('app.current_tenant')::VARCHAR(36));
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

