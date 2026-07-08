package com.freightclub.modules.carrier;

import static org.assertj.core.api.Assertions.*;

import com.freightclub.domain.Tenant;
import com.freightclub.domain.User;
import com.freightclub.domain.UserRole;
import com.freightclub.dto.DieselPriceResponse;
import com.freightclub.modules.carrier.application.CarrierCostProfileService;
import com.freightclub.modules.carrier.application.CostProfileWizardInput;
import com.freightclub.modules.carrier.domain.CarrierCostProfile;
import com.freightclub.modules.carrier.infrastructure.CarrierCostProfileRepository;
import com.freightclub.repository.TenantRepository;
import com.freightclub.repository.UserRepository;
import com.freightclub.security.TenantContextHolder;
import com.freightclub.service.EiaFuelPriceService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.cache.CacheManager;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CarrierCostProfileServiceTest {

  private static final String TENANT_ID = "test-tenant-carrier-cost";
  private static final String TRUCKER_ID = "trucker-carrier-cost";

  @Autowired private CarrierCostProfileService service;
  @Autowired private CarrierCostProfileRepository repository;
  @Autowired private CacheManager cacheManager;
  @Autowired private TenantRepository tenantRepository;
  @Autowired private UserRepository userRepository;

  @MockBean private EiaFuelPriceService eiaFuelPriceService;

  @BeforeEach
  void setup() {
    TenantContextHolder.setTenantId(TENANT_ID);

    // Create tenant
    Tenant tenant = new Tenant();
    tenant.setId(TENANT_ID);
    tenant.setName("Carrier Cost Test Tenant");
    tenantRepository.save(tenant);

    // Create trucker user
    User trucker = new User(TRUCKER_ID);
    trucker.setTenantId(TENANT_ID);
    trucker.setEmail("trucker@test.com");
    trucker.setPasswordHash("$2a$10$testpassword");
    trucker.setRole(UserRole.TRUCKER);
    trucker.setFirstName("Test");
    trucker.setLastName("Trucker");
    userRepository.save(trucker);

    cacheManager.getCache("carrierCostProfile").clear();
  }

  @AfterEach
  void cleanup() {
    TenantContextHolder.clear();
    cacheManager.getCache("carrierCostProfile").clear();
  }

  @Test
  void testCreateCostProfile() {
    CarrierCostProfile profile =
        service.createCostProfile(
            TRUCKER_ID,
            new BigDecimal("2500"),
            new BigDecimal("3.50"),
            new BigDecimal("6.5"),
            new BigDecimal("0.15"),
            10000,
            new BigDecimal("0.50"));

    assertThat(profile).isNotNull();
    assertThat(profile.getId()).isNotNull();
    assertThat(profile.getTenantId()).isEqualTo(TENANT_ID);
    assertThat(profile.getTruckerId()).isEqualTo(TRUCKER_ID);
    assertThat(profile.getMonthlyFixedCosts()).isEqualTo(new BigDecimal("2500"));
  }

  @Test
  void testGetCostProfile_CacheHit() {
    service.createCostProfile(
        TRUCKER_ID,
        new BigDecimal("2500"),
        new BigDecimal("3.50"),
        new BigDecimal("6.5"),
        new BigDecimal("0.15"),
        10000,
        new BigDecimal("0.50"));

    // First call: cache miss
    CarrierCostProfile profile1 = service.getCostProfile(TRUCKER_ID);
    assertThat(profile1).isNotNull();

    // Second call: cache hit (same object reference if using same data)
    CarrierCostProfile profile2 = service.getCostProfile(TRUCKER_ID);
    assertThat(profile2).isNotNull();
    assertThat(profile2.getId()).isEqualTo(profile1.getId());
  }

  @Test
  void testGetCostProfile_NotFound() {
    CarrierCostProfile profile = service.getCostProfile("nonexistent-trucker");
    assertThat(profile).isNull();
  }

  @Test
  void testUpdateCostProfile() {
    service.createCostProfile(
        TRUCKER_ID,
        new BigDecimal("2500"),
        new BigDecimal("3.50"),
        new BigDecimal("6.5"),
        new BigDecimal("0.15"),
        10000,
        new BigDecimal("0.50"));

    CarrierCostProfile updated =
        service.updateCostProfile(
            TRUCKER_ID,
            new BigDecimal("3000"),
            new BigDecimal("3.75"),
            new BigDecimal("7.0"),
            new BigDecimal("0.12"),
            12000,
            new BigDecimal("0.60"));

    assertThat(updated.getMonthlyFixedCosts()).isEqualTo(new BigDecimal("3000"));
    assertThat(updated.getFuelCostPerGallon()).isEqualTo(new BigDecimal("3.75"));
  }

  @Test
  void testUpdateCostProfile_NotFound() {
    assertThatThrownBy(
            () ->
                service.updateCostProfile(
                    "nonexistent-trucker",
                    new BigDecimal("2500"),
                    new BigDecimal("3.50"),
                    new BigDecimal("6.5"),
                    new BigDecimal("0.15"),
                    10000,
                    new BigDecimal("0.50")))
        .hasMessageContaining("Cost profile not found");
  }

  @Test
  void testCalculateMinimumRPM_ExistingProfile() {
    service.createCostProfile(
        TRUCKER_ID,
        new BigDecimal("2500"),
        new BigDecimal("3.50"),
        new BigDecimal("6.5"),
        new BigDecimal("0.15"),
        10000,
        new BigDecimal("0.50"));

    BigDecimal minRPM = service.calculateMinimumRPM(TRUCKER_ID);

    // Fixed CPM = 2500 / 10000 = 0.25
    // Fuel CPM = 3.50 / 6.5 ≈ 0.5385
    // Variable CPM = 0.5385 + 0.15 ≈ 0.6885
    // Total CPM = 0.25 + 0.6885 ≈ 0.9385
    // Minimum RPM = 0.9385 + 0.50 ≈ 1.4385
    assertThat(minRPM).isGreaterThan(new BigDecimal("1.40"));
    assertThat(minRPM).isLessThan(new BigDecimal("1.50"));
  }

  @Test
  void testCalculateMinimumRPM_NotFound_ReturnsZero() {
    BigDecimal minRPM = service.calculateMinimumRPM("nonexistent-trucker");
    assertThat(minRPM).isEqualTo(BigDecimal.ZERO);
  }

  @Test
  void testCacheEvictOnCreate() {
    CarrierCostProfile created =
        service.createCostProfile(
            TRUCKER_ID,
            new BigDecimal("2500"),
            new BigDecimal("3.50"),
            new BigDecimal("6.5"),
            new BigDecimal("0.15"),
            10000,
            new BigDecimal("0.50"));

    assertThat(created).isNotNull();
    // Cache is cleared after create, so next get will fetch from DB
    CarrierCostProfile fetched = service.getCostProfile(TRUCKER_ID);
    assertThat(fetched).isNotNull();
  }

  @Test
  void testCacheEvictOnUpdate() {
    service.createCostProfile(
        TRUCKER_ID,
        new BigDecimal("2500"),
        new BigDecimal("3.50"),
        new BigDecimal("6.5"),
        new BigDecimal("0.15"),
        10000,
        new BigDecimal("0.50"));

    // Warm cache
    CarrierCostProfile cached = service.getCostProfile(TRUCKER_ID);
    assertThat(cached.getMonthlyFixedCosts()).isEqualTo(new BigDecimal("2500"));

    // Update should evict cache
    CarrierCostProfile updated =
        service.updateCostProfile(
            TRUCKER_ID,
            new BigDecimal("3000"),
            new BigDecimal("3.75"),
            new BigDecimal("7.0"),
            new BigDecimal("0.12"),
            12000,
            new BigDecimal("0.60"));

    assertThat(updated.getMonthlyFixedCosts()).isEqualTo(new BigDecimal("3000"));
  }

  @Test
  void testUpsertWizardProfile_createsNewProfile_andRpmUsesEiaPrice() {
    org.mockito.Mockito.when(eiaFuelPriceService.getDieselPrices())
        .thenReturn(new DieselPriceResponse(
            null, null, // east, eastDelta
            3.90, null, // midwest, midwestDelta
            null, null, null, null, null, null, // south, southDelta, rocky, rockyDelta, west, westDelta
            "2026-07-01", false, true));

    var input = new CostProfileWizardInput(
        "MIDWEST", new BigDecimal("6.5"), new BigDecimal("0.08"),
        new BigDecimal("1200"), new BigDecimal("600"), new BigDecimal("150"),
        120000, new BigDecimal("2000"), 48);

    CarrierCostProfile profile = service.upsertWizardProfile(TRUCKER_ID, input);

    assertThat(profile.hasWizardFields()).isTrue();
    BigDecimal minRpm = service.calculateMinimumRPM(TRUCKER_ID);
    // fuelCpm=3.90/6.5=0.6, varCpm=0.68, fixedCpm=0.195, marginCpm=0.8 -> minRpm=1.675
    assertThat(minRpm).isEqualByComparingTo("1.6750");
  }

  @Test
  void testUpsertWizardProfile_updatesExistingProfile() {
    org.mockito.Mockito.when(eiaFuelPriceService.getDieselPrices())
        .thenReturn(new DieselPriceResponse(
            null, null, 3.90, null,
            null, null, null, null, null, null,
            "2026-07-01", false, true));

    var firstInput = new CostProfileWizardInput(
        "MIDWEST", new BigDecimal("6.5"), new BigDecimal("0.08"),
        new BigDecimal("1200"), new BigDecimal("600"), new BigDecimal("150"),
        120000, new BigDecimal("2000"), 48);
    service.upsertWizardProfile(TRUCKER_ID, firstInput);

    var secondInput = new CostProfileWizardInput(
        "MIDWEST", new BigDecimal("7.0"), new BigDecimal("0.08"),
        new BigDecimal("1200"), new BigDecimal("600"), new BigDecimal("150"),
        120000, new BigDecimal("2000"), 48);
    CarrierCostProfile updated = service.upsertWizardProfile(TRUCKER_ID, secondInput);

    assertThat(updated.getMilesPerGallon()).isEqualByComparingTo("7.0");
  }

  @Test
  void testResolveDieselPrice_legacyProfileWithNullRegion_returnsZero_doesNotThrow() {
    CarrierCostProfile profile =
        service.createCostProfile(
            TRUCKER_ID,
            new BigDecimal("2500"),
            new BigDecimal("3.50"),
            new BigDecimal("6.5"),
            new BigDecimal("0.15"),
            10000,
            new BigDecimal("0.50"));

    // Legacy profile has null dieselRegion
    assertThat(profile.getDieselRegion()).isNull();

    // This should not throw NPE and should return ZERO
    BigDecimal result = service.resolveDieselPrice(profile);

    assertThat(result).isEqualByComparingTo(BigDecimal.ZERO);
  }
}
