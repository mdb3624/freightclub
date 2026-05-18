package com.freightclub.service;

import com.freightclub.domain.User;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

/**
 * Unit tests for ProfileService CPM calculation methods.
 * AC1: totalFixedCosts = truckPaymentLease + insurance + iftaIrpPermits + phoneEldMisc + (perDiemDailyRate * perDiemDaysPerMonth)
 * AC2: fixedCpm = totalFixedCosts / monthlyMiles
 * AC3: fuelCpm = fuelPrice / mpg
 * AC4: variableCpm = fuelCpm + maintenanceCpm
 * AC5: totalCpm = fixedCpm + variableCpm
 * AC6: minimumRpm = totalCpm + marginPerMile
 */
public class ProfileServiceCpmCalculationTest {

    /**
     * AC1: calculateTotalFixedCosts sums all fixed cost components.
     */
    @Test
    public void calculateTotalFixedCosts_withAllFixedFields() {
        // Arrange
        User user = new User();
        user.setTruckPaymentLease(new BigDecimal("1500.00"));
        user.setInsurance(new BigDecimal("200.00"));
        user.setIftaIrpPermits(new BigDecimal("100.00"));
        user.setPhoneEldMisc(new BigDecimal("75.00"));
        user.setPerDiemDailyRate(new BigDecimal("30.00"));
        user.setPerDiemDaysPerMonth(20);

        // Act
        BigDecimal result = ProfileService.calculateTotalFixedCosts(user);

        // Assert
        // 1500 + 200 + 100 + 75 + (30 * 20) = 2475
        assertEquals(new BigDecimal("2475.00"), result);
    }

    /**
     * AC1: calculateTotalFixedCosts treats null fields as zero.
     */
    @Test
    public void calculateTotalFixedCosts_withNullFields() {
        // Arrange
        User user = new User();
        user.setTruckPaymentLease(new BigDecimal("1000.00"));
        user.setInsurance(null);
        user.setIftaIrpPermits(null);
        user.setPhoneEldMisc(null);
        user.setPerDiemDailyRate(null);
        user.setPerDiemDaysPerMonth(null);

        // Act
        BigDecimal result = ProfileService.calculateTotalFixedCosts(user);

        // Assert
        assertEquals(new BigDecimal("1000.00"), result);
    }

    /**
     * AC2: calculateFixedCpm divides fixed costs by monthly miles.
     */
    @Test
    public void calculateFixedCpm_dividesFixedCostsByMiles() {
        // Arrange
        BigDecimal fixedCosts = new BigDecimal("2000.00");
        Integer monthlyMiles = 10000;

        // Act
        BigDecimal result = ProfileService.calculateFixedCpm(fixedCosts, monthlyMiles);

        // Assert
        // 2000 / 10000 = 0.2000 (4 decimal places from RoundingMode.HALF_UP)
        assertEquals(new BigDecimal("0.2000"), result);
    }

    /**
     * AC3: calculateFuelCpm divides fuel price by mpg.
     */
    @Test
    public void calculateFuelCpm_dividesPriceByMpg() {
        // Arrange
        BigDecimal fuelPrice = new BigDecimal("3.50");
        BigDecimal mpg = new BigDecimal("6.50");

        // Act
        BigDecimal result = ProfileService.calculateFuelCpm(fuelPrice, mpg);

        // Assert
        // 3.50 / 6.50 ≈ 0.5385 (rounded to 4 decimal places)
        assertEquals(new BigDecimal("0.5385"), result);
    }

    /**
     * AC3: calculateFuelCpm handles zero mpg by returning zero.
     */
    @Test
    public void calculateFuelCpm_withZeroMpg_returnsZero() {
        // Arrange
        BigDecimal fuelPrice = new BigDecimal("3.50");
        BigDecimal mpg = BigDecimal.ZERO;

        // Act
        BigDecimal result = ProfileService.calculateFuelCpm(fuelPrice, mpg);

        // Assert
        assertEquals(BigDecimal.ZERO, result);
    }

    /**
     * AC4: calculateVariableCpm adds fuel and maintenance CPM.
     */
    @Test
    public void calculateVariableCpm_addsFuelAndMaintenance() {
        // Arrange
        BigDecimal fuelCpm = new BigDecimal("0.54");
        BigDecimal maintenanceCpm = new BigDecimal("0.15");

        // Act
        BigDecimal result = ProfileService.calculateVariableCpm(fuelCpm, maintenanceCpm);

        // Assert
        // 0.54 + 0.15 = 0.69
        assertEquals(new BigDecimal("0.69"), result);
    }

    /**
     * AC5: calculateTotalCpm adds fixed and variable CPM.
     */
    @Test
    public void calculateTotalCpm_addsFixedAndVariable() {
        // Arrange
        BigDecimal fixedCpm = new BigDecimal("0.20");
        BigDecimal variableCpm = new BigDecimal("0.69");

        // Act
        BigDecimal result = ProfileService.calculateTotalCpm(fixedCpm, variableCpm);

        // Assert
        // 0.20 + 0.69 = 0.89
        assertEquals(new BigDecimal("0.89"), result);
    }

    /**
     * AC6: calculateMinimumRpm adds profit margin to total CPM.
     */
    @Test
    public void calculateMinimumRpm_addsProfitMargin() {
        // Arrange
        BigDecimal totalCpm = new BigDecimal("0.89");
        BigDecimal marginPerMile = new BigDecimal("0.50");

        // Act
        BigDecimal result = ProfileService.calculateMinimumRpm(totalCpm, marginPerMile);

        // Assert
        // 0.89 + 0.50 = 1.39
        assertEquals(new BigDecimal("1.39"), result);
    }
}
