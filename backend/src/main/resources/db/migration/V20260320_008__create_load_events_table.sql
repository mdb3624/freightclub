-- Load events table: immutable chronological log of every action on a load.
--
-- This is the foundational table for Phase 2 (notifications, status timeline).
-- It is created now so the schema is designed deliberately rather than rushed
-- when Phase 2 work begins. The service layer will begin writing events as
-- Phase 2 is implemented.
--
-- event_type valid values:
--   CREATED    - load record created as draft
--   PUBLISHED  - shipper published draft → open
--   CLAIMED    - trucker claimed the load
--   PICKED_UP  - trucker marked as picked up (CLAIMED → IN_TRANSIT)
--   DELIVERED  - trucker marked as delivered (IN_TRANSIT → DELIVERED)
--   CANCELLED  - shipper or system cancelled the load
--   SETTLED    - load marked as settled after payment

CREATE TABLE load_events (
    id         CHAR(36)    NOT NULL,
    tenant_id  CHAR(36)    NOT NULL,
    load_id    CHAR(36)    NOT NULL,
    actor_id   CHAR(36)    NOT NULL,
    event_type VARCHAR(30) NOT NULL,
    note       TEXT        NULL,
    created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_load_events_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    CONSTRAINT fk_load_events_load   FOREIGN KEY (load_id)   REFERENCES loads (id),
    CONSTRAINT fk_load_events_actor  FOREIGN KEY (actor_id)  REFERENCES users (id),
    CONSTRAINT chk_load_events_type  CHECK (event_type IN ('CREATED', 'PUBLISHED', 'CLAIMED', 'PICKED_UP', 'DELIVERED', 'CANCELLED', 'SETTLED')),
    INDEX idx_load_events_load    (load_id, created_at),
    INDEX idx_load_events_tenant  (tenant_id, created_at)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
