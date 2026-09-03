package com.freightclub.dto;

import jakarta.validation.constraints.NotBlank;

public record EndImpersonationRequest(
        @NotBlank String sessionId
) {}
