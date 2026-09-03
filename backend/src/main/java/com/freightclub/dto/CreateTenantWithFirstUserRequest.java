package com.freightclub.dto;

import com.freightclub.domain.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

// US-886 BR-2: creates a brand-new tenant with this user as its first (and admin) member.
public record CreateTenantWithFirstUserRequest(
        @NotBlank String companyName,
        @NotBlank @Email String email,
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotNull UserRole role,
        @NotBlank(message = "A reason is required") String reason
) {}
