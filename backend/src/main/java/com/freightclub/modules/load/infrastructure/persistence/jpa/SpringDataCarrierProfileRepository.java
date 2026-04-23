package com.freightclub.modules.load.infrastructure.persistence.jpa;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SpringDataCarrierProfileRepository extends JpaRepository<CarrierProfileEntity, String> {

    List<CarrierProfileEntity> findByTenantIdAndDeletedAtIsNull(String tenantId);
}
