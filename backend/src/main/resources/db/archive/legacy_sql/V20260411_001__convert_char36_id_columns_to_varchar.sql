-- Hibernate 6 maps String fields to JDBC Types#VARCHAR (12), but PostgreSQL stores
-- CHAR(36) as 'bpchar' (JDBC Types#CHAR = 1).  Even though Hibernate considers them
-- equivalent character types, the schema validator throws a type mismatch on startup.
--
-- This migration converts every CHAR(36) column in the public schema to varchar(36).
-- The cast is implicit in PostgreSQL (no data loss, FK constraints remain valid).

DO $$
DECLARE
    r record;
BEGIN
    FOR r IN
        SELECT table_name, column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND data_type = 'character'
          AND character_maximum_length = 36
        ORDER BY table_name, column_name
    LOOP
        EXECUTE format(
            'ALTER TABLE %I ALTER COLUMN %I TYPE varchar(36) USING %I::varchar(36)',
            r.table_name,
            r.column_name,
            r.column_name
        );
    END LOOP;
END $$;
