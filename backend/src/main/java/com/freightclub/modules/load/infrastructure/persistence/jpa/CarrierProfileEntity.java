package com.freightclub.modules.load.infrastructure.persistence.jpa;

import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "carrier_profiles")
public class CarrierProfileEntity {

    @Id
    @Column(length = 36, nullable = false, updatable = false)
    private String id;

    @Column(name = "tenant_id", length = 36, nullable = false, updatable = false)
    private String tenantId;

    @Column(name = "preferred_equipment", length = 20, nullable = false)
    private String preferredEquipment;

    @Column(name = "service_area", length = 100, nullable = false)
    private String serviceArea;

    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;

    protected CarrierProfileEntity() {}

    public CarrierProfileEntity(String preferredEquipment, String serviceArea, String tenantId) {
        this.id = UUID.randomUUID().toString();
        this.tenantId = tenantId;
        this.preferredEquipment = preferredEquipment;
        this.serviceArea = serviceArea;
    }

    public String getId()                  { return id; }
    public String getTenantId()            { return tenantId; }
    public String getPreferredEquipment()  { return preferredEquipment; }
    public String getServiceArea()         { return serviceArea; }
    public OffsetDateTime getDeletedAt()   { return deletedAt; }
}
