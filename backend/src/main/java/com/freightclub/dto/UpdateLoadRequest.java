package com.freightclub.dto;

import com.freightclub.domain.EquipmentType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record UpdateLoadRequest(
        @NotBlank String origin,
        @NotBlank String originAddress,
        @NotBlank String originZip,
        @NotBlank String destination,
        @NotBlank String destinationAddress,
        @NotBlank String destinationZip,
        BigDecimal distanceMiles,
        @NotNull LocalDateTime pickupFrom,
        @NotNull LocalDateTime pickupTo,
        @NotNull LocalDateTime deliveryFrom,
        @NotNull LocalDateTime deliveryTo,
        @NotBlank String commodity,
        @NotNull @DecimalMin("0.01") BigDecimal weightLbs,
        @NotNull EquipmentType equipmentType,
        @NotNull @DecimalMin("0.01") BigDecimal payRate,
        String specialRequirements
) {}
