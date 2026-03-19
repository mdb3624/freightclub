package com.freightclub.dto;

import com.freightclub.domain.EquipmentType;
import com.freightclub.domain.Tenant;
import com.freightclub.domain.User;
import org.springframework.lang.Nullable;

import java.math.BigDecimal;

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
        String billingAddress1,
        String billingAddress2,
        String billingCity,
        String billingState,
        String billingZip,
        String defaultPickupAddress1,
        String defaultPickupAddress2,
        String defaultPickupCity,
        String defaultPickupState,
        String defaultPickupZip,
        boolean notifyEmail,
        boolean notifySms,
        boolean notifyInApp,
        String mcNumber,
        String dotNumber,
        EquipmentType equipmentType,
        BigDecimal monthlyFixedCosts,
        BigDecimal fuelCostPerGallon,
        BigDecimal milesPerGallon,
        BigDecimal maintenanceCostPerMile,
        Integer monthlyMilesTarget,
        BigDecimal targetMarginPerMile
) {
    public static ProfileResponse from(User user, @Nullable Tenant tenant) {
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
                user.getBillingAddress1(),
                user.getBillingAddress2(),
                user.getBillingCity(),
                user.getBillingState(),
                user.getBillingZip(),
                user.getDefaultPickupAddress1(),
                user.getDefaultPickupAddress2(),
                user.getDefaultPickupCity(),
                user.getDefaultPickupState(),
                user.getDefaultPickupZip(),
                user.isNotifyEmail(),
                user.isNotifySms(),
                user.isNotifyInApp(),
                user.getMcNumber(),
                user.getDotNumber(),
                user.getEquipmentType(),
                user.getMonthlyFixedCosts(),
                user.getFuelCostPerGallon(),
                user.getMilesPerGallon(),
                user.getMaintenanceCostPerMile(),
                user.getMonthlyMilesTarget(),
                user.getTargetMarginPerMile()
        );
    }
}
