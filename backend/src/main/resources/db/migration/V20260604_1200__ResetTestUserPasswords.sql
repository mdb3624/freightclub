-- Force-reset test user passwords to N1kk101! (BCrypt cost 12)
-- Required because V20260517_2000 used WHERE NOT EXISTS and skipped pre-existing accounts.
DO $$
BEGIN
    UPDATE freightclub.users
    SET password_hash = '$2a$12$0VS2ZXP4cySIYlLQfnnKse/RhTksI/FJXPijGKfNAl8Tq8RZbGNti',
        updated_at    = CURRENT_TIMESTAMP
    WHERE email IN ('carrier@test.com', 'shipper@test.com', 'admin@test.com')
      AND deleted_at IS NULL;
END $$;
