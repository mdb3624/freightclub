package com.freightclub.modules.analytics.application;

import com.freightclub.modules.analytics.domain.LoadFinancial;
import com.freightclub.modules.analytics.infrastructure.LoadFinancialRepository;
import com.freightclub.security.TenantContextHolder;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class LoadFinancialService {

  private final LoadFinancialRepository repository;

  public LoadFinancialService(LoadFinancialRepository repository) {
    this.repository = repository;
  }

  @Transactional
  @CacheEvict(value = {"revenueAnalytics", "financialForecast"}, allEntries = true)
  public LoadFinancial recordLoadSettlement(
      String loadId,
      String shipperId,
      String carrierId,
      OffsetDateTime postedAt,
      BigDecimal ratePerMile,
      BigDecimal totalRevenue) {
    String tenantId = TenantContextHolder.getTenantId();
    LoadFinancial financial =
        new LoadFinancial(
            java.util.UUID.randomUUID().toString(),
            loadId,
            tenantId,
            shipperId,
            carrierId,
            postedAt,
            ratePerMile,
            totalRevenue);
    return repository.save(financial);
  }

  @Transactional(readOnly = true)
  @Cacheable(
      value = "revenueAnalytics",
      key = "#shipperId + ':' + T(com.freightclub.security.TenantContextHolder).getTenantId() + ':' + #days")
  public RevenueSummaryResponse getRevenueSummary(String shipperId, int days) {
    String tenantId = TenantContextHolder.getTenantId();
    OffsetDateTime startDate = OffsetDateTime.now(ZoneOffset.UTC).minusDays(days);

    Long totalRevenue = repository.getTotalRevenue(tenantId, shipperId, startDate);
    Long totalCommission = repository.getTotalCommission(tenantId, shipperId, startDate);
    Long loadCount = repository.getLoadCount(tenantId, shipperId, startDate);
    Double avgRevenuePerLoad = repository.getAverageRevenuePerLoad(tenantId, shipperId, startDate);

    BigDecimal totalRev = totalRevenue != null ? BigDecimal.valueOf(totalRevenue) : BigDecimal.ZERO;
    BigDecimal totalComm = totalCommission != null ? BigDecimal.valueOf(totalCommission) : BigDecimal.ZERO;
    BigDecimal netRevenue = totalRev.subtract(totalComm);
    long count = loadCount != null ? loadCount : 0;
    double avgRev = avgRevenuePerLoad != null ? avgRevenuePerLoad : 0.0;

    return new RevenueSummaryResponse(
        totalRev,
        totalComm,
        netRevenue,
        count,
        BigDecimal.valueOf(avgRev));
  }

  public record RevenueSummaryResponse(
      BigDecimal totalRevenue,
      BigDecimal totalCommission,
      BigDecimal netRevenue,
      long loadCount,
      BigDecimal avgRevenuePerLoad) {}
}
