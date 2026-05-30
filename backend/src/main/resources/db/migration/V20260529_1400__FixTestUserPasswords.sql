-- Fix test user passwords for E2E tests
-- Using password: "admin" with bcrypt cost 10 (60 chars, valid format)
-- $2a$10$b9CjL.wvO3/JGXNDdkQ6yO4ZqVqyN0OWOQ.FhUzqI1.dKN.zDKkPe

UPDATE freightclub.users
SET password_hash = '$2a$10$b9CjL.wvO3/JGXNDdkQ6yO4ZqVqyN0OWOQ.FhUzqI1.dKN.zDKkPe'
WHERE email IN ('shipper@test.com', 'carrier@test.com', 'admin@test.com')
  AND deleted_at IS NULL;
