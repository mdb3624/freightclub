package com.freightclub.modules.analytics.application;

import com.freightclub.modules.analytics.domain.LoadAnalytics;
import com.freightclub.modules.analytics.infrastructure.LoadAnalyticsRepository;
import com.freightclub.security.TenantContextHolder;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class LoadAnalyticsService {

  private final LoadAnalyticsRepository repository;

  public LoadAnalyticsService(LoadAnalyticsRepository repository) {
    this.repository = repository;
  }

  public void recordLoadAnalytics(
      String loadId,
      String shipperId,
      OffsetDateTime postedAt,
      int recommendationCount,
      int avgMatchScore) {
    String tenantId = TenantContextHolder.getTenantId();
    LoadAnalytics analytics =
        LoadAnalytics.recordPosted(tenantId, loadId, shipperId, postedAt, recommendationCount, avgMatchScore);
    repository.save(analytics);
  }

  @Transactional
  @CacheEvict(value = {"adminAnalytics", "shipperAnalytics", "loadAnalytics"}, allEntries = true)
  public void recordLoadClaim(String loadId, String truckerId, OffsetDateTime claimedAt) {
    String tenantId = TenantContextHolder.getTenantId();
    LoadAnalytics analytics = repository.findById(loadId).orElse(null);
    if (analytics != null && analytics.getTenantId().equals(tenantId)) {
      analytics.recordClaim(claimedAt, truckerId);
      repository.save(analytics);
    }
  }

  @Transactional(readOnly = true)
  @Cacheable(value = "adminAnalytics", key = "#tenantId + ':' + #days")
  public AdminAnalyticsResponse getAdminAnalytics(String tenantId, int days) {
    OffsetDateTime startDate = OffsetDateTime.now(ZoneOffset.UTC).minusDays(days);

    long totalPosted = repository.countPostedSince(tenantId, startDate);
    long totalClaimed = repository.countClaimedSince(tenantId, startDate);
    double avgClaimTimeSeconds =
        repository.avgClaimTimeSecondsSince(tenantId, startDate);

    int claimPercentage = totalPosted > 0 ? (int) ((totalClaimed * 100) / totalPosted) : 0;
    double avgClaimTimeHours = avgClaimTimeSeconds / 3600.0;

    return new AdminAnalyticsResponse(
        totalPosted, totalClaimed, claimPercentage, avgClaimTimeHours);
  }

  @Transactional(readOnly = true)
  @Cacheable(value = "shipperAnalytics", key = "#shipperId + ':' + #tenantId + ':' + #days")
  public ShipperAnalyticsResponse getShipperAnalytics(
      String shipperId, String tenantId, int days) {
    OffsetDateTime startDate = OffsetDateTime.now(ZoneOffset.UTC).minusDays(days);

    // Fetch from database
    org.springframework.data.domain.Pageable pageable =
        org.springframework.data.domain.PageRequest.of(0, 10000);
    var page = repository.findByShipperInDateRange(tenantId, shipperId, pageable);

    long postedCount = page.getTotalElements();
    long claimedCount =
        page.getContent().stream().filter(a -> a.getClaimedAt() != null).count();
    double avgClaimTimeSeconds =
        page.getContent().stream()
                .filter(a -> a.getClaimTimeSeconds() != null)
                .mapToLong(a -> a.getClaimTimeSeconds())
                .average()
                .orElse(0);

    int claimPercentage = postedCount > 0 ? (int) ((claimedCount * 100) / postedCount) : 0;
    double avgClaimTimeHours = avgClaimTimeSeconds / 3600.0;

    return new ShipperAnalyticsResponse(
        postedCount, claimedCount, claimPercentage, avgClaimTimeHours);
  }

  public record AdminAnalyticsResponse(
      long totalPosted, long totalClaimed, int claimPercentage, double avgClaimTimeHours) {}

  public record ShipperAnalyticsResponse(
      long postedCount, long claimedCount, int claimPercentage, double avgClaimTimeHours) {}
}
