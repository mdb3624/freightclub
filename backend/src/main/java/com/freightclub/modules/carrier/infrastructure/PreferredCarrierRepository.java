package com.freightclub.modules.carrier.infrastructure;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PreferredCarrierRepository extends JpaRepository<PreferredCarrierEntity, String> {

  @Query(
      "SELECT pc FROM PreferredCarrierEntity pc WHERE "
          + "pc.tenantId = :tenantId AND pc.shipperId = :shipperId AND pc.deletedAt IS NULL "
          + "ORDER BY pc.addedAt DESC")
  List<PreferredCarrierEntity> findByTenantIdAndShipperIdAndDeletedAtIsNull(
      @Param("tenantId") String tenantId, @Param("shipperId") String shipperId);

  @Query(
      "SELECT pc FROM PreferredCarrierEntity pc WHERE "
          + "pc.tenantId = :tenantId AND pc.shipperId = :shipperId AND pc.truckerId = :truckerId "
          + "AND pc.deletedAt IS NULL")
  Optional<PreferredCarrierEntity> findByTenantIdAndShipperIdAndTruckerIdAndDeletedAtIsNull(
      @Param("tenantId") String tenantId,
      @Param("shipperId") String shipperId,
      @Param("truckerId") String truckerId);

  @Query(
      "SELECT COUNT(pc) > 0 FROM PreferredCarrierEntity pc WHERE "
          + "pc.tenantId = :tenantId AND pc.shipperId = :shipperId AND pc.truckerId = :truckerId "
          + "AND pc.deletedAt IS NULL")
  boolean isPreferred(
      @Param("tenantId") String tenantId,
      @Param("shipperId") String shipperId,
      @Param("truckerId") String truckerId);
}
