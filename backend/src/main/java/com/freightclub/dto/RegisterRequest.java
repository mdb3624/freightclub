package com.freightclub.dto;

import com.freightclub.domain.EquipmentType;
import com.freightclub.domain.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Email
        String email,

        @NotBlank @Size(min = 8, message = "Password must be at least 8 characters")
        String password,

        @NotBlank
        String firstName,

        @NotBlank
        String lastName,

        @NotNull
        UserRole role,

        // Provide companyName to create a new company, or joinCode to join an existing one.
        // Exactly one must be supplied; validated in AuthService.
        String companyName,

        String joinCode,

        // Trucker-specific fields (optional for non-trucker roles)
        @Size(max = 20) String mcNumber,
        @Size(max = 20) String dotNumber,
        EquipmentType equipmentType
) {}
