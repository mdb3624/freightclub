package com.freightclub.modules.carrier.application;

import java.math.BigDecimal;

public record CostProfileWizardInput(
    String dieselRegion,
    BigDecimal milesPerGallon,
    BigDecimal additionalCostPerMile,
    BigDecimal truckPaymentMonthly,
    BigDecimal insuranceMonthly,
    BigDecimal permitsMonthly,
    int annualMiles,
    BigDecimal weeklyIncomeGoal,
    int weeksWorkedPerYear) {}
