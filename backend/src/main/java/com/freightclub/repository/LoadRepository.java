package com.freightclub.repository;

import com.freightclub.domain.Load;
import com.freightclub.domain.LoadStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

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
}
