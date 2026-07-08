package com.freightclub.modules.carrier.application;

import com.freightclub.dto.DieselPriceResponse;
import com.freightclub.modules.carrier.domain.CarrierCostProfile;
import com.freightclub.modules.carrier.infrastructure.CarrierCostProfileEntity;
import com.freightclub.modules.carrier.infrastructure.CarrierCostProfileRepository;
import com.freightclub.security.TenantContextHolder;
import com.freightclub.service.EiaFuelPriceService;
import java.math.BigDecimal;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class CarrierCostProfileService {

  private final CarrierCostProfileRepository repository;
  private final EiaFuelPriceService eiaFuelPriceService;

  public CarrierCostProfileService(
      CarrierCostProfileRepository repository, EiaFuelPriceService eiaFuelPriceService) {
    this.repository = repository;
    this.eiaFuelPriceService = eiaFuelPriceService;
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
            tenantId, truckerId, monthlyFixedCosts, fuelCostPerGallon,
            milesPerGallon, maintenanceCostPerMile, monthlyMilesTarget, targetMarginPerMile);
    repository.save(CarrierCostProfileEntity.fromDomain(domain));
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
        monthlyFixedCosts, fuelCostPerGallon, milesPerGallon,
        maintenanceCostPerMile, monthlyMilesTarget, targetMarginPerMile);
    repository.save(CarrierCostProfileEntity.fromDomain(domain));
    return domain;
  }

  // US-730a-v2: create-or-update the wizard-model profile (idempotent upsert).
  @CacheEvict(value = "carrierCostProfile", key = "#truckerId")
  public CarrierCostProfile upsertWizardProfile(String truckerId, CostProfileWizardInput input) {
    String tenantId = TenantContextHolder.getTenantId();
    CarrierCostProfileEntity existing =
        repository.findByTenantIdAndTruckerIdAndDeletedAtIsNull(tenantId, truckerId);

    CarrierCostProfile domain;
    if (existing == null) {
      domain =
          CarrierCostProfile.createNewWizard(
              tenantId, truckerId, input.dieselRegion(), input.milesPerGallon(),
              input.additionalCostPerMile(), input.truckPaymentMonthly(),
              input.insuranceMonthly(), input.permitsMonthly(), input.annualMiles(),
              input.weeklyIncomeGoal(), input.weeksWorkedPerYear());
    } else {
      domain = existing.toDomain();
      domain.updateWizardFields(
          input.dieselRegion(), input.milesPerGallon(), input.additionalCostPerMile(),
          input.truckPaymentMonthly(), input.insuranceMonthly(), input.permitsMonthly(),
          input.annualMiles(), input.weeklyIncomeGoal(), input.weeksWorkedPerYear());
    }
    repository.save(CarrierCostProfileEntity.fromDomain(domain));
    return domain;
  }

  // US-730a-v2: resolves the live diesel price for a profile's region.
  public BigDecimal resolveDieselPrice(CarrierCostProfile profile) {
    if (profile.getDieselRegion() == null) {
      return BigDecimal.ZERO;
    }
    DieselPriceResponse prices = eiaFuelPriceService.getDieselPrices();
    Double price =
        switch (profile.getDieselRegion()) {
          case "EAST" -> prices.eastPrice();
          case "MIDWEST" -> prices.midwestPrice();
          case "SOUTH" -> prices.southPrice();
          case "ROCKY" -> prices.rockyPrice();
          case "WEST" -> prices.westPrice();
          default -> null;
        };
    return price != null ? BigDecimal.valueOf(price) : BigDecimal.ZERO;
  }

  // US-705 / US-730a-v2: LoadService calls this unchanged; internally now prefers
  // the diesel-region-aware wizard formula when the profile has wizard fields.
  public BigDecimal calculateMinimumRPM(String truckerId) {
    CarrierCostProfile profile = getCostProfile(truckerId);
    if (profile == null) {
      return BigDecimal.ZERO;
    }
    if (profile.hasWizardFields()) {
      return profile.calculateMinimumRPM(resolveDieselPrice(profile));
    }
    return profile.calculateMinimumRPM();
  }
}
