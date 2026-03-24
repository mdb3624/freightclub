package com.freightclub.dto;

import java.math.BigDecimal;

public record RatingSummaryResponse(
        BigDecimal avgStars,     // null if no ratings yet
        long totalRatings,
        long completedLoads
) {}
