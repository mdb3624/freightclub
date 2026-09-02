package com.freightclub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// US-881: public self-service redemption of a Super-User-issued reset token.
public record RedeemPasswordResetTokenRequest(
        @NotBlank
        String token,

        @NotBlank @Size(min = 8, message = "Password must be at least 8 characters")
        String newPassword
) {}
