package com.freightclub.modules.carrier.infrastructure;

import com.freightclub.modules.carrier.domain.EquipmentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CarrierEquipmentRepository extends JpaRepository<CarrierEquipmentEntity, String> {

    // AC-1: Find active equipment for trucker
    List<CarrierEquipmentEntity> findByTenantIdAndTruckerIdAndDeletedAtIsNull(
        String tenantId,
        String truckerId
    );

    // AC-1: Find equipment by type (for board algorithm)
    List<CarrierEquipmentEntity> findByTenantIdAndEquipmentTypeAndDeletedAtIsNull(
        String tenantId,
        EquipmentType equipmentType
    );

    // RLS-aware query
    @Query("SELECT e FROM CarrierEquipmentEntity e WHERE e.tenantId = :tenantId AND e.truckerId = :truckerId AND e.deletedAt IS NULL")
    List<CarrierEquipmentEntity> findActiveEquipment(String tenantId, String truckerId);
}
