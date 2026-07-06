package com.freightclub.modules.carrier.application;

import java.math.BigDecimal;

public record CostProfileResponse(
    String dieselRegion,
    BigDecimal milesPerGallon,
    BigDecimal additionalCostPerMile,
    BigDecimal truckPaymentMonthly,
    BigDecimal insuranceMonthly,
    BigDecimal permitsMonthly,
    Integer annualMiles,
    BigDecimal weeklyIncomeGoal,
    Integer weeksWorkedPerYear,
    BigDecimal fuelCpm,
    BigDecimal variableCpm,
    BigDecimal fixedCpm,
    BigDecimal marginCpm,
    BigDecimal breakevenRpm,
    BigDecimal minRpm,
    BigDecimal targetRpm) {

  public static CostProfileResponse from(
      com.freightclub.modules.carrier.domain.CarrierCostProfile profile, BigDecimal dieselPrice) {
    return new CostProfileResponse(
        profile.getDieselRegion(),
        profile.getMilesPerGallon(),
        profile.getAdditionalCostPerMile(),
        profile.getTruckPaymentMonthly(),
        profile.getInsuranceMonthly(),
        profile.getPermitsMonthly(),
        profile.getAnnualMiles(),
        profile.getWeeklyIncomeGoal(),
        profile.getWeeksWorkedPerYear(),
        profile.calculateFuelCPM(dieselPrice),
        profile.calculateVariableCPM(dieselPrice),
        profile.calculateAnnualFixedCPM(),
        profile.calculateAnnualMarginCPM(),
        profile.calculateBreakevenRPM(dieselPrice),
        profile.calculateMinimumRPM(dieselPrice),
        profile.calculateTargetRPM(dieselPrice));
  }
}
