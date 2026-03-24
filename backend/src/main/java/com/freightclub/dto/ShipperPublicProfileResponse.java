package com.freightclub.dto;

import java.math.BigDecimal;

public record ShipperPublicProfileResponse(
        String shipperId,
        String displayName,
        BigDecimal avgStars,       // null if no ratings yet
        long totalRatings,
        long completedLoads,
        long cancelledLoads,
        Integer avgPaymentDays     // null until Phase 5 (Payments)
) {}
