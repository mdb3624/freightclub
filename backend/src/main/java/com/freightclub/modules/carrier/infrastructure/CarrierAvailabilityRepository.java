package com.freightclub.modules.carrier.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CarrierAvailabilityRepository extends JpaRepository<CarrierAvailabilityEntity, String> {
    Optional<CarrierAvailabilityEntity> findByTenantIdAndTruckerId(String tenantId, String truckerId);
}
