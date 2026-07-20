package com.freightclub.domain;

import java.util.EnumSet;
import java.util.List;
import java.util.Set;

public enum LoadStatus {
    DRAFT,
    OPEN,
    CLAIMED,
    IN_TRANSIT,
    DELIVERED,
    SETTLED,
    DISPUTED,
    CANCELLED;

    // Single source of truth for "is this load relevant to the shipper dashboard" — used by
    // both the KPI tile (KPISummaryService) and the Shipment Status panel (ShipmentStatusService)
    // via LoadQueryService.findDashboardLoads(). Previously each service filtered independently
    // and drifted (KPI excluded OPEN, the panel didn't) — see US-820 fix, 2026-07-20.
    private static final Set<LoadStatus> EXCLUDED_FROM_DASHBOARD = EnumSet.of(DRAFT, CANCELLED, SETTLED, DISPUTED);

    public static List<LoadStatus> excludedFromDashboard() {
        return List.copyOf(EXCLUDED_FROM_DASHBOARD);
    }
}
