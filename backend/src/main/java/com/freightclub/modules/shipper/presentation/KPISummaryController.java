package com.freightclub.modules.shipper.presentation;

import com.freightclub.modules.shipper.application.KPISummaryService;
import com.freightclub.modules.shipper.infrastructure.rest.dto.KPISummaryResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * KPISummaryController: Exposes shipper dashboard KPI metrics.
 * US-820: Active Shipments, On-Time %, Cost/Mile
 */
@RestController
@RequestMapping("/api/v1/shipper/dashboard")
@PreAuthorize("hasRole('SHIPPER')")
public class KPISummaryController {

  private final KPISummaryService kpiSummaryService;

  public KPISummaryController(KPISummaryService kpiSummaryService) {
    this.kpiSummaryService = kpiSummaryService;
  }

  /**
   * GET /api/v1/shipper/dashboard/kpi-summary
   * Returns KPI metrics for authenticated shipper's tenant.
   *
   * AC-1 through AC-4: Active loads, on-time %, cost/mile, performance
   * AC-5: Empty state when no delivered loads
   */
  @GetMapping("/kpi-summary")
  public ResponseEntity<KPISummaryResponse> getKPISummary() {
    KPISummaryResponse response = kpiSummaryService.getSummary();
    return ResponseEntity.ok(response);
  }
}
