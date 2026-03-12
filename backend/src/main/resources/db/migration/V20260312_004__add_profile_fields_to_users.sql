ALTER TABLE users
    ADD COLUMN business_name            VARCHAR(255)    NULL        AFTER last_name,
    ADD COLUMN phone                    VARCHAR(20)     NULL        AFTER business_name,
    ADD COLUMN billing_address          VARCHAR(500)    NULL        AFTER phone,
    ADD COLUMN billing_city             VARCHAR(100)    NULL        AFTER billing_address,
    ADD COLUMN billing_state            VARCHAR(100)    NULL        AFTER billing_city,
    ADD COLUMN billing_zip              VARCHAR(10)     NULL        AFTER billing_state,
    ADD COLUMN default_pickup_address   VARCHAR(500)    NULL        AFTER billing_zip,
    ADD COLUMN default_pickup_city      VARCHAR(100)    NULL        AFTER default_pickup_address,
    ADD COLUMN default_pickup_state     VARCHAR(100)    NULL        AFTER default_pickup_city,
    ADD COLUMN default_pickup_zip       VARCHAR(10)     NULL        AFTER default_pickup_state,
    ADD COLUMN notify_email             TINYINT(1)      NOT NULL    DEFAULT 1 AFTER default_pickup_zip,
    ADD COLUMN notify_sms               TINYINT(1)      NOT NULL    DEFAULT 0 AFTER notify_email,
    ADD COLUMN notify_in_app            TINYINT(1)      NOT NULL    DEFAULT 1 AFTER notify_sms;
