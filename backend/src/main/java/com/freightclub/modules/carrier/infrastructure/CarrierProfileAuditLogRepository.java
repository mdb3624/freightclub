package com.freightclub.modules.carrier.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CarrierProfileAuditLogRepository extends JpaRepository<CarrierProfileAuditLogEntity, String> {
    List<CarrierProfileAuditLogEntity> findByTenantIdOrderByCreatedAtDesc(String tenantId);
    List<CarrierProfileAuditLogEntity> findByTruckerIdOrderByCreatedAtDesc(String truckerId);
}
