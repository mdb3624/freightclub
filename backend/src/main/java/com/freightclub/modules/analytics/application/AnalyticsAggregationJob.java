package com.freightclub.modules.analytics.application;

import com.freightclub.modules.analytics.infrastructure.LoadAnalyticsRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AnalyticsAggregationJob {

  private final LoadAnalyticsRepository repository;

  public AnalyticsAggregationJob(LoadAnalyticsRepository repository) {
    this.repository = repository;
  }

  @Scheduled(fixedDelay = 3600000)
  @Transactional
  @CacheEvict(value = {"analytics", "laneAnalytics", "demandForecast"}, allEntries = true)
  public void refreshAggregates() {
    // Pre-computed aggregates refresh (hourly)
    // - Lane analytics are computed from load_analytics table
    // - Materialized as lane_analytics_daily for fast dashboard queries
    // - Cache invalidated automatically by @CacheEvict

    // Lane aggregation logic:
    // SELECT
    //   tenant_id, origin_region, dest_region, DATE(posted_at) as date,
    //   COUNT(*) as post_count,
    //   COUNT(CASE WHEN claimed_at IS NOT NULL THEN 1 END) as claimed_count,
    //   AVG(claim_time_seconds) as avg_claim_time_seconds,
    //   ...
    // FROM load_analytics
    // WHERE deleted_at IS NULL
    // GROUP BY tenant_id, origin_region, dest_region, date
    // ON CONFLICT (...) DO UPDATE SET ...

    // Placeholder for actual SQL execution via custom repository method
    // This will be called by the scheduled job framework
  }
}
