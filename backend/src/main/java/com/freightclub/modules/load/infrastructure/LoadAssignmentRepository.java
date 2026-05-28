package com.freightclub.modules.load.infrastructure;

import com.freightclub.modules.load.domain.LoadAssignment;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LoadAssignmentRepository extends JpaRepository<LoadAssignment, String> {

  @Query(
      "SELECT la FROM LoadAssignment la "
          + "WHERE la.loadId = :loadId AND la.tenantId = :tenantId AND la.deletedAt IS NULL")
  Optional<LoadAssignment> findByLoadAndTenant(
      @Param("loadId") String loadId,
      @Param("tenantId") String tenantId);

  @Query(
      "SELECT la FROM LoadAssignment la "
          + "WHERE la.assignedCarrierId = :carrierId AND la.tenantId = :tenantId "
          + "AND la.deletedAt IS NULL "
          + "ORDER BY la.assignedAt DESC")
  Page<LoadAssignment> findByCarrierAndTenant(
      @Param("carrierId") String carrierId,
      @Param("tenantId") String tenantId,
      Pageable pageable);

  @Query(
      "SELECT la FROM LoadAssignment la "
          + "WHERE la.assignedByShipperId = :shipperId AND la.tenantId = :tenantId "
          + "AND la.deletedAt IS NULL "
          + "ORDER BY la.assignedAt DESC")
  Page<LoadAssignment> findByShipperAndTenant(
      @Param("shipperId") String shipperId,
      @Param("tenantId") String tenantId,
      Pageable pageable);

  @Query(
      "SELECT COUNT(la) FROM LoadAssignment la "
          + "WHERE la.assignedCarrierId = :carrierId AND la.tenantId = :tenantId "
          + "AND la.deletedAt IS NULL AND la.acceptedByCarrier = true")
  long countAcceptedByCarrier(
      @Param("carrierId") String carrierId,
      @Param("tenantId") String tenantId);
}
