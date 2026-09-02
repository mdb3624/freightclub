-- US-876 (Shipper Admin) / US-878 (Carrier Admin): org-level default fields, promoted from
-- the equivalent per-user columns on `users`. All nullable — null means "no org default set",
-- distinct from an explicit value, so inherit-on-join (AuthService.register) and the 1-seat
-- collapse display rule (BR-5 in both stories) can tell "unset" apart from "set to blank."
DO $$
BEGIN
    ALTER TABLE freightclub.tenants
        ADD COLUMN default_pickup_address_1 VARCHAR(500),
        ADD COLUMN default_pickup_address_2 VARCHAR(500),
        ADD COLUMN default_pickup_city VARCHAR(100),
        ADD COLUMN default_pickup_state CHAR(2),
        ADD COLUMN default_pickup_zip VARCHAR(10),
        ADD COLUMN billing_address_1 VARCHAR(500),
        ADD COLUMN billing_address_2 VARCHAR(500),
        ADD COLUMN billing_city VARCHAR(100),
        ADD COLUMN billing_state CHAR(2),
        ADD COLUMN billing_zip VARCHAR(10),
        ADD COLUMN fuel_cost_per_gallon NUMERIC(6, 3),
        ADD COLUMN maintenance_cost_per_mile NUMERIC(6, 4),
        ADD COLUMN monthly_fixed_costs NUMERIC(10, 2),
        ADD COLUMN target_margin_per_mile NUMERIC(6, 4),
        ADD COLUMN notify_email BOOLEAN,
        ADD COLUMN notify_sms BOOLEAN,
        ADD COLUMN notify_in_app BOOLEAN;
EXCEPTION WHEN duplicate_column THEN
    NULL;
END $$;
