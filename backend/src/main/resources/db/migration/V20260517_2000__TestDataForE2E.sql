-- Test data for E2E tests
-- Password: N1kk101!
-- BCrypt hash (generated offline)
-- $2a$10$slYQmyNdGzin7olVH0EqzuO8kdxQyPob9Y1YqZW3Yq2Jw4iEu2JNa

INSERT INTO freightclub.tenants (id, name, created_at, updated_at)
SELECT '00000000-0000-0000-0000-000000000001', 'Test Tenant', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM freightclub.tenants WHERE id = '00000000-0000-0000-0000-000000000001');

-- Shipper test user
INSERT INTO freightclub.users (
  id, tenant_id, email, password_hash, role, first_name, last_name, business_name,
  billing_address_1, billing_city, billing_state, billing_zip,
  default_pickup_address_1, default_pickup_city, default_pickup_state, default_pickup_zip,
  notify_email, notify_sms, notify_in_app, created_at, updated_at
)
SELECT
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'shipper@test.com',
  '$2a$10$slYQmyNdGzin7olVH0EqzuO8kdxQyPob9Y1YqZW3Yq2Jw4iEu2JNa',
  'SHIPPER',
  'Test',
  'Shipper',
  'Test Shipper Co',
  '123 Main St',
  'San Francisco',
  'CA',
  '94102',
  '123 Main St',
  'San Francisco',
  'CA',
  '94102',
  true, false, true,
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM freightclub.users WHERE email = 'shipper@test.com');
