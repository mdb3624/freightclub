package com.freightclub.modules.analytics.application;

import com.freightclub.modules.analytics.domain.CarrierPerformance;
import com.freightclub.modules.analytics.infrastructure.CarrierPerformanceRepository;
import com.freightclub.security.TenantContextHolder;
import java.math.BigDecimal;
import java.util.Optional;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CarrierPerformanceService {

  private final CarrierPerformanceRepository repository;

  public CarrierPerformanceService(CarrierPerformanceRepository repository) {
    this.repository = repository;
  }

  @Cacheable(value = "carrierPerformance", key = "#carrierId + ':' + #tenantId")
  public Optional<CarrierPerformance> getCarrierPerformance(
      String carrierId, String tenantId) {
    return repository.findByCarrierAndTenant(tenantId, carrierId);
  }

  @Cacheable(
      value = "carrierPerformance",
      key = "T(com.freightclub.security.TenantContextHolder).getTenantId() + ':top-performers'")
  public java.util.List<CarrierPerformance> getTopPerformers() {
    String tenantId = TenantContextHolder.getTenantId();
    Pageable pageable = PageRequest.of(0, 10);
    return repository.findTopPerformersByTenant(tenantId, pageable).getContent();
  }

  @Cacheable(
      value = "carrierPerformance",
      key = "T(com.freightclub.security.TenantContextHolder).getTenantId() + ':benchmarks'")
  public CarrierBenchmarksResponse getBenchmarks() {
    String tenantId = TenantContextHolder.getTenantId();
    Double avgAcceptanceRate = repository.getAverageAcceptanceRate(tenantId);
    Double avgOnTimeRate = repository.getAverageOnTimeRate(tenantId);
    Double avgQualityScore = repository.getAverageQualityScore(tenantId);

    return new CarrierBenchmarksResponse(
        BigDecimal.valueOf(avgAcceptanceRate != null ? avgAcceptanceRate : 0),
        BigDecimal.valueOf(avgOnTimeRate != null ? avgOnTimeRate : 0),
        BigDecimal.valueOf(avgQualityScore != null ? avgQualityScore : 0));
  }

  public record CarrierBenchmarksResponse(
      BigDecimal avgAcceptanceRate,
      BigDecimal avgOnTimeRate,
      BigDecimal avgQualityScore) {}
}
