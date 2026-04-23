-- Seed the single default tenant used during MVP.
-- Fixed UUID matches app.default-tenant-id in application.yml.
INSERT INTO tenants (id, name, plan)
VALUES ('00000000-0000-0000-0000-000000000001', 'FreightClub Default', 'FREE');
