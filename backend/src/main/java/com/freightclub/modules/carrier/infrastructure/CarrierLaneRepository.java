package com.freightclub.modules.carrier.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CarrierLaneRepository extends JpaRepository<CarrierLaneEntity, String> {
    List<CarrierLaneEntity> findByTenantIdAndTruckerIdAndDeletedAtIsNull(String tenantId, String truckerId);
    List<CarrierLaneEntity> findByOriginRegionAndDestinationRegionAndDeletedAtIsNull(String originRegion, String destinationRegion);

    // US-856 AC-1: batch lane lookup for carrier search cards — avoids N+1 vs. calling the
    // single-trucker method once per search result.
    List<CarrierLaneEntity> findByTenantIdAndTruckerIdInAndDeletedAtIsNull(String tenantId, List<String> truckerIds);
}
