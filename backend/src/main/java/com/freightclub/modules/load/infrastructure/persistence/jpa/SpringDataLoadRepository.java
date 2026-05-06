package com.freightclub.modules.load.infrastructure.persistence.jpa;

import com.freightclub.modules.load.domain.LoadStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface SpringDataLoadRepository extends JpaRepository<LoadEntity, String>,
        JpaSpecificationExecutor<LoadEntity> {

    Optional<LoadEntity> findByIdAndDeletedAtIsNull(String id);

    Optional<LoadEntity> findByIdAndTenantIdAndDeletedAtIsNull(String id, String tenantId);

    long countByTenantIdAndTruckerIdAndStatusAndDeletedAtIsNull(
        String tenantId, String truckerId, LoadStatus status);
}
