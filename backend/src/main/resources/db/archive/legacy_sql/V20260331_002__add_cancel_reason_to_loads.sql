-- Stores the reason a shipper provided when cancelling a load.
-- Required when the load was in CLAIMED or IN_TRANSIT state (trucker was affected).
-- NULL for loads cancelled before they were claimed.

ALTER TABLE loads
    ADD COLUMN cancel_reason TEXT NULL AFTER special_requirements;
