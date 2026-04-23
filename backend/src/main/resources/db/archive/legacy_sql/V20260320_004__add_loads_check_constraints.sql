-- Add CHECK constraints to all enum-backed columns on loads.
-- Java enums (LoadStatus, EquipmentType, PayRateType, PaymentTerms) enforce valid values
-- at the application layer but do not protect against direct SQL inserts or future bugs
-- that bypass the service layer. MySQL 8.0.16+ enforces CHECK constraints at write time.

ALTER TABLE loads
    ADD CONSTRAINT chk_loads_status
        CHECK (status IN ('DRAFT', 'OPEN', 'CLAIMED', 'IN_TRANSIT', 'DELIVERED', 'SETTLED', 'CANCELLED')),
    ADD CONSTRAINT chk_loads_equipment_type
        CHECK (equipment_type IN ('DRY_VAN', 'FLATBED', 'REEFER', 'STEP_DECK')),
    ADD CONSTRAINT chk_loads_pay_rate_type
        CHECK (pay_rate_type IN ('FLAT_RATE', 'PER_MILE')),
    ADD CONSTRAINT chk_loads_payment_terms
        CHECK (payment_terms IN ('QUICK_PAY', 'NET_7', 'NET_15', 'NET_30') OR payment_terms IS NULL);
