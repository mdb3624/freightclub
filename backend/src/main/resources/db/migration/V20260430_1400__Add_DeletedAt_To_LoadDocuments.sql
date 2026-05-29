-- Add deleted_at column to load_documents table for soft delete support
ALTER TABLE freightclub.load_documents
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Add missing columns for document audit tracking
ALTER TABLE freightclub.load_documents
ADD COLUMN IF NOT EXISTS uploaded_by VARCHAR(36),
ADD COLUMN IF NOT EXISTS storage_key VARCHAR(500),
ADD COLUMN IF NOT EXISTS original_filename VARCHAR(255),
ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT,
ADD COLUMN IF NOT EXISTS note TEXT;

-- Create index for soft delete queries
CREATE INDEX IF NOT EXISTS idx_load_documents_deleted_at ON freightclub.load_documents(deleted_at);
CREATE INDEX IF NOT EXISTS idx_load_documents_tenant_deleted ON freightclub.load_documents(tenant_id, deleted_at);
