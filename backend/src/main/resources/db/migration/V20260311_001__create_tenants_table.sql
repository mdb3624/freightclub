-- Tenants are the top-level SaaS account. All user data is scoped to a tenant.
CREATE TABLE tenants (
    id         CHAR(36)     NOT NULL,
    name       VARCHAR(255) NOT NULL,
    plan       VARCHAR(50)  NOT NULL DEFAULT 'FREE',
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME     NULL,
    PRIMARY KEY (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
