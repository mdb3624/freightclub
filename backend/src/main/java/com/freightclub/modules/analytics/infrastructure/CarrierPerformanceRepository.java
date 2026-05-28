package com.freightclub.modules.analytics.infrastructure;

import com.freightclub.modules.analytics.domain.CarrierPerformance;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CarrierPerformanceRepository extends JpaRepository<CarrierPerformance, String> {

  @Query(
      "SELECT cp FROM CarrierPerformance cp "
          + "WHERE cp.tenantId = :tenantId AND cp.carrierId = :carrierId")
  Optional<CarrierPerformance> findByCarrierAndTenant(
      @Param("tenantId") String tenantId,
      @Param("carrierId") String carrierId);

  @Query(
      "SELECT cp FROM CarrierPerformance cp "
          + "WHERE cp.tenantId = :tenantId "
          + "ORDER BY cp.onTimeRate DESC, cp.acceptanceRate DESC")
  Page<CarrierPerformance> findTopPerformersByTenant(
      @Param("tenantId") String tenantId,
      Pageable pageable);

  @Query(
      "SELECT cp FROM CarrierPerformance cp "
          + "WHERE cp.tenantId = :tenantId AND cp.carrierId IN :carrierIds "
          + "ORDER BY cp.qualityScore DESC")
  List<CarrierPerformance> findByCarrierIds(
      @Param("tenantId") String tenantId,
      @Param("carrierIds") List<String> carrierIds);

  @Query(
      "SELECT AVG(cp.acceptanceRate) FROM CarrierPerformance cp "
          + "WHERE cp.tenantId = :tenantId")
  Double getAverageAcceptanceRate(@Param("tenantId") String tenantId);

  @Query(
      "SELECT AVG(cp.onTimeRate) FROM CarrierPerformance cp "
          + "WHERE cp.tenantId = :tenantId")
  Double getAverageOnTimeRate(@Param("tenantId") String tenantId);

  @Query(
      "SELECT AVG(cp.qualityScore) FROM CarrierPerformance cp "
          + "WHERE cp.tenantId = :tenantId")
  Double getAverageQualityScore(@Param("tenantId") String tenantId);
}
