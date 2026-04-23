-- Make loads.payment_terms NOT NULL.
-- Every published load requires payment terms; NULL was only allowed because the column
-- was added (V20260317_002) with NULL to avoid breaking existing rows at migration time.
--
-- First: default any remaining NULLs to NET_30 as a safe fallback.
-- Then: tighten the column to NOT NULL.

UPDATE loads
SET payment_terms = 'NET_30'
WHERE payment_terms IS NULL;

ALTER TABLE loads
    MODIFY COLUMN payment_terms VARCHAR(20) NOT NULL;
