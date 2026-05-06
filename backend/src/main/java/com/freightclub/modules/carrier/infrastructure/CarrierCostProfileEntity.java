package com.freightclub.modules.carrier.infrastructure;

import com.freightclub.modules.carrier.domain.CarrierCostProfile;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "carrier_cost_profiles")
public class CarrierCostProfileEntity {

  @Id private String id;
  @Column(nullable = false) private String tenantId;
  @Column(nullable = false) private String truckerId;
  @Column(nullable = false) private BigDecimal monthlyFixedCosts;
  @Column(nullable = false) private BigDecimal fuelCostPerGallon;
  @Column(nullable = false) private BigDecimal milesPerGallon;
  @Column(nullable = false) private BigDecimal maintenanceCostPerMile;
  @Column(nullable = false) private int monthlyMilesTarget;
  @Column(nullable = false) private BigDecimal targetMarginPerMile;
  @Column(nullable = false) private OffsetDateTime createdAt;
  @Column(nullable = false) private OffsetDateTime updatedAt;
  private OffsetDateTime deletedAt;

  public CarrierCostProfileEntity() {}

  public CarrierCostProfileEntity(
      String id,
      String tenantId,
      String truckerId,
      BigDecimal monthlyFixedCosts,
      BigDecimal fuelCostPerGallon,
      BigDecimal milesPerGallon,
      BigDecimal maintenanceCostPerMile,
      int monthlyMilesTarget,
      BigDecimal targetMarginPerMile,
      OffsetDateTime createdAt,
      OffsetDateTime updatedAt,
      OffsetDateTime deletedAt) {
    this.id = id;
    this.tenantId = tenantId;
    this.truckerId = truckerId;
    this.monthlyFixedCosts = monthlyFixedCosts;
    this.fuelCostPerGallon = fuelCostPerGallon;
    this.milesPerGallon = milesPerGallon;
    this.maintenanceCostPerMile = maintenanceCostPerMile;
    this.monthlyMilesTarget = monthlyMilesTarget;
    this.targetMarginPerMile = targetMarginPerMile;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
  }

  public static CarrierCostProfileEntity fromDomain(CarrierCostProfile domain) {
    return new CarrierCostProfileEntity(
        domain.getId(),
        domain.getTenantId(),
        domain.getTruckerId(),
        domain.getMonthlyFixedCosts(),
        domain.getFuelCostPerGallon(),
        domain.getMilesPerGallon(),
        domain.getMaintenanceCostPerMile(),
        domain.getMonthlyMilesTarget(),
        domain.getTargetMarginPerMile(),
        domain.getCreatedAt(),
        domain.getUpdatedAt(),
        domain.getDeletedAt());
  }

  public CarrierCostProfile toDomain() {
    return new CarrierCostProfile(
        id,
        tenantId,
        truckerId,
        monthlyFixedCosts,
        fuelCostPerGallon,
        milesPerGallon,
        maintenanceCostPerMile,
        monthlyMilesTarget,
        targetMarginPerMile,
        createdAt,
        updatedAt,
        deletedAt);
  }

  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getTenantId() { return tenantId; }
  public void setTenantId(String tenantId) { this.tenantId = tenantId; }
  public String getTruckerId() { return truckerId; }
  public void setTruckerId(String truckerId) { this.truckerId = truckerId; }
  public BigDecimal getMonthlyFixedCosts() { return monthlyFixedCosts; }
  public void setMonthlyFixedCosts(BigDecimal monthlyFixedCosts) { this.monthlyFixedCosts = monthlyFixedCosts; }
  public BigDecimal getFuelCostPerGallon() { return fuelCostPerGallon; }
  public void setFuelCostPerGallon(BigDecimal fuelCostPerGallon) { this.fuelCostPerGallon = fuelCostPerGallon; }
  public BigDecimal getMilesPerGallon() { return milesPerGallon; }
  public void setMilesPerGallon(BigDecimal milesPerGallon) { this.milesPerGallon = milesPerGallon; }
  public BigDecimal getMaintenanceCostPerMile() { return maintenanceCostPerMile; }
  public void setMaintenanceCostPerMile(BigDecimal maintenanceCostPerMile) { this.maintenanceCostPerMile = maintenanceCostPerMile; }
  public int getMonthlyMilesTarget() { return monthlyMilesTarget; }
  public void setMonthlyMilesTarget(int monthlyMilesTarget) { this.monthlyMilesTarget = monthlyMilesTarget; }
  public BigDecimal getTargetMarginPerMile() { return targetMarginPerMile; }
  public void setTargetMarginPerMile(BigDecimal targetMarginPerMile) { this.targetMarginPerMile = targetMarginPerMile; }
  public OffsetDateTime getCreatedAt() { return createdAt; }
  public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
  public OffsetDateTime getUpdatedAt() { return updatedAt; }
  public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
  public OffsetDateTime getDeletedAt() { return deletedAt; }
  public void setDeletedAt(OffsetDateTime deletedAt) { this.deletedAt = deletedAt; }
}
