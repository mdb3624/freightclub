-- Phase 3: Document Management (BOL & POD)
-- Stores all documents associated with a load:
--   BOL_GENERATED - PDF Bill of Lading auto-generated when load is published
--   BOL_PHOTO     - Trucker photo of BOL at pickup (required before mark as picked up)
--   POD_PHOTO     - Trucker photo of POD at delivery (required before mark as delivered)
--   ISSUE_PHOTO   - Photo + description for an in-transit issue report (photo optional)

CREATE TABLE load_documents (
    id                CHAR(36)     NOT NULL,
    tenant_id         CHAR(36)     NOT NULL,
    load_id           CHAR(36)     NOT NULL,
    uploaded_by       CHAR(36)     NOT NULL,
    document_type     VARCHAR(20)  NOT NULL,
    storage_key       VARCHAR(500) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    content_type      VARCHAR(100) NOT NULL,
    file_size_bytes   BIGINT       NOT NULL,
    note              TEXT         NULL,
    created_at        DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    deleted_at        DATETIME(6)  NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_load_documents_load       FOREIGN KEY (load_id)     REFERENCES loads(id),
    CONSTRAINT fk_load_documents_uploader   FOREIGN KEY (uploaded_by) REFERENCES users(id),
    CONSTRAINT chk_load_documents_type      CHECK (document_type IN ('BOL_GENERATED', 'BOL_PHOTO', 'POD_PHOTO', 'ISSUE_PHOTO')),
    INDEX idx_load_documents_load           (load_id),
    INDEX idx_load_documents_tenant_load    (tenant_id, load_id),
    INDEX idx_load_documents_load_type      (load_id, document_type)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
