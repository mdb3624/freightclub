package com.freightclub.dto;

import jakarta.validation.constraints.NotBlank;

public record RaiseDisputeRequest(
        @NotBlank String loadId,
        @NotBlank String reason
) {}
