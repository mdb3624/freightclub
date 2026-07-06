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

  private BigDecimal monthlyFixedCosts;
  private BigDecimal fuelCostPerGallon;
  @Column(nullable = false) private BigDecimal milesPerGallon;
  private BigDecimal maintenanceCostPerMile;
  private Integer monthlyMilesTarget;
  private BigDecimal targetMarginPerMile;

  private String dieselRegion;
  private BigDecimal additionalCostPerMile;
  private BigDecimal truckPaymentMonthly;
  private BigDecimal insuranceMonthly;
  private BigDecimal permitsMonthly;
  private Integer annualMiles;
  private BigDecimal weeklyIncomeGoal;
  private Integer weeksWorkedPerYear;

  @Column(nullable = false) private OffsetDateTime createdAt;
  @Column(nullable = false) private OffsetDateTime updatedAt;
  private OffsetDateTime deletedAt;

  public CarrierCostProfileEntity() {}

  public CarrierCostProfileEntity(
      String id, String tenantId, String truckerId,
      BigDecimal monthlyFixedCosts, BigDecimal fuelCostPerGallon, BigDecimal milesPerGallon,
      BigDecimal maintenanceCostPerMile, Integer monthlyMilesTarget, BigDecimal targetMarginPerMile,
      String dieselRegion, BigDecimal additionalCostPerMile, BigDecimal truckPaymentMonthly,
      BigDecimal insuranceMonthly, BigDecimal permitsMonthly, Integer annualMiles,
      BigDecimal weeklyIncomeGoal, Integer weeksWorkedPerYear,
      OffsetDateTime createdAt, OffsetDateTime updatedAt, OffsetDateTime deletedAt) {
    this.id = id;
    this.tenantId = tenantId;
    this.truckerId = truckerId;
    this.monthlyFixedCosts = monthlyFixedCosts;
    this.fuelCostPerGallon = fuelCostPerGallon;
    this.milesPerGallon = milesPerGallon;
    this.maintenanceCostPerMile = maintenanceCostPerMile;
    this.monthlyMilesTarget = monthlyMilesTarget;
    this.targetMarginPerMile = targetMarginPerMile;
    this.dieselRegion = dieselRegion;
    this.additionalCostPerMile = additionalCostPerMile;
    this.truckPaymentMonthly = truckPaymentMonthly;
    this.insuranceMonthly = insuranceMonthly;
    this.permitsMonthly = permitsMonthly;
    this.annualMiles = annualMiles;
    this.weeklyIncomeGoal = weeklyIncomeGoal;
    this.weeksWorkedPerYear = weeksWorkedPerYear;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
  }

  public static CarrierCostProfileEntity fromDomain(CarrierCostProfile d) {
    return new CarrierCostProfileEntity(
        d.getId(), d.getTenantId(), d.getTruckerId(),
        d.getMonthlyFixedCosts(), d.getFuelCostPerGallon(), d.getMilesPerGallon(),
        d.getMaintenanceCostPerMile(), d.getMonthlyMilesTarget(), d.getTargetMarginPerMile(),
        d.getDieselRegion(), d.getAdditionalCostPerMile(), d.getTruckPaymentMonthly(),
        d.getInsuranceMonthly(), d.getPermitsMonthly(), d.getAnnualMiles(),
        d.getWeeklyIncomeGoal(), d.getWeeksWorkedPerYear(),
        d.getCreatedAt(), d.getUpdatedAt(), d.getDeletedAt());
  }

  public CarrierCostProfile toDomain() {
    return new CarrierCostProfile(
        id, tenantId, truckerId,
        monthlyFixedCosts, fuelCostPerGallon, milesPerGallon,
        maintenanceCostPerMile, monthlyMilesTarget, targetMarginPerMile,
        dieselRegion, additionalCostPerMile, truckPaymentMonthly,
        insuranceMonthly, permitsMonthly, annualMiles,
        weeklyIncomeGoal, weeksWorkedPerYear,
        createdAt, updatedAt, deletedAt);
  }

  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getTenantId() { return tenantId; }
  public void setTenantId(String tenantId) { this.tenantId = tenantId; }
  public String getTruckerId() { return truckerId; }
  public void setTruckerId(String truckerId) { this.truckerId = truckerId; }
  public BigDecimal getMonthlyFixedCosts() { return monthlyFixedCosts; }
  public void setMonthlyFixedCosts(BigDecimal v) { this.monthlyFixedCosts = v; }
  public BigDecimal getFuelCostPerGallon() { return fuelCostPerGallon; }
  public void setFuelCostPerGallon(BigDecimal v) { this.fuelCostPerGallon = v; }
  public BigDecimal getMilesPerGallon() { return milesPerGallon; }
  public void setMilesPerGallon(BigDecimal v) { this.milesPerGallon = v; }
  public BigDecimal getMaintenanceCostPerMile() { return maintenanceCostPerMile; }
  public void setMaintenanceCostPerMile(BigDecimal v) { this.maintenanceCostPerMile = v; }
  public Integer getMonthlyMilesTarget() { return monthlyMilesTarget; }
  public void setMonthlyMilesTarget(Integer v) { this.monthlyMilesTarget = v; }
  public BigDecimal getTargetMarginPerMile() { return targetMarginPerMile; }
  public void setTargetMarginPerMile(BigDecimal v) { this.targetMarginPerMile = v; }
  public String getDieselRegion() { return dieselRegion; }
  public void setDieselRegion(String v) { this.dieselRegion = v; }
  public BigDecimal getAdditionalCostPerMile() { return additionalCostPerMile; }
  public void setAdditionalCostPerMile(BigDecimal v) { this.additionalCostPerMile = v; }
  public BigDecimal getTruckPaymentMonthly() { return truckPaymentMonthly; }
  public void setTruckPaymentMonthly(BigDecimal v) { this.truckPaymentMonthly = v; }
  public BigDecimal getInsuranceMonthly() { return insuranceMonthly; }
  public void setInsuranceMonthly(BigDecimal v) { this.insuranceMonthly = v; }
  public BigDecimal getPermitsMonthly() { return permitsMonthly; }
  public void setPermitsMonthly(BigDecimal v) { this.permitsMonthly = v; }
  public Integer getAnnualMiles() { return annualMiles; }
  public void setAnnualMiles(Integer v) { this.annualMiles = v; }
  public BigDecimal getWeeklyIncomeGoal() { return weeklyIncomeGoal; }
  public void setWeeklyIncomeGoal(BigDecimal v) { this.weeklyIncomeGoal = v; }
  public Integer getWeeksWorkedPerYear() { return weeksWorkedPerYear; }
  public void setWeeksWorkedPerYear(Integer v) { this.weeksWorkedPerYear = v; }
  public OffsetDateTime getCreatedAt() { return createdAt; }
  public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }
  public OffsetDateTime getUpdatedAt() { return updatedAt; }
  public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }
  public OffsetDateTime getDeletedAt() { return deletedAt; }
  public void setDeletedAt(OffsetDateTime v) { this.deletedAt = v; }
}
