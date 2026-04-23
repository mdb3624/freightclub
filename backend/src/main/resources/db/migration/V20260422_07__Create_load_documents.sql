-- Load documents table: Proof of delivery, BOL, etc.
CREATE TABLE freightclub.load_documents (
    id CHAR(36) PRIMARY KEY,
    tenant_id CHAR(36) NOT NULL REFERENCES freightclub.tenants(id),
    load_id CHAR(36) NOT NULL REFERENCES freightclub.loads(id),
    document_type VARCHAR(50) NOT NULL,
    file_url VARCHAR(1000) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_load_documents_tenant_id ON freightclub.load_documents(tenant_id);
CREATE INDEX idx_load_documents_load_id ON freightclub.load_documents(load_id);
CREATE INDEX idx_load_documents_type ON freightclub.load_documents(document_type);
