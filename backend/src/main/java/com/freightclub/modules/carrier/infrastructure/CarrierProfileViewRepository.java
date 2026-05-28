package com.freightclub.modules.carrier.infrastructure;

import com.freightclub.modules.carrier.domain.CarrierProfileView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CarrierProfileViewRepository extends JpaRepository<CarrierProfileView, String> {

  @Query(
      "SELECT COUNT(cpv) FROM CarrierProfileView cpv "
          + "WHERE cpv.carrierId = :carrierId AND cpv.tenantId = :tenantId")
  long countByCarrierAndTenant(
      @Param("carrierId") String carrierId,
      @Param("tenantId") String tenantId);

  @Query(
      "SELECT COUNT(DISTINCT cpv.shipperId) FROM CarrierProfileView cpv "
          + "WHERE cpv.carrierId = :carrierId AND cpv.tenantId = :tenantId")
  long countUniqueShippersViewedProfile(
      @Param("carrierId") String carrierId,
      @Param("tenantId") String tenantId);
}
