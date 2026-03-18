package com.freightclub.dto;

import com.freightclub.domain.EquipmentType;
import com.freightclub.domain.PayRateType;
import com.freightclub.domain.PaymentTerms;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record UpdateLoadRequest(
        @NotBlank String originCity,
        @NotBlank String originState,
        @NotBlank String originZip,
        @NotBlank String originAddress1,
        String originAddress2,
        @NotBlank String destinationCity,
        @NotBlank String destinationState,
        @NotBlank String destinationZip,
        @NotBlank String destinationAddress1,
        String destinationAddress2,
        BigDecimal distanceMiles,
        @NotNull LocalDateTime pickupFrom,
        @NotNull LocalDateTime pickupTo,
        @NotNull LocalDateTime deliveryFrom,
        @NotNull LocalDateTime deliveryTo,
        @NotBlank String commodity,
        @NotNull @DecimalMin("0.01") BigDecimal weightLbs,
        BigDecimal lengthFt,
        BigDecimal widthFt,
        BigDecimal heightFt,
        @NotNull EquipmentType equipmentType,
        @NotNull @DecimalMin("0.01") BigDecimal payRate,
        @NotNull PayRateType payRateType,
        PaymentTerms paymentTerms,
        String specialRequirements
) {}
