package com.freightclub.modules.analytics.presentation;

import com.freightclub.modules.analytics.application.CarrierPerformanceService;
import com.freightclub.modules.analytics.application.CarrierPerformanceService.CarrierBenchmarksResponse;
import com.freightclub.modules.analytics.domain.CarrierPerformance;
import com.freightclub.security.TenantContextHolder;
import java.util.List;
import java.util.Optional;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class CarrierPerformanceController {

  private final CarrierPerformanceService performanceService;

  public CarrierPerformanceController(CarrierPerformanceService performanceService) {
    this.performanceService = performanceService;
  }

  @GetMapping("/carriers/{carrierId}/performance")
  public ResponseEntity<CarrierPerformanceResponse> getCarrierPerformance(
      @PathVariable String carrierId) {
    String tenantId = TenantContextHolder.getTenantId();
    Optional<CarrierPerformance> performance =
        performanceService.getCarrierPerformance(carrierId, tenantId);

    if (performance.isEmpty()) {
      return ResponseEntity.notFound().build();
    }

    CarrierPerformance cp = performance.get();
    return ResponseEntity.ok(
        new CarrierPerformanceResponse(
            cp.getCarrierId(),
            cp.getAcceptanceRate().doubleValue(),
            cp.getOnTimeRate().doubleValue(),
            cp.getAvgDeliveryTimeHours().doubleValue(),
            cp.getLoadAssigned(),
            cp.getQualityScore().doubleValue(),
            cp.getRatingCount(),
            cp.getPreferredByCount()));
  }

  @GetMapping("/analytics/top-carriers")
  public ResponseEntity<List<CarrierPerformanceResponse>> getTopCarriers() {
    List<CarrierPerformance> topPerformers = performanceService.getTopPerformers();
    return ResponseEntity.ok(
        topPerformers.stream()
            .map(
                cp ->
                    new CarrierPerformanceResponse(
                        cp.getCarrierId(),
                        cp.getAcceptanceRate().doubleValue(),
                        cp.getOnTimeRate().doubleValue(),
                        cp.getAvgDeliveryTimeHours().doubleValue(),
                        cp.getLoadAssigned(),
                        cp.getQualityScore().doubleValue(),
                        cp.getRatingCount(),
                        cp.getPreferredByCount()))
            .toList());
  }

  @GetMapping("/analytics/carrier-benchmarks")
  public ResponseEntity<CarrierBenchmarksResponse> getBenchmarks() {
    CarrierBenchmarksResponse benchmarks = performanceService.getBenchmarks();
    return ResponseEntity.ok(benchmarks);
  }

  public record CarrierPerformanceResponse(
      String carrierId,
      double acceptanceRate,
      double onTimeRate,
      double avgDeliveryTimeHours,
      long loadsCompleted,
      double qualityScore,
      long ratingCount,
      long preferredByCount) {}
}
