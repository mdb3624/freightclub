-- Test seed data: required fixtures for integration tests
-- Idempotent: safe to run multiple times

-- Tenants required by test classes
INSERT INTO freightclub.tenants (id, name, plan, created_at, updated_at)
VALUES
    ('00000000-0000-0000-0000-000000000001', 'Test Tenant A', 'FREE', NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000002', 'Test Tenant B', 'FREE', NOW(), NOW()),
    ('test-tenant-123', 'Recommendation Test Tenant', 'FREE', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Users required by AuthorizationGateTest (shipper_id FK on loads)
INSERT INTO freightclub.users (id, tenant_id, email, password_hash, first_name, last_name, role, notify_email, notify_in_app, notify_sms, created_at, updated_at)
VALUES
    ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001',
     'shipper-a@test-seed.com', '$2a$10$testpasswordhashplaceholder', 'Shipper', 'A',
     'SHIPPER', true, true, false, NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000002',
     'shipper-b@test-seed.com', '$2a$10$testpasswordhashplaceholder', 'Shipper', 'B',
     'SHIPPER', true, true, false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
