package com.freightclub.modules.analytics.presentation;

import com.freightclub.modules.analytics.application.LoadAnalyticsService;
import com.freightclub.modules.analytics.application.LoadAnalyticsService.AdminAnalyticsResponse;
import com.freightclub.modules.analytics.application.LoadAnalyticsService.ShipperAnalyticsResponse;
import com.freightclub.security.TenantContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class LoadAnalyticsController {

  private final LoadAnalyticsService analyticsService;

  public LoadAnalyticsController(LoadAnalyticsService analyticsService) {
    this.analyticsService = analyticsService;
  }

  @GetMapping("/admin/analytics/load-board")
  public ResponseEntity<AdminAnalyticsResponse> getAdminAnalytics(
      @RequestParam(defaultValue = "7") int range) {
    String tenantId = TenantContextHolder.getTenantId();
    AdminAnalyticsResponse response = analyticsService.getAdminAnalytics(tenantId, range);
    return ResponseEntity.ok(response);
  }

  @GetMapping("/shippers/analytics/performance")
  public ResponseEntity<ShipperAnalyticsResponse> getShipperAnalytics(
      @RequestParam(defaultValue = "7") int range,
      @RequestParam String shipperId) {
    String tenantId = TenantContextHolder.getTenantId();
    ShipperAnalyticsResponse response =
        analyticsService.getShipperAnalytics(shipperId, tenantId, range);
    return ResponseEntity.ok(response);
  }

  @GetMapping("/loads/{loadId}/analytics")
  public ResponseEntity<LoadAnalyticsDetailResponse> getLoadAnalytics(
      @PathVariable String loadId) {
    // Placeholder for load-specific analytics
    // Future: Query load_analytics table by loadId and return details
    return ResponseEntity.ok(
        new LoadAnalyticsDetailResponse(
            loadId,
            0,
            0,
            0.0,
            0
        ));
  }

  public record LoadAnalyticsDetailResponse(
      String loadId,
      long matchCount,
      long claimTime,
      double avgRate,
      int claimPercentage) {}
}
