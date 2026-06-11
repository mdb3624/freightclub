package com.freightclub.repository;

import com.freightclub.domain.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {

    @Query("SELECT u FROM User u WHERE u.id = ?1 AND u.deletedAt IS NULL")
    Optional<User> findById(String id);

    Optional<User> findByEmailAndDeletedAtIsNull(String email);

    boolean existsByEmail(String email);

    @Query("""
            SELECT u FROM User u
            WHERE u.tenantId = :tenantId
              AND u.role = com.freightclub.domain.UserRole.TRUCKER
              AND u.deletedAt IS NULL
              AND (
                LOWER(u.firstName) LIKE LOWER(CONCAT(:q, '%'))
                OR LOWER(u.lastName) LIKE LOWER(CONCAT(:q, '%'))
                OR LOWER(CONCAT(u.firstName, ' ', u.lastName)) LIKE LOWER(CONCAT(:q, '%'))
                OR LOWER(u.email) LIKE LOWER(CONCAT('%', :q, '%'))
              )
            ORDER BY u.firstName ASC, u.lastName ASC
            """)
    List<User> searchTruckers(@Param("tenantId") String tenantId,
                              @Param("q") String q,
                              Pageable pageable);

    // US-762 AC-1/AC-2: lane-based carrier search — joins CarrierLaneEntity on origin/destination
    // region match; equipmentType filter is optional (null = no filter).
    @Query("""
            SELECT DISTINCT u FROM User u
            JOIN com.freightclub.modules.carrier.infrastructure.CarrierLaneEntity l
                ON l.truckerId = u.id AND l.tenantId = u.tenantId AND l.deletedAt IS NULL
            WHERE u.tenantId = :tenantId
              AND u.role = com.freightclub.domain.UserRole.TRUCKER
              AND u.deletedAt IS NULL
              AND l.originRegion = :origin
              AND l.destinationRegion = :destination
              AND (:equipmentType IS NULL OR u.equipmentType = :equipmentType)
            ORDER BY u.firstName ASC, u.lastName ASC
            """)
    List<User> searchTruckersByLane(@Param("tenantId") String tenantId,
                                    @Param("origin") String origin,
                                    @Param("destination") String destination,
                                    @Param("equipmentType") com.freightclub.domain.EquipmentType equipmentType,
                                    Pageable pageable);
}
