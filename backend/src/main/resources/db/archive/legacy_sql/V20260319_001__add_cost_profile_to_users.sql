ALTER TABLE users
    ADD COLUMN monthly_fixed_costs       DECIMAL(10,2) NULL AFTER equipment_type,
    ADD COLUMN fuel_cost_per_gallon      DECIMAL(6,3)  NULL AFTER monthly_fixed_costs,
    ADD COLUMN miles_per_gallon          DECIMAL(6,2)  NULL AFTER fuel_cost_per_gallon,
    ADD COLUMN maintenance_cost_per_mile DECIMAL(6,4)  NULL AFTER miles_per_gallon,
    ADD COLUMN monthly_miles_target      INT           NULL AFTER maintenance_cost_per_mile,
    ADD COLUMN target_margin_per_mile    DECIMAL(6,4)  NULL AFTER monthly_miles_target;
