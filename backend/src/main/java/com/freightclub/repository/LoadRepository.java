package com.freightclub.repository;

import com.freightclub.domain.Load;
import com.freightclub.domain.LoadStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;
import java.util.Optional;

public interface LoadRepository extends JpaRepository<Load, String>, JpaSpecificationExecutor<Load> {

    Page<Load> findByTenantIdAndShipperIdAndDeletedAtIsNull(
            String tenantId, String shipperId, Pageable pageable);

    Optional<Load> findByIdAndTenantIdAndDeletedAtIsNull(String id, String tenantId);

    Page<Load> findByTenantIdAndStatusAndDeletedAtIsNull(
            String tenantId, LoadStatus status, Pageable pageable);

    // Board queries — cross-tenant (marketplace: all truckers see all open loads)
    Page<Load> findByStatusAndDeletedAtIsNull(LoadStatus status, Pageable pageable);

    Page<Load> findByStatusAndEquipmentTypeAndDeletedAtIsNull(
            LoadStatus status, com.freightclub.domain.EquipmentType equipmentType, Pageable pageable);

    Optional<Load> findByIdAndDeletedAtIsNull(String id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT l FROM Load l WHERE l.id = :id AND l.deletedAt IS NULL")
    Optional<Load> findByIdAndDeletedAtIsNullForUpdate(@Param("id") String id);

    java.util.Optional<Load> findFirstByTruckerIdAndStatusInAndDeletedAtIsNull(
            String truckerId, java.util.List<LoadStatus> statuses);

    Page<Load> findByTruckerIdAndStatusInAndDeletedAtIsNull(
            String truckerId, java.util.List<LoadStatus> statuses, Pageable pageable);

    long countByShipperIdAndStatusInAndDeletedAtIsNull(
            String shipperId, java.util.Collection<LoadStatus> statuses);

    long countByTruckerIdAndStatusInAndDeletedAtIsNull(
            String truckerId, java.util.Collection<LoadStatus> statuses);

    @org.springframework.data.jpa.repository.Query(
            "SELECT l.status, COUNT(l) FROM Load l WHERE l.shipperId = :shipperId AND l.deletedAt IS NULL GROUP BY l.status")
    java.util.List<Object[]> countByStatusForShipper(@org.springframework.data.repository.query.Param("shipperId") String shipperId);

    @Query("SELECT DISTINCT l.originState FROM Load l WHERE l.status = 'OPEN' AND l.deletedAt IS NULL AND l.equipmentType = :equipmentType ORDER BY l.originState")
    java.util.List<String> findDistinctOriginStatesByEquipmentType(@Param("equipmentType") com.freightclub.domain.EquipmentType equipmentType);

    @Query("SELECT DISTINCT l.destinationState FROM Load l WHERE l.status = 'OPEN' AND l.deletedAt IS NULL AND l.equipmentType = :equipmentType ORDER BY l.destinationState")
    java.util.List<String> findDistinctDestinationStatesByEquipmentType(@Param("equipmentType") com.freightclub.domain.EquipmentType equipmentType);
}
