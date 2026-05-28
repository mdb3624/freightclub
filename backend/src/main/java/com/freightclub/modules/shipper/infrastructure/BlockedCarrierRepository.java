package com.freightclub.modules.shipper.infrastructure;

import com.freightclub.modules.shipper.domain.BlockedCarrier;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BlockedCarrierRepository extends JpaRepository<BlockedCarrier, String> {

  @Query(
      "SELECT bc FROM BlockedCarrier bc "
          + "WHERE bc.shipperId = :shipperId AND bc.carrierId = :carrierId "
          + "AND bc.tenantId = :tenantId AND bc.deletedAt IS NULL")
  Optional<BlockedCarrier> findByShipperCarrierAndTenant(
      @Param("shipperId") String shipperId,
      @Param("carrierId") String carrierId,
      @Param("tenantId") String tenantId);

  @Query(
      "SELECT bc FROM BlockedCarrier bc "
          + "WHERE bc.shipperId = :shipperId AND bc.tenantId = :tenantId "
          + "AND bc.deletedAt IS NULL "
          + "ORDER BY bc.createdAt DESC")
  Page<BlockedCarrier> findByShipperAndTenant(
      @Param("shipperId") String shipperId,
      @Param("tenantId") String tenantId,
      Pageable pageable);

  @Query(
      "SELECT COUNT(bc) FROM BlockedCarrier bc "
          + "WHERE bc.shipperId = :shipperId AND bc.tenantId = :tenantId "
          + "AND bc.deletedAt IS NULL")
  long countByShipperAndTenant(
      @Param("shipperId") String shipperId,
      @Param("tenantId") String tenantId);

  @Query(
      "SELECT CASE WHEN COUNT(bc) > 0 THEN true ELSE false END FROM BlockedCarrier bc "
          + "WHERE bc.shipperId = :shipperId AND bc.carrierId = :carrierId "
          + "AND bc.tenantId = :tenantId AND bc.deletedAt IS NULL")
  boolean isCarrierBlocked(
      @Param("shipperId") String shipperId,
      @Param("carrierId") String carrierId,
      @Param("tenantId") String tenantId);
}
