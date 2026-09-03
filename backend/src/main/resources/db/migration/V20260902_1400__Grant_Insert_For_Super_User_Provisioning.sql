-- US-886: Super User creates a user (existing tenant) or a tenant + first user, reusing the
-- exact mechanism US-881 built for force-password-reset (unusable random password hash + a
-- single-use setup token) rather than a temporary password — see the story's corrected BR-5.
-- Narrow column-level INSERT grants, same pattern as every other freightclub_super_user_read
-- grant in this batch — only the columns actually needed, everything else relies on the
-- table's own DB-level defaults (notify_*, created_at, updated_at, is_tenant_admin).
DO $$
BEGIN
    GRANT INSERT (id, tenant_id, email, password_hash, role, first_name, last_name, is_tenant_admin)
        ON freightclub.users TO freightclub_super_user_read;

    GRANT INSERT (id, name, join_code) ON freightclub.tenants TO freightclub_super_user_read;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'V20260902_1400 partial: %', SQLERRM;
END $$;
