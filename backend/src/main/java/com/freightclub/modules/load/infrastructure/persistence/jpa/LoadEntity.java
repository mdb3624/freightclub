package com.freightclub.modules.load.infrastructure.persistence.jpa;

import com.freightclub.domain.EquipmentType;
import com.freightclub.modules.load.domain.LoadStatus;
import com.freightclub.modules.load.domain.PayRateType;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "loads")
public class LoadEntity {

    @Id
    @Column(columnDefinition = "CHAR(36)", nullable = false, updatable = false)
    private String id;

    @Column(name = "tenant_id", columnDefinition = "CHAR(36)", nullable = false, updatable = false)
    private String tenantId;

    @Column(name = "shipper_id", columnDefinition = "CHAR(36)", nullable = false, updatable = false)
    private String shipperId;

    @Column(name = "trucker_id", columnDefinition = "CHAR(36)")
    private String truckerId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LoadStatus status;

    @Column(name = "weight_lbs", nullable = false, precision = 10, scale = 2)
    private BigDecimal weightLbs;

    @Column(name = "origin_city", length = 100)
    private String originCity;

    @Column(name = "origin_state", length = 2)
    private String originState;

    @Column(name = "dest_state", length = 2)
    private String destState;

    @Enumerated(EnumType.STRING)
    @Column(name = "equipment_type", length = 30)
    private EquipmentType equipmentType;

    @Column(name = "pay_rate", precision = 10, scale = 2)
    private BigDecimal payRate;

    @Enumerated(EnumType.STRING)
    @Column(name = "pay_rate_type", length = 20)
    private PayRateType payRateType;

    @Column(name = "distance_miles", precision = 8, scale = 2)
    private BigDecimal distanceMiles;

    @Column(name = "pod_url", columnDefinition = "TEXT")
    private String podUrl;

    @Column(name = "cancel_reason", columnDefinition = "TEXT")
    private String cancelReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;

    @PrePersist
    void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    public String getId()                      { return id; }
    public void setId(String id)               { this.id = id; }

    public String getTenantId()                { return tenantId; }
    public void setTenantId(String v)          { this.tenantId = v; }

    public String getShipperId()               { return shipperId; }
    public void setShipperId(String v)         { this.shipperId = v; }

    public String getTruckerId()               { return truckerId; }
    public void setTruckerId(String v)         { this.truckerId = v; }

    public LoadStatus getStatus()              { return status; }
    public void setStatus(LoadStatus v)        { this.status = v; }

    public BigDecimal getWeightLbs()           { return weightLbs; }
    public void setWeightLbs(BigDecimal v)     { this.weightLbs = v; }

    public String getOriginCity()              { return originCity; }
    public void setOriginCity(String v)        { this.originCity = v; }

    public String getOriginState()             { return originState; }
    public void setOriginState(String v)       { this.originState = v; }

    public String getDestState()               { return destState; }
    public void setDestState(String v)         { this.destState = v; }

    public EquipmentType getEquipmentType()    { return equipmentType; }
    public void setEquipmentType(EquipmentType v) { this.equipmentType = v; }

    public BigDecimal getPayRate()             { return payRate; }
    public void setPayRate(BigDecimal v)       { this.payRate = v; }

    public PayRateType getPayRateType()        { return payRateType; }
    public void setPayRateType(PayRateType v)  { this.payRateType = v; }

    public BigDecimal getDistanceMiles()       { return distanceMiles; }
    public void setDistanceMiles(BigDecimal v) { this.distanceMiles = v; }

    public String getPodUrl()                  { return podUrl; }
    public void setPodUrl(String v)            { this.podUrl = v; }

    public String getCancelReason()            { return cancelReason; }
    public void setCancelReason(String v)      { this.cancelReason = v; }

    public OffsetDateTime getCreatedAt()       { return createdAt; }
    public OffsetDateTime getUpdatedAt()       { return updatedAt; }
    public OffsetDateTime getDeletedAt()       { return deletedAt; }
    public void setDeletedAt(OffsetDateTime v) { this.deletedAt = v; }
}
