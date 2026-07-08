package com.freightclub.modules.carrier;

import static org.assertj.core.api.Assertions.assertThat;

import com.freightclub.modules.carrier.domain.CarrierCostProfile;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

class CarrierCostProfileTest {

  @Test
  void wizardFormulas_computeExpectedRpm() {
    CarrierCostProfile profile =
        CarrierCostProfile.createNewWizard(
            "tenant-1",
            "trucker-1",
            "MIDWEST",
            new BigDecimal("6.5"),          // milesPerGallon
            new BigDecimal("0.08"),          // additionalCostPerMile
            new BigDecimal("1200"),          // truckPaymentMonthly
            new BigDecimal("600"),           // insuranceMonthly
            new BigDecimal("150"),           // permitsMonthly
            120000,                          // annualMiles
            new BigDecimal("2000"),          // weeklyIncomeGoal
            48);                             // weeksWorkedPerYear

    BigDecimal dieselPrice = new BigDecimal("3.90");

    // fuelCpm = 3.90 / 6.5 = 0.6000
    assertThat(profile.calculateFuelCPM(dieselPrice)).isEqualByComparingTo("0.6000");
    // variableCpm = 0.6000 + 0.08 = 0.6800
    assertThat(profile.calculateVariableCPM(dieselPrice)).isEqualByComparingTo("0.6800");
    // annualFixedCpm = (1200+600+150)*12 / 120000 = 0.1950
    assertThat(profile.calculateAnnualFixedCPM()).isEqualByComparingTo("0.1950");
    // annualMarginCpm = (2000*48) / 120000 = 0.8000
    assertThat(profile.calculateAnnualMarginCPM()).isEqualByComparingTo("0.8000");
    // breakeven = 0.6800 + 0.1950 = 0.8750
    assertThat(profile.calculateBreakevenRPM(dieselPrice)).isEqualByComparingTo("0.8750");
    // minRpm = 0.8750 + 0.8000 = 1.6750
    assertThat(profile.calculateMinimumRPM(dieselPrice)).isEqualByComparingTo("1.6750");
    // targetRpm = 1.6750 * 1.2 = 2.01000
    assertThat(profile.calculateTargetRPM(dieselPrice)).isEqualByComparingTo("2.01000");
    assertThat(profile.hasWizardFields()).isTrue();
  }

  @Test
  void legacyProfile_hasWizardFieldsFalse_andNoArgFormulasStillWork() {
    CarrierCostProfile legacy =
        CarrierCostProfile.createNew(
            "tenant-1",
            "trucker-2",
            new BigDecimal("2500"),
            new BigDecimal("3.50"),
            new BigDecimal("6.5"),
            new BigDecimal("0.15"),
            10000,
            new BigDecimal("0.50"));

    assertThat(legacy.hasWizardFields()).isFalse();
    assertThat(legacy.calculateMinimumRPM()).isGreaterThan(BigDecimal.ZERO);
  }

  @Test
  void wizardOnlyProfile_legacyNoArgFormulasReturnZero_noNullPointerException() {
    CarrierCostProfile wizardOnly =
        CarrierCostProfile.createNewWizard(
            "tenant-1", "trucker-3", "EAST", new BigDecimal("6.0"),
            new BigDecimal("0.07"), new BigDecimal("1000"), new BigDecimal("500"),
            new BigDecimal("100"), 100000, new BigDecimal("1800"), 48);

    // legacy fields are null on a wizard-only profile — must not NPE
    assertThat(wizardOnly.calculateMinimumRPM()).isEqualByComparingTo(BigDecimal.ZERO);
  }
}
