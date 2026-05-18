package com.freightclub.profile.service;

import com.freightclub.domain.User;
import com.freightclub.exception.ValidationException;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Validator for User (trucker) cost profile fields.
 * Validates cost fields for trucker profile configuration.
 * Satisfies AC: Validate cost fields on User entity for trucker profile tracking (US-757).
 */
@Component
public class UserCostProfileValidator {

    /**
     * Validates all cost profile fields on a trucker User entity.
     *
     * @param user the user to validate
     * @throws ValidationException if any field violates validation rules
     */
    public void validateTruckerCostFields(User user) {
        validateCostFieldNonNegative(user.getMonthlyFixedCosts(), "monthlyFixedCosts");
        validateCostFieldNonNegative(user.getFuelCostPerGallon(), "fuelCostPerGallon");
        validateCostFieldNonNegative(user.getMilesPerGallon(), "milesPerGallon");
        validateCostFieldNonNegative(user.getMaintenanceCostPerMile(), "maintenanceCostPerMile");
        validateMonthlyMilesTarget(user.getMonthlyMilesTarget());
        validateCostFieldNonNegative(user.getTargetMarginPerMile(), "targetMarginPerMile");
        validateCostFieldNonNegative(user.getTruckPaymentLease(), "truckPaymentLease");
        validateCostFieldNonNegative(user.getInsurance(), "insurance");
        validateCostFieldNonNegative(user.getIftaIrpPermits(), "iftaIrpPermits");
        validateCostFieldNonNegative(user.getPhoneEldMisc(), "phoneEldMisc");
        validateCostFieldNonNegative(user.getPerDiemDailyRate(), "perDiemDailyRate");
        validatePerDiemDaysPerMonth(user.getPerDiemDaysPerMonth());
    }

    /**
     * Validates that a cost field is non-negative (or null).
     * Allows null values for optional cost fields.
     *
     * @param value the value to validate
     * @param fieldName the name of the field (for error messages)
     * @throws ValidationException if the value is negative
     */
    private void validateCostFieldNonNegative(BigDecimal value, String fieldName) {
        if (value != null && value.compareTo(BigDecimal.ZERO) < 0) {
            throw new ValidationException(
                    fieldName + " must be greater than or equal to 0 (current value: " + value + ")"
            );
        }
    }

    /**
     * Validates monthly miles target.
     * Allows null (optional) but if set, must be > 0.
     *
     * @param value the value to validate
     * @throws ValidationException if the value is not null and <= 0
     */
    private void validateMonthlyMilesTarget(Integer value) {
        if (value != null && value <= 0) {
            throw new ValidationException(
                    "monthlyMilesTarget must be greater than 0 (current value: " + value + ")"
            );
        }
    }

    /**
     * Validates per diem days per month.
     * Allows null (optional) but if set, must be between 1 and 31.
     *
     * @param value the value to validate
     * @throws ValidationException if the value is not null and outside 1-31 range
     */
    private void validatePerDiemDaysPerMonth(Integer value) {
        if (value != null && (value < 1 || value > 31)) {
            throw new ValidationException(
                    "perDiemDaysPerMonth must be between 1 and 31 (current value: " + value + ")"
            );
        }
    }
}
