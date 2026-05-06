package com.freightclub.repository;

import com.freightclub.domain.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification, String> {

    Page<Notification> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

    long countByUserIdAndReadFalse(String userId);

    // Tenant-aware methods
    Page<Notification> findByUserIdAndTenantIdOrderByCreatedAtDesc(String userId, String tenantId, Pageable pageable);

    long countByUserIdAndTenantIdAndReadFalse(String userId, String tenantId);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.userId = :userId AND n.read = false")
    int markAllReadByUserId(@Param("userId") String userId);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.userId = :userId AND n.tenantId = :tenantId AND n.read = false")
    int markAllReadByUserIdAndTenantId(@Param("userId") String userId, @Param("tenantId") String tenantId);
}
