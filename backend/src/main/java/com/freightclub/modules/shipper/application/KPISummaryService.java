package com.freightclub.modules.shipper.application;

import com.freightclub.domain.Load;
import com.freightclub.domain.LoadStatus;
import com.freightclub.repository.LoadRepository;
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

  private final LoadRepository loadRepository;
  private final OnTimeRateCalculator onTimeRateCalculator;
  private final CostEfficiencyCalculator costEfficiencyCalculator;

  public KPISummaryService(
      LoadRepository loadRepository,
      OnTimeRateCalculator onTimeRateCalculator,
      CostEfficiencyCalculator costEfficiencyCalculator
  ) {
    this.loadRepository = loadRepository;
    this.onTimeRateCalculator = onTimeRateCalculator;
    this.costEfficiencyCalculator = costEfficiencyCalculator;
  }

  public KPISummaryResponse getSummary() {
    String tenantId = TenantContextHolder.getTenantId();

    // Fetch all non-deleted loads for tenant
    List<Load> allLoads = loadRepository.findByTenantIdAndDeletedAtIsNull(tenantId);

    if (allLoads.isEmpty()) {
      return new KPISummaryResponse(0, null, null, true);
    }

    // AC-1: Count active loads (CLAIMED + IN_TRANSIT)
    int activeLoadCount = (int) allLoads.stream()
        .filter(load -> load.getStatus() == LoadStatus.CLAIMED || load.getStatus() == LoadStatus.IN_TRANSIT)
        .count();

    // AC-2 & AC-3: Calculate on-time % and cost per mile using domain services
    BigDecimal onTimePercentage = onTimeRateCalculator.calculate(allLoads);
    BigDecimal costPerMile = costEfficiencyCalculator.calculate(allLoads);

    // AC-5: Empty state when no delivered loads (null metrics)
    boolean isEmpty = onTimePercentage == null || costPerMile == null;

    return new KPISummaryResponse(activeLoadCount, onTimePercentage, costPerMile, isEmpty);
  }
}
