package com.freightclub.modules.shipper.infrastructure.rest.dto;

import java.math.BigDecimal;

/**
 * KPI Summary Response DTO for shipper dashboard.
 * US-820: Displays active shipments, on-time %, and cost/mile metrics.
 */
public record KPISummaryResponse(
    int activeLoadCount,
    BigDecimal onTimePercentage,
    BigDecimal costPerMile,
    boolean isEmpty
) {}
