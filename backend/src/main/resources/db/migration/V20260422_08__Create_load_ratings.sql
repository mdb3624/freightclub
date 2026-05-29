-- Load ratings table: Shipper ratings for truckers and vice versa
DO $$ BEGIN
  CREATE TABLE freightclub.load_ratings (
      id VARCHAR(36) PRIMARY KEY,
      tenant_id VARCHAR(36) NOT NULL REFERENCES freightclub.tenants(id),
      load_id VARCHAR(36) NOT NULL REFERENCES freightclub.loads(id),
      rater_id VARCHAR(36) NOT NULL REFERENCES freightclub.users(id),
      ratee_id VARCHAR(36) NOT NULL REFERENCES freightclub.users(id),
      rating INTEGER NOT NULL,
      comment TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_load_ratings_tenant_id ON freightclub.load_ratings(tenant_id);
  CREATE INDEX idx_load_ratings_load_id ON freightclub.load_ratings(load_id);
  CREATE INDEX idx_load_ratings_ratee_id ON freightclub.load_ratings(ratee_id);
  CREATE INDEX idx_load_ratings_rating ON freightclub.load_ratings(rating);
EXCEPTION WHEN duplicate_table THEN
  NULL;
END $$;
