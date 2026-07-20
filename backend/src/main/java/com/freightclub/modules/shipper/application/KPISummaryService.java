package com.freightclub.modules.shipper.application;

import com.freightclub.domain.Load;
import com.freightclub.domain.LoadStatus;
import com.freightclub.modules.load.domain.CostEfficiencyCalculator;
import com.freightclub.modules.load.domain.OnTimeRateCalculator;
import com.freightclub.modules.shipper.infrastructure.rest.dto.KPISummaryResponse;
import com.freightclub.security.TenantContextHolder;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;

/**
 * KPISummaryService: Orchestrates KPI calculation for shipper dashboard.
 * US-820 AC-1 through AC-4
 */
@Service
public class KPISummaryService {

  private final LoadQueryService loadQueryService;
  private final OnTimeRateCalculator onTimeRateCalculator;
  private final CostEfficiencyCalculator costEfficiencyCalculator;

  public KPISummaryService(
      LoadQueryService loadQueryService,
      OnTimeRateCalculator onTimeRateCalculator,
      CostEfficiencyCalculator costEfficiencyCalculator
  ) {
    this.loadQueryService = loadQueryService;
    this.onTimeRateCalculator = onTimeRateCalculator;
    this.costEfficiencyCalculator = costEfficiencyCalculator;
  }

  public KPISummaryResponse getSummary() {
    String tenantId = TenantContextHolder.getTenantId();

    // Shared query (LoadQueryService.findDashboardLoads) — single source of truth for
    // "which loads are dashboard-relevant", also used by ShipmentStatusService, so the two
    // can't independently drift on what counts as active again (see US-820 fix, 2026-07-20).
    List<Load> dashboardLoads = loadQueryService.findDashboardLoads(tenantId);

    if (dashboardLoads.isEmpty()) {
      return new KPISummaryResponse(0, null, null, true);
    }

    // AC-1: Count active loads — OPEN, CLAIMED, IN_TRANSIT. A freshly posted, not-yet-claimed
    // load is reflected here the same way it appears in the Shipment Status panel below it.
    int activeLoadCount = (int) dashboardLoads.stream()
        .filter(load -> load.getStatus() == LoadStatus.OPEN
            || load.getStatus() == LoadStatus.CLAIMED
            || load.getStatus() == LoadStatus.IN_TRANSIT)
        .count();

    // AC-2 & AC-3: Calculate on-time % and cost per mile using domain services
    BigDecimal onTimePercentage = onTimeRateCalculator.calculate(dashboardLoads);
    BigDecimal costPerMile = costEfficiencyCalculator.calculate(dashboardLoads);

    // AC-5: Empty state when no delivered loads (null metrics)
    boolean isEmpty = onTimePercentage == null || costPerMile == null;

    return new KPISummaryResponse(activeLoadCount, onTimePercentage, costPerMile, isEmpty);
  }
}
