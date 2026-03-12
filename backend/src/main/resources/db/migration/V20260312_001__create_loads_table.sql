CREATE TABLE loads (
    id              CHAR(36)        NOT NULL,
    tenant_id       CHAR(36)        NOT NULL,
    shipper_id      CHAR(36)        NOT NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'DRAFT',
    origin          VARCHAR(500)    NOT NULL,
    destination     VARCHAR(500)    NOT NULL,
    pickup_from     DATETIME        NOT NULL,
    pickup_to       DATETIME        NOT NULL,
    delivery_from   DATETIME        NOT NULL,
    delivery_to     DATETIME        NOT NULL,
    commodity       VARCHAR(255)    NOT NULL,
    weight_lbs      DECIMAL(10,2)   NOT NULL,
    equipment_type  VARCHAR(20)     NOT NULL,
    pay_rate        DECIMAL(10,2)   NOT NULL,
    special_requirements TEXT       NULL,
    created_at      DATETIME        NOT NULL,
    updated_at      DATETIME        NOT NULL,
    deleted_at      DATETIME        NULL,

    PRIMARY KEY (id),
    CONSTRAINT fk_loads_tenant  FOREIGN KEY (tenant_id)  REFERENCES tenants(id),
    CONSTRAINT fk_loads_shipper FOREIGN KEY (shipper_id) REFERENCES users(id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE INDEX idx_loads_tenant_shipper  ON loads (tenant_id, shipper_id);
CREATE INDEX idx_loads_tenant_status   ON loads (tenant_id, status);
CREATE INDEX idx_loads_tenant_created  ON loads (tenant_id, created_at);
