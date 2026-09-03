package com.freightclub.dto;

import jakarta.validation.constraints.NotBlank;

public record StartImpersonationRequest(
        @NotBlank String targetUserId,
        @NotBlank String reason,
        @NotBlank String password
) {}
