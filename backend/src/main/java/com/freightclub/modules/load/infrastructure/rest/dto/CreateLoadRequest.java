package com.freightclub.modules.load.infrastructure.rest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record CreateLoadRequest(
        @NotBlank String shipperId,
        @NotNull @Positive BigDecimal weightLbs
) {}
