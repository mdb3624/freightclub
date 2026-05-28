package com.freightclub.modules.analytics.infrastructure;

import com.freightclub.modules.analytics.domain.LoadAnalytics;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LoadAnalyticsRepository extends JpaRepository<LoadAnalytics, String> {

  @Query(
      "SELECT la FROM LoadAnalytics la "
          + "WHERE la.tenantId = :tenantId AND la.deletedAt IS NULL "
          + "AND la.postedAt >= :startDate AND la.postedAt <= :endDate "
          + "ORDER BY la.postedAt DESC")
  Page<LoadAnalytics> findByTenantInDateRange(
      @Param("tenantId") String tenantId,
      @Param("startDate") OffsetDateTime startDate,
      @Param("endDate") OffsetDateTime endDate,
      Pageable pageable);

  @Query(
      "SELECT la FROM LoadAnalytics la "
          + "WHERE la.tenantId = :tenantId AND la.shipperId = :shipperId AND la.deletedAt IS NULL "
          + "ORDER BY la.postedAt DESC")
  Page<LoadAnalytics> findByShipperInDateRange(
      @Param("tenantId") String tenantId,
      @Param("shipperId") String shipperId,
      Pageable pageable);

  @Query(
      "SELECT COUNT(la) FROM LoadAnalytics la "
          + "WHERE la.tenantId = :tenantId AND la.deletedAt IS NULL "
          + "AND la.postedAt >= :startDate")
  long countPostedSince(
      @Param("tenantId") String tenantId, @Param("startDate") OffsetDateTime startDate);

  @Query(
      "SELECT COUNT(la) FROM LoadAnalytics la "
          + "WHERE la.tenantId = :tenantId AND la.claimedAt IS NOT NULL AND la.deletedAt IS NULL "
          + "AND la.postedAt >= :startDate")
  long countClaimedSince(
      @Param("tenantId") String tenantId, @Param("startDate") OffsetDateTime startDate);

  @Query(
      value = "SELECT AVG(EXTRACT(EPOCH FROM (claimed_at - posted_at))) "
          + "FROM freightclub.load_analytics "
          + "WHERE tenant_id = :tenantId AND claimed_at IS NOT NULL AND deleted_at IS NULL "
          + "AND posted_at >= :startDate",
      nativeQuery = true)
  Double avgClaimTimeSecondsSince(
      @Param("tenantId") String tenantId, @Param("startDate") OffsetDateTime startDate);
}
