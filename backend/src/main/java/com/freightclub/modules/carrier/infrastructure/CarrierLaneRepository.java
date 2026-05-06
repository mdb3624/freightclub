package com.freightclub.modules.carrier.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CarrierLaneRepository extends JpaRepository<CarrierLaneEntity, String> {
    List<CarrierLaneEntity> findByTenantIdAndTruckerIdAndDeletedAtIsNull(String tenantId, String truckerId);
    List<CarrierLaneEntity> findByOriginRegionAndDestinationRegionAndDeletedAtIsNull(String originRegion, String destinationRegion);
}
