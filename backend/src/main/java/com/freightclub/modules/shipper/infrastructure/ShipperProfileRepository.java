package com.freightclub.modules.shipper.infrastructure;

import com.freightclub.modules.shipper.domain.ShipperProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ShipperProfileRepository extends JpaRepository<ShipperProfile, String> {
    Optional<ShipperProfile> findByTenantIdAndDeletedAtIsNull(String tenantId);
}
