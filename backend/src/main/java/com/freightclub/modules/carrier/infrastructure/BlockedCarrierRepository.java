package com.freightclub.modules.carrier.infrastructure;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BlockedCarrierRepository extends JpaRepository<BlockedCarrierEntity, String> {

  @Query(
      "SELECT bc FROM BlockedCarrierEntity bc WHERE "
          + "bc.tenantId = :tenantId AND bc.shipperId = :shipperId AND bc.truckerId = :truckerId "
          + "AND bc.unblockedAt IS NULL AND bc.deletedAt IS NULL")
  Optional<BlockedCarrierEntity> findActiveBlock(
      @Param("tenantId") String tenantId,
      @Param("shipperId") String shipperId,
      @Param("truckerId") String truckerId);

  @Query(
      "SELECT COUNT(bc) > 0 FROM BlockedCarrierEntity bc WHERE "
          + "bc.tenantId = :tenantId AND bc.shipperId = :shipperId AND bc.truckerId = :truckerId "
          + "AND bc.unblockedAt IS NULL AND bc.deletedAt IS NULL")
  boolean isBlocked(
      @Param("tenantId") String tenantId,
      @Param("shipperId") String shipperId,
      @Param("truckerId") String truckerId);
}
