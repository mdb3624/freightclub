package com.freightclub.modules.shipper.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ShipperReputationRepository extends JpaRepository<ShipperReputationEntity, String> {

  ShipperReputationEntity findByTenantIdAndShipperIdAndDeletedAtIsNull(
      String tenantId, String shipperId);

  @Query(
      "SELECT s FROM ShipperReputationEntity s WHERE s.tenantId = ?1 AND s.shipperId = ?2 AND s.deletedAt IS NULL")
  ShipperReputationEntity findActiveReputation(String tenantId, String shipperId);
}
