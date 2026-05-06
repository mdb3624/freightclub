-- Test data inserted after Flyway migrations

-- TENANTS: Primary isolation boundary
INSERT INTO freightclub.tenants (id, name, created_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Default Test Tenant', CURRENT_TIMESTAMP)
  ON CONFLICT DO NOTHING;

-- Tests use these string IDs - insert with same value in UUID column via coercion
INSERT INTO freightclub.tenants (id, name, created_at)
SELECT 'tenant-1' :: CHAR(36), 'Tenant 1', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM freightclub.tenants WHERE id = 'tenant-1' :: CHAR(36));

INSERT INTO freightclub.tenants (id, name, created_at)
SELECT 'test-tenant-123' :: CHAR(36), 'Test Tenant 123', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM freightclub.tenants WHERE id = 'test-tenant-123' :: CHAR(36));

INSERT INTO freightclub.tenants (id, name, created_at)
SELECT 'tenant-aaa' :: CHAR(36), 'Tenant AAA', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM freightclub.tenants WHERE id = 'tenant-aaa' :: CHAR(36));
