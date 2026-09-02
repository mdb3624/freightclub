package com.freightclub.dto;

import jakarta.validation.constraints.NotBlank;

// US-881: shared request shape for suspend/reactivate/force-password-reset — each requires
// only a mandatory reason (US-880 BR-1); the target is the path variable.
public record SuperUserActionRequest(
        @NotBlank(message = "A reason is required")
        String reason
) {}
