-- Flyway Migration: Add new equipment types and payment terms
-- Date: 2026-06-17 11:00 UTC
-- Phase: US-103-v2 Load Creation Redesign
-- Purpose: Extend equipment type options (REFRIGERATED, TANKER, SPECIALIZED) and payment terms (IMMEDIATE, NET_14)
-- Note: These values are managed at the Java enum level. Database columns are VARCHAR without CHECK constraints.

-- Documentation: Equipment Type values now supported:
-- - DRY_VAN (existing)
-- - FLATBED (existing)
-- - REEFER (existing, kept for backward compat)
-- - STEP_DECK (existing)
-- - REFRIGERATED (new, replaces REEFER in UI)
-- - TANKER (new)
-- - SPECIALIZED (new)

-- Documentation: Payment Terms values now supported:
-- - QUICK_PAY (existing, kept for backward compat)
-- - NET_7 (existing)
-- - NET_15 (existing, kept for backward compat)
-- - NET_30 (existing)
-- - IMMEDIATE (new, same-day/next-day payout)
-- - NET_14 (new)

-- No database schema changes required: equipment_type and payment_terms columns accept VARCHAR strings
-- Application layer (Java enums) validates values during deserialization
