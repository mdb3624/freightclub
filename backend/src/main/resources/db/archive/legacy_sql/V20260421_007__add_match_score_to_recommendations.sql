-- Adds match_score to support Top-N queries and future scorer extensibility.

ALTER TABLE match_recommendations
    ADD COLUMN IF NOT EXISTS match_score INTEGER NOT NULL DEFAULT 0;

-- Supports "top-N recommendations for a load" queries efficiently.
CREATE INDEX IF NOT EXISTS idx_match_recommendations_score
    ON match_recommendations (tenant_id, load_id, match_score DESC);
