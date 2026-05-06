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

    @Column(name = "origin_zip", length = 10)
    private String originZip;

    @Column(name = "origin_address_1", length = 500)
    private String originAddress1;

    @Column(name = "origin_address_2", length = 500)
    private String originAddress2;

    @Column(name = "destination_city", length = 100)
    private String destinationCity;

    @Column(name = "destination_state", length = 2)
    private String destState;

    @Column(name = "destination_zip", length = 10)
    private String destinationZip;

    @Column(name = "destination_address_1", length = 500)
    private String destinationAddress1;

    @Column(name = "destination_address_2", length = 500)
    private String destinationAddress2;

    @Column(name = "pickup_from")
    private OffsetDateTime pickupFrom;

    @Column(name = "pickup_to")
    private OffsetDateTime pickupTo;

    @Column(name = "delivery_from")
    private OffsetDateTime deliveryFrom;

    @Column(name = "delivery_to")
    private OffsetDateTime deliveryTo;

    @Column(length = 255)
    private String commodity;

    @Column(name = "length_ft", precision = 8, scale = 2)
    private BigDecimal lengthFt;

    @Column(name = "width_ft", precision = 8, scale = 2)
    private BigDecimal widthFt;

    @Column(name = "height_ft", precision = 8, scale = 2)
    private BigDecimal heightFt;

    @Column(name = "payment_terms", length = 20)
    private String paymentTerms;

    @Column(name = "special_requirements", columnDefinition = "TEXT")
    private String specialRequirements;

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

    public String getOriginZip()               { return originZip; }
    public void setOriginZip(String v)         { this.originZip = v; }

    public String getOriginAddress1()          { return originAddress1; }
    public void setOriginAddress1(String v)    { this.originAddress1 = v; }

    public String getOriginAddress2()          { return originAddress2; }
    public void setOriginAddress2(String v)    { this.originAddress2 = v; }

    public String getDestinationCity()         { return destinationCity; }
    public void setDestinationCity(String v)   { this.destinationCity = v; }

    public String getDestState()               { return destState; }
    public void setDestState(String v)         { this.destState = v; }

    public String getDestinationZip()          { return destinationZip; }
    public void setDestinationZip(String v)    { this.destinationZip = v; }

    public String getDestinationAddress1()     { return destinationAddress1; }
    public void setDestinationAddress1(String v) { this.destinationAddress1 = v; }

    public String getDestinationAddress2()     { return destinationAddress2; }
    public void setDestinationAddress2(String v) { this.destinationAddress2 = v; }

    public OffsetDateTime getPickupFrom()      { return pickupFrom; }
    public void setPickupFrom(OffsetDateTime v) { this.pickupFrom = v; }

    public OffsetDateTime getPickupTo()        { return pickupTo; }
    public void setPickupTo(OffsetDateTime v)  { this.pickupTo = v; }

    public OffsetDateTime getDeliveryFrom()    { return deliveryFrom; }
    public void setDeliveryFrom(OffsetDateTime v) { this.deliveryFrom = v; }

    public OffsetDateTime getDeliveryTo()      { return deliveryTo; }
    public void setDeliveryTo(OffsetDateTime v) { this.deliveryTo = v; }

    public String getCommodity()               { return commodity; }
    public void setCommodity(String v)         { this.commodity = v; }

    public BigDecimal getLengthFt()            { return lengthFt; }
    public void setLengthFt(BigDecimal v)      { this.lengthFt = v; }

    public BigDecimal getWidthFt()             { return widthFt; }
    public void setWidthFt(BigDecimal v)       { this.widthFt = v; }

    public BigDecimal getHeightFt()            { return heightFt; }
    public void setHeightFt(BigDecimal v)      { this.heightFt = v; }

    public String getPaymentTerms()            { return paymentTerms; }
    public void setPaymentTerms(String v)      { this.paymentTerms = v; }

    public String getSpecialRequirements()     { return specialRequirements; }
    public void setSpecialRequirements(String v) { this.specialRequirements = v; }

    public EquipmentType getEquipmentType()    { return equipmentType; }
    public void setEquipmentType(EquipmentType v) { this.equipmentType = v; }

    public BigDecimal getPayRate()             { return payRate; }
    public void setPayRate(BigDecimal v)       { this.payRate = v; }

    public PayRateType getPayRateType()        { return payRateType; }
    public void setPayRateType(PayRateType v)  { this.payRateType = v; }

    public BigDecimal getDistanceMiles()       { return distanceMiles; }
    public void setDistanceMiles(BigDecimal v) { this.distanceMiles = v; }

    public String getCancelReason()            { return cancelReason; }
    public void setCancelReason(String v)      { this.cancelReason = v; }

    public OffsetDateTime getCreatedAt()       { return createdAt; }
    public OffsetDateTime getUpdatedAt()       { return updatedAt; }
    public OffsetDateTime getDeletedAt()       { return deletedAt; }
    public void setDeletedAt(OffsetDateTime v) { this.deletedAt = v; }
}
