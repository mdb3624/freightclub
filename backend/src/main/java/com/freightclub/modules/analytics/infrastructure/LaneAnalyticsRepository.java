package com.freightclub.modules.analytics.infrastructure;

import com.freightclub.modules.analytics.domain.LaneAnalytics;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LaneAnalyticsRepository extends JpaRepository<LaneAnalytics, String> {

  @Query(
      "SELECT la FROM LaneAnalytics la "
          + "WHERE la.tenantId = :tenantId "
          + "AND la.originRegion = :originRegion "
          + "AND la.destRegion = :destRegion "
          + "ORDER BY la.date DESC")
  Page<LaneAnalytics> findByLane(
      @Param("tenantId") String tenantId,
      @Param("originRegion") String originRegion,
      @Param("destRegion") String destRegion,
      Pageable pageable);

  @Query(
      "SELECT la FROM LaneAnalytics la "
          + "WHERE la.tenantId = :tenantId "
          + "AND la.date BETWEEN :startDate AND :endDate "
          + "ORDER BY la.date DESC, la.originRegion ASC")
  List<LaneAnalytics> findByTenantAndDateRange(
      @Param("tenantId") String tenantId,
      @Param("startDate") LocalDate startDate,
      @Param("endDate") LocalDate endDate);

  @Query(
      "SELECT COALESCE(SUM(la.postCount), 0) FROM LaneAnalytics la "
          + "WHERE la.tenantId = :tenantId "
          + "AND la.date BETWEEN :startDate AND :endDate")
  long countLoadsByTenantAndDateRange(
      @Param("tenantId") String tenantId,
      @Param("startDate") LocalDate startDate,
      @Param("endDate") LocalDate endDate);
}
