ALTER TABLE loads
    ADD COLUMN payment_terms VARCHAR(20) NULL AFTER pay_rate_type;
