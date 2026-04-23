package com.freightclub.modules.load.infrastructure.persistence.jpa;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface SpringDataLoadRepository extends JpaRepository<LoadEntity, UUID>,
        JpaSpecificationExecutor<LoadEntity> {

    Optional<LoadEntity> findByIdAndDeletedAtIsNull(UUID id);

    Optional<LoadEntity> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, UUID tenantId);
}
