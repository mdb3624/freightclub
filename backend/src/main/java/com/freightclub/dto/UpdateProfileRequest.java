package com.freightclub.dto;

import com.freightclub.domain.EquipmentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        String businessName,
        @Size(max = 20) String phone,
        String billingAddress,
        String billingCity,
        String billingState,
        @Size(max = 10) String billingZip,
        String defaultPickupAddress,
        String defaultPickupCity,
        String defaultPickupState,
        @Size(max = 10) String defaultPickupZip,
        boolean notifyEmail,
        boolean notifySms,
        boolean notifyInApp,
        @Size(max = 20) String mcNumber,
        @Size(max = 20) String dotNumber,
        EquipmentType equipmentType
) {}
