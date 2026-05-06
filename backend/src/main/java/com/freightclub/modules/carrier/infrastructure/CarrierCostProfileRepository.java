package com.freightclub.modules.carrier.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CarrierCostProfileRepository extends JpaRepository<CarrierCostProfileEntity, String> {

  Optional<CarrierCostProfileEntity> findByTenantIdAndTruckerId(String tenantId, String truckerId);

  @Query(
      "SELECT c FROM CarrierCostProfileEntity c "
          + "WHERE c.tenantId = ?1 AND c.truckerId = ?2 AND c.deletedAt IS NULL")
  Optional<CarrierCostProfileEntity> findActiveProfile(String tenantId, String truckerId);

  @Query(
      "SELECT c FROM CarrierCostProfileEntity c "
          + "WHERE c.tenantId = ?1 AND c.deletedAt IS NULL")
  List<CarrierCostProfileEntity> findAllActiveByTenantId(String tenantId);

  @Query(
      "SELECT c FROM CarrierCostProfileEntity c "
          + "WHERE c.tenantId = ?1 AND c.truckerId = ?2 AND c.deletedAt IS NULL")
  CarrierCostProfileEntity findByTenantIdAndTruckerIdAndDeletedAtIsNull(
      String tenantId, String truckerId);
}
