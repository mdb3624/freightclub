package com.freightclub.dto;

import com.freightclub.domain.Tenant;

import java.math.BigDecimal;

// US-876 (Shipper Admin) / US-878 (Carrier Admin): shared org-defaults response — fields
// irrelevant to the acting admin's persona are simply left null; the frontend only renders
// the fields for its own persona. `memberCount` lets the frontend apply the 1-seat collapse
// rule (BR-5 in both stories) without a second request.
public record OrgSettingsResponse(
        String defaultPickupAddress1, String defaultPickupAddress2, String defaultPickupCity,
        String defaultPickupState, String defaultPickupZip,
        String billingAddress1, String billingAddress2, String billingCity,
        String billingState, String billingZip,
        BigDecimal fuelCostPerGallon, BigDecimal maintenanceCostPerMile,
        BigDecimal monthlyFixedCosts, BigDecimal targetMarginPerMile,
        Boolean notifyEmail, Boolean notifySms, Boolean notifyInApp,
        long memberCount
) {
    public static OrgSettingsResponse from(Tenant tenant, long memberCount) {
        return new OrgSettingsResponse(
                tenant.getDefaultPickupAddress1(), tenant.getDefaultPickupAddress2(), tenant.getDefaultPickupCity(),
                tenant.getDefaultPickupState(), tenant.getDefaultPickupZip(),
                tenant.getBillingAddress1(), tenant.getBillingAddress2(), tenant.getBillingCity(),
                tenant.getBillingState(), tenant.getBillingZip(),
                tenant.getFuelCostPerGallon(), tenant.getMaintenanceCostPerMile(),
                tenant.getMonthlyFixedCosts(), tenant.getTargetMarginPerMile(),
                tenant.getNotifyEmail(), tenant.getNotifySms(), tenant.getNotifyInApp(),
                memberCount
        );
    }
}
