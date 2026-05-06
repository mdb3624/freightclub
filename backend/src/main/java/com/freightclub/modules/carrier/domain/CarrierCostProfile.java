package com.freightclub.modules.carrier.domain;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

public class CarrierCostProfile {

  private String id;
  private String tenantId;
  private String truckerId;
  private BigDecimal monthlyFixedCosts;      // e.g., $2500 (insurance, permits, etc.)
  private BigDecimal fuelCostPerGallon;      // e.g., $3.50
  private BigDecimal milesPerGallon;         // e.g., 6.5
  private BigDecimal maintenanceCostPerMile; // e.g., $0.15
  private int monthlyMilesTarget;            // e.g., 10000
  private BigDecimal targetMarginPerMile;    // e.g., $0.50 (desired profit per mile)
  private OffsetDateTime createdAt;
  private OffsetDateTime updatedAt;
  private OffsetDateTime deletedAt;

  public CarrierCostProfile() {}

  public CarrierCostProfile(
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

  // Factory: Create new cost profile
  public static CarrierCostProfile createNew(
      String tenantId,
      String truckerId,
      BigDecimal monthlyFixedCosts,
      BigDecimal fuelCostPerGallon,
      BigDecimal milesPerGallon,
      BigDecimal maintenanceCostPerMile,
      int monthlyMilesTarget,
      BigDecimal targetMarginPerMile) {
    return new CarrierCostProfile(
        java.util.UUID.randomUUID().toString(),
        tenantId,
        truckerId,
        monthlyFixedCosts,
        fuelCostPerGallon,
        milesPerGallon,
        maintenanceCostPerMile,
        monthlyMilesTarget,
        targetMarginPerMile,
        OffsetDateTime.now(ZoneOffset.UTC),
        OffsetDateTime.now(ZoneOffset.UTC),
        null);
  }

  // Cost Profile Formula calculations
  public BigDecimal calculateFixedCPM() {
    // Fixed CPM = Monthly Fixed Costs ÷ Monthly Miles Target
    if (monthlyMilesTarget == 0) return BigDecimal.ZERO;
    return monthlyFixedCosts.divide(
        new BigDecimal(monthlyMilesTarget), 4, java.math.RoundingMode.HALF_UP);
  }

  public BigDecimal calculateFuelCPM() {
    // Fuel CPM = Fuel Cost per Gallon ÷ Miles per Gallon
    if (milesPerGallon.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;
    return fuelCostPerGallon.divide(milesPerGallon, 4, java.math.RoundingMode.HALF_UP);
  }

  public BigDecimal calculateVariableCPM() {
    // Variable CPM = Fuel CPM + Maintenance Cost per Mile
    return calculateFuelCPM().add(maintenanceCostPerMile);
  }

  public BigDecimal calculateTotalCPM() {
    // Total CPM = Fixed CPM + Variable CPM
    return calculateFixedCPM().add(calculateVariableCPM());
  }

  public BigDecimal calculateMinimumRPM() {
    // Minimum RPM = Total CPM + Target Margin per Mile
    return calculateTotalCPM().add(targetMarginPerMile);
  }

  public void update(
      BigDecimal monthlyFixedCosts,
      BigDecimal fuelCostPerGallon,
      BigDecimal milesPerGallon,
      BigDecimal maintenanceCostPerMile,
      int monthlyMilesTarget,
      BigDecimal targetMarginPerMile) {
    this.monthlyFixedCosts = monthlyFixedCosts;
    this.fuelCostPerGallon = fuelCostPerGallon;
    this.milesPerGallon = milesPerGallon;
    this.maintenanceCostPerMile = maintenanceCostPerMile;
    this.monthlyMilesTarget = monthlyMilesTarget;
    this.targetMarginPerMile = targetMarginPerMile;
    this.updatedAt = OffsetDateTime.now(ZoneOffset.UTC);
  }

  public void softDelete() {
    this.deletedAt = OffsetDateTime.now(ZoneOffset.UTC);
  }

  // Getters
  public String getId() { return id; }
  public String getTenantId() { return tenantId; }
  public String getTruckerId() { return truckerId; }
  public BigDecimal getMonthlyFixedCosts() { return monthlyFixedCosts; }
  public BigDecimal getFuelCostPerGallon() { return fuelCostPerGallon; }
  public BigDecimal getMilesPerGallon() { return milesPerGallon; }
  public BigDecimal getMaintenanceCostPerMile() { return maintenanceCostPerMile; }
  public int getMonthlyMilesTarget() { return monthlyMilesTarget; }
  public BigDecimal getTargetMarginPerMile() { return targetMarginPerMile; }
  public OffsetDateTime getCreatedAt() { return createdAt; }
  public OffsetDateTime getUpdatedAt() { return updatedAt; }
  public OffsetDateTime getDeletedAt() { return deletedAt; }
}
