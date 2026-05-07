CREATE TABLE IF NOT EXISTS message_outbox (
    id          VARCHAR(36)  NOT NULL,
    aggregate_id VARCHAR(36) NOT NULL,
    tenant_id   VARCHAR(36)  NOT NULL,
    event_type  VARCHAR(100) NOT NULL,
    payload     TEXT         NOT NULL,
    status      VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    occurred_at TIMESTAMPTZ  NOT NULL,
    processed_at TIMESTAMPTZ,
    CONSTRAINT pk_message_outbox PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_message_outbox_status ON message_outbox (status, occurred_at);
CREATE INDEX IF NOT EXISTS idx_message_outbox_tenant ON message_outbox (tenant_id, occurred_at);

ALTER TABLE message_outbox ENABLE ROW LEVEL SECURITY;

CREATE POLICY message_outbox_tenant_isolation ON message_outbox
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE));
