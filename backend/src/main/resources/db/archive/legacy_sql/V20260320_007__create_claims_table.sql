-- Claims table: authoritative record of who claimed which load and when.
--
-- The current model stores only loads.trucker_id (active claimant cache).
-- This is insufficient because:
--   - Claim history is lost when a load is cancelled and re-claimed
--   - Phase 2 cancellation notifications need to know who had the load after trucker_id is cleared
--   - Phase 4 ratings must link rater/ratee to a specific claim, not just a load
--   - Phase 8 bidding requires multiple claimant records per load
--
-- loads.trucker_id remains as a denormalized convenience cache. All claim and release
-- operations must write to this table in addition to updating loads.trucker_id.

CREATE TABLE claims (
    id          CHAR(36)    NOT NULL,
    tenant_id   CHAR(36)    NOT NULL,
    load_id     CHAR(36)    NOT NULL,
    trucker_id  CHAR(36)    NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    claimed_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    released_at DATETIME    NULL,
    created_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_claims_tenant  FOREIGN KEY (tenant_id)  REFERENCES tenants (id),
    CONSTRAINT fk_claims_load    FOREIGN KEY (load_id)    REFERENCES loads (id),
    CONSTRAINT fk_claims_trucker FOREIGN KEY (trucker_id) REFERENCES users (id),
    CONSTRAINT chk_claims_status CHECK (status IN ('ACTIVE', 'RELEASED', 'CANCELLED')),
    INDEX idx_claims_tenant_load    (tenant_id, load_id),
    INDEX idx_claims_tenant_trucker (tenant_id, trucker_id),
    INDEX idx_claims_load_status    (load_id, status)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
