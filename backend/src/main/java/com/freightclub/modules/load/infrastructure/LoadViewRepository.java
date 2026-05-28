package com.freightclub.modules.load.infrastructure;

import com.freightclub.modules.load.domain.LoadView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LoadViewRepository extends JpaRepository<LoadView, String> {

  @Query(
      "SELECT COUNT(lv) FROM LoadView lv "
          + "WHERE lv.loadId = :loadId AND lv.tenantId = :tenantId")
  long countByLoadAndTenant(
      @Param("loadId") String loadId,
      @Param("tenantId") String tenantId);

  @Query(
      "SELECT COUNT(DISTINCT lv.carrierId) FROM LoadView lv "
          + "WHERE lv.loadId = :loadId AND lv.tenantId = :tenantId")
  long countUniqueCarriersViewedLoad(
      @Param("loadId") String loadId,
      @Param("tenantId") String tenantId);
}
