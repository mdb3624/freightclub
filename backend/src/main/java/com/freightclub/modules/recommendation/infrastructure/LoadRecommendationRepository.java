package com.freightclub.modules.recommendation.infrastructure;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LoadRecommendationRepository extends JpaRepository<LoadRecommendationEntity, String> {

  @Query(
      "SELECT lr FROM LoadRecommendationEntity lr WHERE "
          + "lr.tenantId = :tenantId AND lr.truckerId = :truckerId AND lr.deletedAt IS NULL "
          + "ORDER BY lr.matchScore DESC")
  List<LoadRecommendationEntity> findByTenantIdAndTruckerIdAndDeletedAtIsNull(
      @Param("tenantId") String tenantId, @Param("truckerId") String truckerId);

  @Query(
      "SELECT lr FROM LoadRecommendationEntity lr WHERE "
          + "lr.tenantId = :tenantId AND lr.loadId = :loadId AND lr.deletedAt IS NULL")
  List<LoadRecommendationEntity> findByTenantIdAndLoadIdAndDeletedAtIsNull(
      @Param("tenantId") String tenantId, @Param("loadId") String loadId);

  @Query(
      "SELECT lr FROM LoadRecommendationEntity lr WHERE "
          + "lr.tenantId = :tenantId AND lr.loadId = :loadId AND lr.truckerId = :truckerId "
          + "AND lr.deletedAt IS NULL")
  Optional<LoadRecommendationEntity> findByTenantIdAndLoadIdAndTruckerIdAndDeletedAtIsNull(
      @Param("tenantId") String tenantId,
      @Param("loadId") String loadId,
      @Param("truckerId") String truckerId);

  @Query(
      "SELECT lr FROM LoadRecommendationEntity lr WHERE "
          + "lr.tenantId = :tenantId AND lr.loadId = :loadId AND lr.deletedAt IS NULL "
          + "ORDER BY lr.matchScore DESC LIMIT :limit")
  List<LoadRecommendationEntity> findTopRecommendationsForLoad(
      @Param("tenantId") String tenantId,
      @Param("loadId") String loadId,
      @Param("limit") int limit);
}
