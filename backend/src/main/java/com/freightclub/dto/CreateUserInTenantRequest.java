package com.freightclub.dto;

import com.freightclub.domain.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

// US-886 BR-1: adds a user to an existing, Super-User-selected tenant.
public record CreateUserInTenantRequest(
        @NotBlank String tenantId,
        @NotBlank @Email String email,
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotNull UserRole role,
        @NotBlank(message = "A reason is required") String reason
) {}
