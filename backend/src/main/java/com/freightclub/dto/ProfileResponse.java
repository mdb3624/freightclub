package com.freightclub.dto;

import com.freightclub.domain.User;

public record ProfileResponse(
        String id,
        String email,
        String firstName,
        String lastName,
        String role,
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
        boolean notifyInApp
) {
    public static ProfileResponse from(User user) {
        return new ProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().name(),
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
                user.isNotifyInApp()
        );
    }
}
