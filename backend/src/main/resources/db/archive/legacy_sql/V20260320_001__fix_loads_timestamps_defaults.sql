-- Add DEFAULT CURRENT_TIMESTAMP and ON UPDATE CURRENT_TIMESTAMP to loads timestamps.
-- V20260312_001 defined created_at/updated_at as NOT NULL without defaults, requiring
-- the application to supply them on every INSERT — error-prone and inconsistent with
-- all other tables (tenants, users, refresh_tokens all have the defaults).

ALTER TABLE loads
    MODIFY COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    MODIFY COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
