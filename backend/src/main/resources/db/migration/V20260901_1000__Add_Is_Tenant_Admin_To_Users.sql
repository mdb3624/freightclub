-- US-874: additive tenant-admin capability. A Shipper/Trucker user who creates a brand-new
-- tenant (registers with companyName, not joinCode) becomes that tenant's admin. This is a
-- new boolean column, not a UserRole enum value — the Director explicitly rejected modeling
-- tenant-admin as a separate SHIPPER_ADMIN/CARRIER_ADMIN role fork (see US-874 story doc's
-- Decision Log): a tenant admin is still a SHIPPER/TRUCKER, just with one extra capability.
DO $$
BEGIN
    ALTER TABLE freightclub.users
        ADD COLUMN is_tenant_admin BOOLEAN NOT NULL DEFAULT FALSE;
EXCEPTION WHEN duplicate_column THEN
    NULL;
END $$;
