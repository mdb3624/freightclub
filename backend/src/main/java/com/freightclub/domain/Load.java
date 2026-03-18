package com.freightclub.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "loads")
public class Load {

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
    @Column(nullable = false, columnDefinition = "VARCHAR(20)")
    private LoadStatus status;

    @Column(name = "origin_city", nullable = false, length = 100)
    private String originCity;

    @Column(name = "origin_state", nullable = false, length = 50)
    private String originState;

    @Column(name = "origin_zip", nullable = false, length = 10)
    private String originZip;

    @Column(name = "origin_address_1", nullable = false, length = 500)
    private String originAddress1;

    @Column(name = "origin_address_2", length = 500)
    private String originAddress2;

    @Column(name = "destination_city", nullable = false, length = 100)
    private String destinationCity;

    @Column(name = "destination_state", nullable = false, length = 50)
    private String destinationState;

    @Column(name = "destination_zip", nullable = false, length = 10)
    private String destinationZip;

    @Column(name = "destination_address_1", nullable = false, length = 500)
    private String destinationAddress1;

    @Column(name = "destination_address_2", length = 500)
    private String destinationAddress2;

    @Column(name = "distance_miles")
    private BigDecimal distanceMiles;

    @Column(name = "pickup_from", nullable = false)
    private LocalDateTime pickupFrom;

    @Column(name = "pickup_to", nullable = false)
    private LocalDateTime pickupTo;

    @Column(name = "delivery_from", nullable = false)
    private LocalDateTime deliveryFrom;

    @Column(name = "delivery_to", nullable = false)
    private LocalDateTime deliveryTo;

    @Column(nullable = false, length = 255)
    private String commodity;

    @Column(name = "weight_lbs", nullable = false)
    private BigDecimal weightLbs;

    @Column(name = "length_ft")
    private BigDecimal lengthFt;

    @Column(name = "width_ft")
    private BigDecimal widthFt;

    @Column(name = "height_ft")
    private BigDecimal heightFt;

    @Enumerated(EnumType.STRING)
    @Column(name = "equipment_type", nullable = false, columnDefinition = "VARCHAR(20)")
    private EquipmentType equipmentType;

    @Column(name = "pay_rate", nullable = false)
    private BigDecimal payRate;

    @Enumerated(EnumType.STRING)
    @Column(name = "pay_rate_type", nullable = false, columnDefinition = "VARCHAR(20)")
    private PayRateType payRateType;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_terms", columnDefinition = "VARCHAR(20)")
    private PaymentTerms paymentTerms;

    @Column(name = "special_requirements", columnDefinition = "TEXT")
    private String specialRequirements;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    private void assignId() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
    }

    public String getId() { return id; }
    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }
    public String getShipperId() { return shipperId; }
    public void setShipperId(String shipperId) { this.shipperId = shipperId; }
    public String getTruckerId() { return truckerId; }
    public void setTruckerId(String truckerId) { this.truckerId = truckerId; }
    public LoadStatus getStatus() { return status; }
    public void setStatus(LoadStatus status) { this.status = status; }
    public String getOriginCity() { return originCity; }
    public void setOriginCity(String originCity) { this.originCity = originCity; }
    public String getOriginState() { return originState; }
    public void setOriginState(String originState) { this.originState = originState; }
    public String getOriginZip() { return originZip; }
    public void setOriginZip(String originZip) { this.originZip = originZip; }
    public String getOriginAddress1() { return originAddress1; }
    public void setOriginAddress1(String originAddress1) { this.originAddress1 = originAddress1; }
    public String getOriginAddress2() { return originAddress2; }
    public void setOriginAddress2(String originAddress2) { this.originAddress2 = originAddress2; }
    public String getDestinationCity() { return destinationCity; }
    public void setDestinationCity(String destinationCity) { this.destinationCity = destinationCity; }
    public String getDestinationState() { return destinationState; }
    public void setDestinationState(String destinationState) { this.destinationState = destinationState; }
    public String getDestinationZip() { return destinationZip; }
    public void setDestinationZip(String destinationZip) { this.destinationZip = destinationZip; }
    public String getDestinationAddress1() { return destinationAddress1; }
    public void setDestinationAddress1(String destinationAddress1) { this.destinationAddress1 = destinationAddress1; }
    public String getDestinationAddress2() { return destinationAddress2; }
    public void setDestinationAddress2(String destinationAddress2) { this.destinationAddress2 = destinationAddress2; }
    public BigDecimal getDistanceMiles() { return distanceMiles; }
    public void setDistanceMiles(BigDecimal distanceMiles) { this.distanceMiles = distanceMiles; }
    public LocalDateTime getPickupFrom() { return pickupFrom; }
    public void setPickupFrom(LocalDateTime pickupFrom) { this.pickupFrom = pickupFrom; }
    public LocalDateTime getPickupTo() { return pickupTo; }
    public void setPickupTo(LocalDateTime pickupTo) { this.pickupTo = pickupTo; }
    public LocalDateTime getDeliveryFrom() { return deliveryFrom; }
    public void setDeliveryFrom(LocalDateTime deliveryFrom) { this.deliveryFrom = deliveryFrom; }
    public LocalDateTime getDeliveryTo() { return deliveryTo; }
    public void setDeliveryTo(LocalDateTime deliveryTo) { this.deliveryTo = deliveryTo; }
    public String getCommodity() { return commodity; }
    public void setCommodity(String commodity) { this.commodity = commodity; }
    public BigDecimal getWeightLbs() { return weightLbs; }
    public void setWeightLbs(BigDecimal weightLbs) { this.weightLbs = weightLbs; }
    public BigDecimal getLengthFt() { return lengthFt; }
    public void setLengthFt(BigDecimal lengthFt) { this.lengthFt = lengthFt; }
    public BigDecimal getWidthFt() { return widthFt; }
    public void setWidthFt(BigDecimal widthFt) { this.widthFt = widthFt; }
    public BigDecimal getHeightFt() { return heightFt; }
    public void setHeightFt(BigDecimal heightFt) { this.heightFt = heightFt; }
    public EquipmentType getEquipmentType() { return equipmentType; }
    public void setEquipmentType(EquipmentType equipmentType) { this.equipmentType = equipmentType; }
    public BigDecimal getPayRate() { return payRate; }
    public void setPayRate(BigDecimal payRate) { this.payRate = payRate; }
    public PayRateType getPayRateType() { return payRateType; }
    public void setPayRateType(PayRateType payRateType) { this.payRateType = payRateType; }
    public PaymentTerms getPaymentTerms() { return paymentTerms; }
    public void setPaymentTerms(PaymentTerms paymentTerms) { this.paymentTerms = paymentTerms; }
    public String getSpecialRequirements() { return specialRequirements; }
    public void setSpecialRequirements(String specialRequirements) { this.specialRequirements = specialRequirements; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public LocalDateTime getDeletedAt() { return deletedAt; }
    public void setDeletedAt(LocalDateTime deletedAt) { this.deletedAt = deletedAt; }
}
