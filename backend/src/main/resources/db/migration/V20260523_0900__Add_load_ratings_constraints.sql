-- Enforce one rating per (load, rater) pair at the DB level
-- and add a CHECK constraint so the score is always 1-5.
ALTER TABLE freightclub.load_ratings
    ADD CONSTRAINT uq_load_ratings_load_rater UNIQUE (load_id, rater_id);

ALTER TABLE freightclub.load_ratings
    ADD CONSTRAINT chk_load_ratings_score CHECK (rating BETWEEN 1 AND 5);
