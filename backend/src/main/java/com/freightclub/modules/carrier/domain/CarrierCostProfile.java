package com.freightclub.modules.carrier.domain;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

public class CarrierCostProfile {

  private String id;
  private String tenantId;
  private String truckerId;

  // Legacy fields (nullable — a wizard-only profile leaves these null)
  private BigDecimal monthlyFixedCosts;
  private BigDecimal fuelCostPerGallon;
  private BigDecimal maintenanceCostPerMile;
  private Integer monthlyMilesTarget;
  private BigDecimal targetMarginPerMile;

  // Shared field (both legacy and wizard model populate this)
  private BigDecimal milesPerGallon;

  // Wizard fields (US-730a-v2, nullable — a legacy-only profile leaves these null)
  private String dieselRegion;
  private BigDecimal additionalCostPerMile;
  private BigDecimal truckPaymentMonthly;
  private BigDecimal insuranceMonthly;
  private BigDecimal permitsMonthly;
  private Integer annualMiles;
  private BigDecimal weeklyIncomeGoal;
  private Integer weeksWorkedPerYear;

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
      Integer monthlyMilesTarget,
      BigDecimal targetMarginPerMile,
      String dieselRegion,
      BigDecimal additionalCostPerMile,
      BigDecimal truckPaymentMonthly,
      BigDecimal insuranceMonthly,
      BigDecimal permitsMonthly,
      Integer annualMiles,
      BigDecimal weeklyIncomeGoal,
      Integer weeksWorkedPerYear,
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

  // Legacy factory (US-702) — unchanged signature, new fields default to null
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
        null, null, null, null, null, null, null, null,
        OffsetDateTime.now(ZoneOffset.UTC),
        OffsetDateTime.now(ZoneOffset.UTC),
        null);
  }

  // Wizard factory (US-730a-v2) — legacy-specific fields default to null
  public static CarrierCostProfile createNewWizard(
      String tenantId,
      String truckerId,
      String dieselRegion,
      BigDecimal milesPerGallon,
      BigDecimal additionalCostPerMile,
      BigDecimal truckPaymentMonthly,
      BigDecimal insuranceMonthly,
      BigDecimal permitsMonthly,
      int annualMiles,
      BigDecimal weeklyIncomeGoal,
      int weeksWorkedPerYear) {
    return new CarrierCostProfile(
        java.util.UUID.randomUUID().toString(),
        tenantId,
        truckerId,
        null, null,
        milesPerGallon,
        null, null, null,
        dieselRegion,
        additionalCostPerMile,
        truckPaymentMonthly,
        insuranceMonthly,
        permitsMonthly,
        annualMiles,
        weeklyIncomeGoal,
        weeksWorkedPerYear,
        OffsetDateTime.now(ZoneOffset.UTC),
        OffsetDateTime.now(ZoneOffset.UTC),
        null);
  }

  // Legacy formulas (US-702) — null-safe so a wizard-only profile returns ZERO instead of NPE
  public BigDecimal calculateFixedCPM() {
    if (monthlyMilesTarget == null || monthlyMilesTarget == 0 || monthlyFixedCosts == null) {
      return BigDecimal.ZERO;
    }
    return monthlyFixedCosts.divide(new BigDecimal(monthlyMilesTarget), 4, RoundingMode.HALF_UP);
  }

  public BigDecimal calculateFuelCPM() {
    if (milesPerGallon == null || milesPerGallon.compareTo(BigDecimal.ZERO) == 0 || fuelCostPerGallon == null) {
      return BigDecimal.ZERO;
    }
    return fuelCostPerGallon.divide(milesPerGallon, 4, RoundingMode.HALF_UP);
  }

  public BigDecimal calculateVariableCPM() {
    BigDecimal maintenance = maintenanceCostPerMile != null ? maintenanceCostPerMile : BigDecimal.ZERO;
    return calculateFuelCPM().add(maintenance);
  }

  public BigDecimal calculateTotalCPM() {
    return calculateFixedCPM().add(calculateVariableCPM());
  }

  public BigDecimal calculateMinimumRPM() {
    BigDecimal margin = targetMarginPerMile != null ? targetMarginPerMile : BigDecimal.ZERO;
    return calculateTotalCPM().add(margin);
  }

  // Wizard formulas (US-730a-v2) — diesel price is passed in by the application
  // layer (fetched from EiaFuelPriceService); domain stays framework-free.
  public BigDecimal calculateFuelCPM(BigDecimal dieselPricePerGallon) {
    if (milesPerGallon == null || milesPerGallon.compareTo(BigDecimal.ZERO) == 0) {
      return BigDecimal.ZERO;
    }
    return dieselPricePerGallon.divide(milesPerGallon, 4, RoundingMode.HALF_UP);
  }

  public BigDecimal calculateVariableCPM(BigDecimal dieselPricePerGallon) {
    BigDecimal additional = additionalCostPerMile != null ? additionalCostPerMile : BigDecimal.ZERO;
    return calculateFuelCPM(dieselPricePerGallon).add(additional);
  }

  public BigDecimal calculateAnnualFixedCPM() {
    if (annualMiles == null || annualMiles == 0) {
      return BigDecimal.ZERO;
    }
    BigDecimal monthly =
        nz(truckPaymentMonthly).add(nz(insuranceMonthly)).add(nz(permitsMonthly));
    return monthly
        .multiply(BigDecimal.valueOf(12))
        .divide(new BigDecimal(annualMiles), 4, RoundingMode.HALF_UP);
  }

  public BigDecimal calculateAnnualMarginCPM() {
    if (annualMiles == null || annualMiles == 0 || weeklyIncomeGoal == null || weeksWorkedPerYear == null) {
      return BigDecimal.ZERO;
    }
    BigDecimal annualGoal = weeklyIncomeGoal.multiply(BigDecimal.valueOf(weeksWorkedPerYear));
    return annualGoal.divide(new BigDecimal(annualMiles), 4, RoundingMode.HALF_UP);
  }

  public BigDecimal calculateBreakevenRPM(BigDecimal dieselPricePerGallon) {
    return calculateVariableCPM(dieselPricePerGallon).add(calculateAnnualFixedCPM());
  }

  public BigDecimal calculateMinimumRPM(BigDecimal dieselPricePerGallon) {
    return calculateBreakevenRPM(dieselPricePerGallon).add(calculateAnnualMarginCPM());
  }

  public BigDecimal calculateTargetRPM(BigDecimal dieselPricePerGallon) {
    return calculateMinimumRPM(dieselPricePerGallon).multiply(new BigDecimal("1.2"));
  }

  public boolean hasWizardFields() {
    return dieselRegion != null;
  }

  private static BigDecimal nz(BigDecimal value) {
    return value != null ? value : BigDecimal.ZERO;
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

  public void updateWizardFields(
      String dieselRegion,
      BigDecimal milesPerGallon,
      BigDecimal additionalCostPerMile,
      BigDecimal truckPaymentMonthly,
      BigDecimal insuranceMonthly,
      BigDecimal permitsMonthly,
      int annualMiles,
      BigDecimal weeklyIncomeGoal,
      int weeksWorkedPerYear) {
    this.dieselRegion = dieselRegion;
    this.milesPerGallon = milesPerGallon;
    this.additionalCostPerMile = additionalCostPerMile;
    this.truckPaymentMonthly = truckPaymentMonthly;
    this.insuranceMonthly = insuranceMonthly;
    this.permitsMonthly = permitsMonthly;
    this.annualMiles = annualMiles;
    this.weeklyIncomeGoal = weeklyIncomeGoal;
    this.weeksWorkedPerYear = weeksWorkedPerYear;
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
  public Integer getMonthlyMilesTarget() { return monthlyMilesTarget; }
  public BigDecimal getTargetMarginPerMile() { return targetMarginPerMile; }
  public String getDieselRegion() { return dieselRegion; }
  public BigDecimal getAdditionalCostPerMile() { return additionalCostPerMile; }
  public BigDecimal getTruckPaymentMonthly() { return truckPaymentMonthly; }
  public BigDecimal getInsuranceMonthly() { return insuranceMonthly; }
  public BigDecimal getPermitsMonthly() { return permitsMonthly; }
  public Integer getAnnualMiles() { return annualMiles; }
  public BigDecimal getWeeklyIncomeGoal() { return weeklyIncomeGoal; }
  public Integer getWeeksWorkedPerYear() { return weeksWorkedPerYear; }
  public OffsetDateTime getCreatedAt() { return createdAt; }
  public OffsetDateTime getUpdatedAt() { return updatedAt; }
  public OffsetDateTime getDeletedAt() { return deletedAt; }
}
