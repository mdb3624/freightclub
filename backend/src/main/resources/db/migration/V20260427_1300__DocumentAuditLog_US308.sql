-- US-308: Document Audit Log Service
-- Creates immutable audit trail for all document actions (upload, download, signature)
-- 30-year retention; no soft deletes; multi-tenant isolation via RLS

DO $$ BEGIN
  CREATE TABLE freightclub.document_audit_log (
    id VARCHAR(36) PRIMARY KEY,
    document_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    tenant_id VARCHAR(36) NOT NULL,
    action VARCHAR(50) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_document FOREIGN KEY (document_id) REFERENCES freightclub.load_documents(id),
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES freightclub.users(id),
    CONSTRAINT fk_audit_tenant FOREIGN KEY (tenant_id) REFERENCES freightclub.tenants(id)
  );

  -- Enable RLS
  ALTER TABLE freightclub.document_audit_log ENABLE ROW LEVEL SECURITY;

  -- Policy 1: Prevent DELETE (immutable audit log)
  CREATE POLICY document_audit_log_no_delete ON freightclub.document_audit_log
    AS RESTRICTIVE FOR DELETE TO freightclub_runtime
    USING (false);

  -- Policy 2: Multi-tenant SELECT isolation
  CREATE POLICY document_audit_log_select_isolation ON freightclub.document_audit_log
    AS PERMISSIVE FOR SELECT TO freightclub_runtime
    USING (tenant_id = current_setting('app.current_tenant'));

  -- Policy 3: Allow INSERT for audit events
  CREATE POLICY document_audit_log_insert ON freightclub.document_audit_log
    AS PERMISSIVE FOR INSERT TO freightclub_runtime
    WITH CHECK (tenant_id = current_setting('app.current_tenant'));

  -- Indexes for performance
  CREATE INDEX idx_audit_document_tenant_created
    ON freightclub.document_audit_log(document_id, tenant_id, created_at DESC);
  CREATE INDEX idx_audit_tenant_created
    ON freightclub.document_audit_log(tenant_id, created_at DESC);
  CREATE INDEX idx_audit_user_created
    ON freightclub.document_audit_log(user_id, created_at DESC);
EXCEPTION WHEN duplicate_table THEN
  NULL;
END $$;
