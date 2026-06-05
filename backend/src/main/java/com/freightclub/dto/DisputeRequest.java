package com.freightclub.dto;

import jakarta.validation.constraints.NotBlank;

public record DisputeRequest(
        @NotBlank(message = "Dispute reason is required")
        String reason
) {}
