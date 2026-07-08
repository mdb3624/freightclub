-- backend/src/main/resources/db/migration/V20260708_1500__CarrierIdentityCredentials_US730h.sql
-- US-730h (CHG-US730-008): additive-only credentials/equipment-detail columns
-- on users. Confirmed via ARCH Platform Reuse Check that equipment_type,
-- mc_number, dot_number already exist and are reused as-is — this migration
-- only adds the NEW fields the Carrier Profile screen needs.

ALTER TABLE freightclub.users
  ADD COLUMN equipment_year VARCHAR(4),
  ADD COLUMN equipment_make VARCHAR(50),
  ADD COLUMN equipment_model VARCHAR(50),
  ADD COLUMN license_plate VARCHAR(20),
  ADD COLUMN vin VARCHAR(17),
  ADD COLUMN cdl_class VARCHAR(10),
  ADD COLUMN cdl_expiry DATE,
  ADD COLUMN insurance_carrier VARCHAR(100),
  ADD COLUMN insurance_expiry DATE,
  ADD COLUMN med_card_expiry DATE;

ALTER TABLE freightclub.users
  ADD CONSTRAINT chk_cdl_class
  CHECK (cdl_class IS NULL OR cdl_class IN ('CLASS_A', 'CLASS_B', 'CLASS_C'));
