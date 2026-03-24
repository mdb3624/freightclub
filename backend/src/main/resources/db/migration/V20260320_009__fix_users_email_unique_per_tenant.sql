-- Change email uniqueness from global to per-tenant.
--
-- Global uniqueness prevents legitimate scenarios:
--   - Same person registering as both SHIPPER and TRUCKER (different role, same email)
--   - Same email joining multiple tenants
--
-- New constraint: a user can only have one account per email within a single tenant.
-- The application layer must enforce that a user cannot register with the same email
-- AND the same role in the same tenant.

ALTER TABLE users
    DROP INDEX uq_users_email,
    ADD UNIQUE KEY uq_users_tenant_email (tenant_id, email);
