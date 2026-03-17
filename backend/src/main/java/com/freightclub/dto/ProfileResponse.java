package com.freightclub.dto;

import com.freightclub.domain.EquipmentType;
import com.freightclub.domain.Tenant;
import com.freightclub.domain.User;

public record ProfileResponse(
        String id,
        String email,
        String firstName,
        String lastName,
        String role,
        String companyName,
        String companyJoinCode,
        String businessName,
        String phone,
        String billingAddress,
        String billingCity,
        String billingState,
        String billingZip,
        String defaultPickupAddress,
        String defaultPickupCity,
        String defaultPickupState,
        String defaultPickupZip,
        boolean notifyEmail,
        boolean notifySms,
        boolean notifyInApp,
        String mcNumber,
        String dotNumber,
        EquipmentType equipmentType
) {
    public static ProfileResponse from(User user, Tenant tenant) {
        return new ProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().name(),
                tenant != null ? tenant.getName() : null,
                tenant != null ? tenant.getJoinCode() : null,
                user.getBusinessName(),
                user.getPhone(),
                user.getBillingAddress(),
                user.getBillingCity(),
                user.getBillingState(),
                user.getBillingZip(),
                user.getDefaultPickupAddress(),
                user.getDefaultPickupCity(),
                user.getDefaultPickupState(),
                user.getDefaultPickupZip(),
                user.isNotifyEmail(),
                user.isNotifySms(),
                user.isNotifyInApp(),
                user.getMcNumber(),
                user.getDotNumber(),
                user.getEquipmentType()
        );
    }
}
