-- Transactional outbox table for reliable domain event delivery.
-- Events are written in the same transaction as aggregate state changes and
-- delivered asynchronously by a relay process to downstream consumers.

CREATE TABLE IF NOT EXISTS message_outbox (
    id           VARCHAR(36)  PRIMARY KEY,
    aggregate_id VARCHAR(36)  NOT NULL,
    tenant_id    VARCHAR(36)  NOT NULL,
    event_type   VARCHAR(255) NOT NULL,
    payload      JSONB        NOT NULL,
    status       VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    occurred_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- RLS: each tenant only sees its own outbox entries
ALTER TABLE message_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_outbox FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON message_outbox
    USING (tenant_id::text = current_setting('app.current_tenant', true));

-- Relay process polls PENDING rows; tenant_id leads per ARCHITECTURE.md §2
CREATE INDEX IF NOT EXISTS idx_outbox_tenant_status
    ON message_outbox (tenant_id, status) WHERE status = 'PENDING';

CREATE INDEX IF NOT EXISTS idx_outbox_occurred_at
    ON message_outbox (occurred_at) WHERE status = 'PENDING';

GRANT SELECT, INSERT, UPDATE ON message_outbox TO app_user;
