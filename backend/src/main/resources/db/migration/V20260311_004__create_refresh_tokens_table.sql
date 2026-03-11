-- Stores hashed refresh tokens for revocable, DB-backed session management.
-- The raw token is never stored — only its SHA-256 hash.
CREATE TABLE refresh_tokens (
    id         CHAR(36)     NOT NULL,
    user_id    CHAR(36)     NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME     NOT NULL,
    revoked    TINYINT(1)   NOT NULL DEFAULT 0,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_refresh_token_hash (token_hash),
    INDEX idx_refresh_token_user (user_id),
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
