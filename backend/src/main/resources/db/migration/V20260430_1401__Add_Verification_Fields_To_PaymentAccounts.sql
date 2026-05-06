-- Add verification fields to payment_accounts table for micro-deposit verification tracking
ALTER TABLE freightclub.payment_accounts
ADD COLUMN IF NOT EXISTS current_verification_code VARCHAR(255),
ADD COLUMN IF NOT EXISTS expected_deposit_1_cents BIGINT,
ADD COLUMN IF NOT EXISTS expected_deposit_2_cents BIGINT;
