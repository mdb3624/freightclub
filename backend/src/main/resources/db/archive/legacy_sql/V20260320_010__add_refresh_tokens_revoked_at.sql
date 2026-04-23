-- Add revoked_at timestamp to refresh_tokens.
-- The existing revoked TINYINT(1) records that a token was revoked but not when.
-- revoked_at is needed for security audit trails and incident response
-- (e.g. "was this token revoked before or after it was used at timestamp T?").

ALTER TABLE refresh_tokens
    ADD COLUMN revoked_at DATETIME NULL AFTER revoked;
