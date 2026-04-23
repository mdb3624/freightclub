-- Notifications table: per-user in-app notification records.
-- Feeds the notification bell (unread count + list).
-- Email is handled by EmailService at time of event; this table tracks in-app state only.
--
-- type valid values:
--   LOAD_CLAIMED    - a trucker claimed shipper's load  (recipient: shipper)
--   LOAD_PICKED_UP  - trucker marked pickup             (recipient: shipper)
--   LOAD_DELIVERED  - trucker marked delivered          (recipient: shipper)
--   LOAD_CANCELLED  - shipper cancelled a claimed load  (recipient: trucker)

CREATE TABLE notifications (
    id         CHAR(36)     NOT NULL,
    tenant_id  CHAR(36)     NOT NULL,
    user_id    CHAR(36)     NOT NULL,
    load_id    CHAR(36)     NOT NULL,
    type       VARCHAR(30)  NOT NULL,
    message    TEXT         NOT NULL,
    is_read    TINYINT(1)   NOT NULL DEFAULT 0,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_notifications_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id),
    CONSTRAINT fk_notifications_user   FOREIGN KEY (user_id)   REFERENCES users (id),
    CONSTRAINT fk_notifications_load   FOREIGN KEY (load_id)   REFERENCES loads (id),
    CONSTRAINT chk_notifications_type  CHECK (type IN ('LOAD_CLAIMED', 'LOAD_PICKED_UP', 'LOAD_DELIVERED', 'LOAD_CANCELLED')),
    INDEX idx_notifications_user   (user_id, is_read, created_at),
    INDEX idx_notifications_tenant (tenant_id, created_at)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
