package com.freightclub.modules.analytics.infrastructure;

import com.freightclub.modules.analytics.domain.LoadFinancial;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LoadFinancialRepository extends JpaRepository<LoadFinancial, String> {

  @Query(
      "SELECT SUM(lf.totalRevenue) FROM LoadFinancial lf "
          + "WHERE lf.tenantId = :tenantId AND lf.shipperId = :shipperId "
          + "AND lf.createdAt >= :startDate")
  Long getTotalRevenue(
      @Param("tenantId") String tenantId,
      @Param("shipperId") String shipperId,
      @Param("startDate") OffsetDateTime startDate);

  @Query(
      "SELECT SUM(lf.commission) FROM LoadFinancial lf "
          + "WHERE lf.tenantId = :tenantId AND lf.shipperId = :shipperId "
          + "AND lf.createdAt >= :startDate")
  Long getTotalCommission(
      @Param("tenantId") String tenantId,
      @Param("shipperId") String shipperId,
      @Param("startDate") OffsetDateTime startDate);

  @Query(
      "SELECT COUNT(lf) FROM LoadFinancial lf "
          + "WHERE lf.tenantId = :tenantId AND lf.shipperId = :shipperId "
          + "AND lf.createdAt >= :startDate")
  Long getLoadCount(
      @Param("tenantId") String tenantId,
      @Param("shipperId") String shipperId,
      @Param("startDate") OffsetDateTime startDate);

  @Query(
      "SELECT AVG(lf.totalRevenue) FROM LoadFinancial lf "
          + "WHERE lf.tenantId = :tenantId AND lf.shipperId = :shipperId "
          + "AND lf.createdAt >= :startDate")
  Double getAverageRevenuePerLoad(
      @Param("tenantId") String tenantId,
      @Param("shipperId") String shipperId,
      @Param("startDate") OffsetDateTime startDate);

  @Query(
      "SELECT lf FROM LoadFinancial lf "
          + "WHERE lf.tenantId = :tenantId AND lf.shipperId = :shipperId "
          + "AND lf.createdAt >= :startDate "
          + "ORDER BY lf.createdAt DESC")
  List<LoadFinancial> findByShipperAndDateRange(
      @Param("tenantId") String tenantId,
      @Param("shipperId") String shipperId,
      @Param("startDate") OffsetDateTime startDate);
}
