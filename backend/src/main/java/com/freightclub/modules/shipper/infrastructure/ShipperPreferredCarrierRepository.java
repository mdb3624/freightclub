package com.freightclub.modules.shipper.infrastructure;

import com.freightclub.modules.shipper.domain.ShipperPreferredCarrier;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ShipperPreferredCarrierRepository
    extends JpaRepository<ShipperPreferredCarrier, String> {

  @Query(
      "SELECT spc FROM ShipperPreferredCarrier spc "
          + "WHERE spc.tenantId = :tenantId AND spc.shipperId = :shipperId "
          + "AND spc.deletedAt IS NULL "
          + "ORDER BY spc.createdAt DESC")
  Page<ShipperPreferredCarrier> findByShipperAndTenant(
      @Param("tenantId") String tenantId,
      @Param("shipperId") String shipperId,
      Pageable pageable);

  @Query(
      "SELECT spc FROM ShipperPreferredCarrier spc "
          + "WHERE spc.tenantId = :tenantId AND spc.shipperId = :shipperId "
          + "AND spc.carrierId = :carrierId AND spc.deletedAt IS NULL")
  Optional<ShipperPreferredCarrier> findByShipperCarrierAndTenant(
      @Param("tenantId") String tenantId,
      @Param("shipperId") String shipperId,
      @Param("carrierId") String carrierId);

  @Query(
      "SELECT COUNT(spc) FROM ShipperPreferredCarrier spc "
          + "WHERE spc.tenantId = :tenantId AND spc.shipperId = :shipperId "
          + "AND spc.deletedAt IS NULL")
  long countByShipperAndTenant(
      @Param("tenantId") String tenantId,
      @Param("shipperId") String shipperId);

  @Query(
      "SELECT spc FROM ShipperPreferredCarrier spc "
          + "WHERE spc.tenantId = :tenantId AND spc.shipperId = :shipperId "
          + "AND spc.deletedAt IS NULL")
  List<ShipperPreferredCarrier> findAllByShipperAndTenant(
      @Param("tenantId") String tenantId,
      @Param("shipperId") String shipperId);
}
