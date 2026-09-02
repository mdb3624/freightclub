package com.freightclub.dto;

import java.math.BigDecimal;

// US-876/878: a field left null here means "leave the current org default unchanged" — not
// "clear it" — matching the update-profile pattern already used elsewhere in this codebase.
public record UpdateOrgSettingsRequest(
        String defaultPickupAddress1, String defaultPickupAddress2, String defaultPickupCity,
        String defaultPickupState, String defaultPickupZip,
        String billingAddress1, String billingAddress2, String billingCity,
        String billingState, String billingZip,
        BigDecimal fuelCostPerGallon, BigDecimal maintenanceCostPerMile,
        BigDecimal monthlyFixedCosts, BigDecimal targetMarginPerMile,
        Boolean notifyEmail, Boolean notifySms, Boolean notifyInApp
) {}
