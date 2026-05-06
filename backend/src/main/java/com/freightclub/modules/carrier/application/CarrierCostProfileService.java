package com.freightclub.modules.carrier.application;

import com.freightclub.modules.carrier.domain.CarrierCostProfile;
import com.freightclub.modules.carrier.infrastructure.CarrierCostProfileEntity;
import com.freightclub.modules.carrier.infrastructure.CarrierCostProfileRepository;
import com.freightclub.security.TenantContextHolder;
import java.math.BigDecimal;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class CarrierCostProfileService {

  private final CarrierCostProfileRepository repository;

  public CarrierCostProfileService(CarrierCostProfileRepository repository) {
    this.repository = repository;
  }

  @Cacheable(value = "carrierCostProfile", key = "#truckerId", unless = "#result == null")
  public CarrierCostProfile getCostProfile(String truckerId) {
    String tenantId = TenantContextHolder.getTenantId();
    CarrierCostProfileEntity entity =
        repository.findByTenantIdAndTruckerIdAndDeletedAtIsNull(tenantId, truckerId);
    return entity != null ? entity.toDomain() : null;
  }

  @CacheEvict(value = "carrierCostProfile", key = "#truckerId")
  public CarrierCostProfile createCostProfile(
      String truckerId,
      BigDecimal monthlyFixedCosts,
      BigDecimal fuelCostPerGallon,
      BigDecimal milesPerGallon,
      BigDecimal maintenanceCostPerMile,
      int monthlyMilesTarget,
      BigDecimal targetMarginPerMile) {
    String tenantId = TenantContextHolder.getTenantId();

    CarrierCostProfile domain =
        CarrierCostProfile.createNew(
            tenantId,
            truckerId,
            monthlyFixedCosts,
            fuelCostPerGallon,
            milesPerGallon,
            maintenanceCostPerMile,
            monthlyMilesTarget,
            targetMarginPerMile);

    CarrierCostProfileEntity entity = CarrierCostProfileEntity.fromDomain(domain);
    repository.save(entity);
    return domain;
  }

  @CacheEvict(value = "carrierCostProfile", key = "#truckerId")
  public CarrierCostProfile updateCostProfile(
      String truckerId,
      BigDecimal monthlyFixedCosts,
      BigDecimal fuelCostPerGallon,
      BigDecimal milesPerGallon,
      BigDecimal maintenanceCostPerMile,
      int monthlyMilesTarget,
      BigDecimal targetMarginPerMile) {
    String tenantId = TenantContextHolder.getTenantId();
    CarrierCostProfileEntity entity =
        repository.findByTenantIdAndTruckerIdAndDeletedAtIsNull(tenantId, truckerId);

    if (entity == null) {
      throw new CarrierCostProfileNotFoundException(
          String.format("Cost profile not found for trucker %s", truckerId));
    }

    CarrierCostProfile domain = entity.toDomain();
    domain.update(
        monthlyFixedCosts,
        fuelCostPerGallon,
        milesPerGallon,
        maintenanceCostPerMile,
        monthlyMilesTarget,
        targetMarginPerMile);

    entity = CarrierCostProfileEntity.fromDomain(domain);
    repository.save(entity);
    return domain;
  }

  public BigDecimal calculateMinimumRPM(String truckerId) {
    CarrierCostProfile profile = getCostProfile(truckerId);
    if (profile == null) {
      return BigDecimal.ZERO;
    }
    return profile.calculateMinimumRPM();
  }
}
