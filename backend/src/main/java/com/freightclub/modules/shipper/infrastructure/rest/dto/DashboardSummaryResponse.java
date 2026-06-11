package com.freightclub.modules.shipper.infrastructure.rest.dto;

/**
 * Shipper dashboard KPI summary response DTO (US-761).
 * Provides activeShipments, estimatedCostPerMile, and onTimeCarrierPct metrics
 * for the dashboard KPI strip — additive to LoadStatsResponse, not a replacement.
 */
public record DashboardSummaryResponse(
        Metric activeShipments,
        Metric estimatedCostPerMile,
        Metric onTimeCarrierPct
) {
    public record Metric(double value, String unit, String label) {
    }
}
