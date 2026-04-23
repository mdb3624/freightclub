-- Phase 4: Ratings & Reviews
-- One rating per load per reviewer. Trucker rates shipper (reviewer_role = TRUCKER),
-- shipper rates trucker (reviewer_role = SHIPPER). Both can only rate after delivery.

CREATE TABLE load_ratings (
    id            CHAR(36)    NOT NULL,
    tenant_id     CHAR(36)    NOT NULL,
    load_id       CHAR(36)    NOT NULL,
    reviewer_id   CHAR(36)    NOT NULL,
    reviewed_id   CHAR(36)    NOT NULL,
    reviewer_role VARCHAR(10) NOT NULL,
    stars         TINYINT     NOT NULL,
    comment       TEXT        NULL,
    created_at    DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_ratings_load       FOREIGN KEY (load_id)     REFERENCES loads(id),
    CONSTRAINT fk_ratings_reviewer   FOREIGN KEY (reviewer_id) REFERENCES users(id),
    CONSTRAINT fk_ratings_reviewed   FOREIGN KEY (reviewed_id) REFERENCES users(id),
    CONSTRAINT chk_ratings_role      CHECK (reviewer_role IN ('SHIPPER', 'TRUCKER')),
    CONSTRAINT chk_ratings_stars     CHECK (stars BETWEEN 1 AND 5),
    CONSTRAINT uq_rating_per_load    UNIQUE (load_id, reviewer_id),
    INDEX idx_ratings_reviewed       (reviewed_id),
    INDEX idx_ratings_load           (load_id),
    INDEX idx_ratings_reviewer       (reviewer_id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
