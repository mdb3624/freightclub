package com.freightclub.repository;

import com.freightclub.domain.Load;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LoadRepository extends JpaRepository<Load, String> {

    Page<Load> findByTenantIdAndShipperIdAndDeletedAtIsNull(
            String tenantId, String shipperId, Pageable pageable);

    Optional<Load> findByIdAndTenantIdAndDeletedAtIsNull(String id, String tenantId);
}
