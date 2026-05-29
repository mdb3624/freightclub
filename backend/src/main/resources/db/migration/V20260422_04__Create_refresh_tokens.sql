-- Refresh tokens table: Session management
DO $$ BEGIN
  CREATE TABLE freightclub.refresh_tokens (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL REFERENCES freightclub.users(id),
      token_hash VARCHAR(255) NOT NULL UNIQUE,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      revoked BOOLEAN NOT NULL DEFAULT FALSE,
      revoked_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_refresh_tokens_user_id ON freightclub.refresh_tokens(user_id);
  CREATE INDEX idx_refresh_tokens_expires_at ON freightclub.refresh_tokens(expires_at);
  CREATE INDEX idx_refresh_tokens_revoked ON freightclub.refresh_tokens(revoked);
EXCEPTION WHEN duplicate_table THEN
  NULL;
END $$;
