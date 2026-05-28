package com.freightclub.modules.analytics.presentation;

import com.freightclub.modules.analytics.application.LoadFinancialService;
import com.freightclub.modules.analytics.application.LoadFinancialService.RevenueSummaryResponse;
import com.freightclub.security.TenantContextHolder;
import java.math.BigDecimal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class LoadFinancialController {

  private final LoadFinancialService financialService;

  public LoadFinancialController(LoadFinancialService financialService) {
    this.financialService = financialService;
  }

  @GetMapping("/shippers/{shipperId}/revenue-summary")
  @PreAuthorize("hasRole('SHIPPER')")
  public ResponseEntity<RevenueSummaryResponse> getRevenueSummary(
      @PathVariable String shipperId,
      @RequestParam(defaultValue = "30") int days) {
    String tenantId = TenantContextHolder.getTenantId();
    RevenueSummaryResponse summary = financialService.getRevenueSummary(shipperId, days);
    return ResponseEntity.ok(summary);
  }

  @GetMapping("/shippers/{shipperId}/lane-profitability")
  @PreAuthorize("hasRole('SHIPPER')")
  public ResponseEntity<LaneProfitabilityResponse[]> getLaneProfitability(
      @PathVariable String shipperId,
      @RequestParam(defaultValue = "30") int days) {
    // Placeholder: returns mock data structure
    // Implementation would query database and compute lane-based profitability
    return ResponseEntity.ok(new LaneProfitabilityResponse[0]);
  }

  @GetMapping("/shippers/{shipperId}/carrier-profitability")
  @PreAuthorize("hasRole('SHIPPER')")
  public ResponseEntity<CarrierProfitabilityResponse[]> getCarrierProfitability(
      @PathVariable String shipperId,
      @RequestParam(defaultValue = "30") int days) {
    // Placeholder: returns mock data structure
    // Implementation would query database and compute carrier-based profitability
    return ResponseEntity.ok(new CarrierProfitabilityResponse[0]);
  }

  public record LaneProfitabilityResponse(
      String origin,
      String destination,
      long loads,
      BigDecimal avgRate,
      BigDecimal avgRevenuePerLoad,
      BigDecimal commission,
      BigDecimal netMargin,
      BigDecimal marginPercentage,
      double trend) {}

  public record CarrierProfitabilityResponse(
      String carrierId,
      String carrierName,
      long loadsAssigned,
      BigDecimal totalRevenue,
      BigDecimal avgRate,
      double qualityRating,
      double onTimeRate) {}
}
