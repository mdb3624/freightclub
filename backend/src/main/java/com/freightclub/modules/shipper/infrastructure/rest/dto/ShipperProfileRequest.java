package com.freightclub.modules.shipper.infrastructure.rest.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ShipperProfileRequest(
    @NotBlank(message = "Company name is required")
    @Size(max = 120, message = "Company name must not exceed 120 characters")
    String companyName,

    @NotBlank(message = "Billing email is required")
    @Email(message = "Billing email must be a valid email address")
    @Size(max = 255, message = "Billing email must not exceed 255 characters")
    String billingEmail,

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\(\\d{3}\\)\\s?\\d{3}-\\d{4}$", message = "Phone number must be in format (XXX) XXX-XXXX")
    String phoneNumber,

    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City must not exceed 100 characters")
    String city,

    @NotBlank(message = "State code is required")
    @Pattern(regexp = "^[A-Z]{2}$", message = "State code must be a valid 2-letter code")
    String state,

    @NotBlank(message = "ZIP code is required")
    @Pattern(regexp = "^\\d{5}$", message = "ZIP code must be a 5-digit number")
    String zipCode,

    @Size(max = 8, message = "MC number must not exceed 8 characters")
    String mcNumber,

    @Size(max = 8, message = "USDOT number must not exceed 8 characters")
    String usdotNumber,

    @Size(max = 500, message = "Logo URL must not exceed 500 characters")
    String logoUrl
) {}
