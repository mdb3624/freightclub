package com.freightclub.dto;

import com.freightclub.domain.CdlClass;
import com.freightclub.domain.EquipmentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateProfileRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        String businessName,
        @Size(max = 20) String phone,
        String billingAddress1,
        String billingAddress2,
        String billingCity,
        String billingState,
        @Size(max = 10) String billingZip,
        String defaultPickupAddress1,
        String defaultPickupAddress2,
        String defaultPickupCity,
        String defaultPickupState,
        @Size(max = 10) String defaultPickupZip,
        boolean notifyEmail,
        boolean notifySms,
        boolean notifyInApp,
        @Size(max = 20) String mcNumber,
        @Size(max = 20) String dotNumber,
        EquipmentType equipmentType,
        @Size(max = 4) String equipmentYear,
        @Size(max = 50) String equipmentMake,
        @Size(max = 50) String equipmentModel,
        @Size(max = 20) String licensePlate,
        @Size(max = 17) String vin,
        CdlClass cdlClass,
        LocalDate cdlExpiry,
        @Size(max = 100) String insuranceCarrier,
        LocalDate insuranceExpiry,
        LocalDate medCardExpiry,
        BigDecimal truckPaymentLease,
        BigDecimal insurance,
        BigDecimal iftaIrpPermits,
        BigDecimal phoneEldMisc,
        BigDecimal perDiemDailyRate,
        Integer perDiemDaysPerMonth,
        BigDecimal fuelCostPerGallon,
        BigDecimal milesPerGallon,
        BigDecimal maintenanceCostPerMile,
        Integer monthlyMilesTarget,
        BigDecimal targetMarginPerMile
) {}
