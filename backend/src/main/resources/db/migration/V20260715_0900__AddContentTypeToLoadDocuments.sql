-- CHG-856: persist contentType instead of @Transient (was never saved, broke every document download)
DO $$ BEGIN
  ALTER TABLE freightclub.load_documents ADD COLUMN content_type VARCHAR(100);
EXCEPTION WHEN duplicate_column THEN
  NULL;
END $$;
