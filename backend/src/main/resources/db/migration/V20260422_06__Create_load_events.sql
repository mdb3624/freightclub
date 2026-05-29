-- Load events table: Audit trail for load lifecycle
DO $$ BEGIN
  CREATE TABLE freightclub.load_events (
      id VARCHAR(36) PRIMARY KEY,
      tenant_id VARCHAR(36) NOT NULL REFERENCES freightclub.tenants(id),
      load_id VARCHAR(36) NOT NULL REFERENCES freightclub.loads(id),
      actor_id VARCHAR(36) NOT NULL REFERENCES freightclub.users(id),
      event_type VARCHAR(30) NOT NULL,
      note TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_load_events_tenant_id ON freightclub.load_events(tenant_id);
  CREATE INDEX idx_load_events_load_id ON freightclub.load_events(load_id);
  CREATE INDEX idx_load_events_actor_id ON freightclub.load_events(actor_id);
  CREATE INDEX idx_load_events_created_at ON freightclub.load_events(created_at);
EXCEPTION WHEN duplicate_table THEN
  NULL;
END $$;
