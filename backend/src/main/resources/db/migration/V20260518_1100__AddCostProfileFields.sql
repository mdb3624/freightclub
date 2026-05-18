-- Add 11 cost profile fields for Cost Per Mile (CPM) Calculator (US-757)
-- All fields are nullable to allow gradual adoption

ALTER TABLE carrier_profiles
ADD COLUMN truck_payment_lease NUMERIC(10, 2) NULL
  COMMENT 'Monthly truck payment or lease cost',
ADD COLUMN insurance NUMERIC(10, 2) NULL
  COMMENT 'Annual or monthly insurance premium',
ADD COLUMN ifta_irp_permits NUMERIC(10, 2) NULL
  COMMENT 'IFTA/IRP permits and registration costs',
ADD COLUMN phone_eld_misc NUMERIC(10, 2) NULL
  COMMENT 'Monthly phone, ELD, and miscellaneous expenses',
ADD COLUMN per_diem_daily_rate NUMERIC(10, 2) NULL
  COMMENT 'Daily per diem allowance',
ADD COLUMN per_diem_days_per_month INTEGER NULL
  COMMENT 'Number of days per month eligible for per diem',
ADD COLUMN fuel_cost_per_gallon NUMERIC(6, 3) NULL
  COMMENT 'Average fuel cost per gallon',
ADD COLUMN miles_per_gallon NUMERIC(4, 1) NULL
  COMMENT 'Truck fuel efficiency in miles per gallon',
ADD COLUMN maintenance_cost_per_mile NUMERIC(6, 3) NULL
  COMMENT 'Estimated maintenance cost per mile',
ADD COLUMN monthly_miles_target INTEGER NULL
  COMMENT 'Target monthly miles for planning',
ADD COLUMN target_margin_per_mile NUMERIC(6, 3) NULL
  COMMENT 'Target profit margin per mile (CPM goal)';
