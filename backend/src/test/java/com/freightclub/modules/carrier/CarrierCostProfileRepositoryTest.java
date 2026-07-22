package com.freightclub.modules.carrier;

import static org.assertj.core.api.Assertions.*;

import com.freightclub.domain.Tenant;
import com.freightclub.domain.User;
import com.freightclub.domain.UserRole;
import com.freightclub.repository.TenantRepository;
import com.freightclub.repository.UserRepository;
import com.freightclub.modules.carrier.domain.CarrierCostProfile;
import com.freightclub.modules.carrier.infrastructure.CarrierCostProfileEntity;
import com.freightclub.modules.carrier.infrastructure.CarrierCostProfileRepository;
import com.freightclub.security.TenantContextHolder;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Optional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CarrierCostProfileRepositoryTest {

  private static final String TENANT_ID = "test-tenant-123";
  private static final String TRUCKER_ID = "trucker-456";

  @Autowired private CarrierCostProfileRepository repository;
  @Autowired private UserRepository userRepository;
  @Autowired private TenantRepository tenantRepository;
  @Autowired private jakarta.persistence.EntityManager entityManager;

  @BeforeEach
  void setup() {
    TenantContextHolder.setTenantId(TENANT_ID);
    ensureTenantsExist();
    ensureUsersExist();
  }

  private void ensureTenantsExist() {
    createTenantIfMissing(TENANT_ID, "Test Tenant 123");
    createTenantIfMissing("tenant-1", "Tenant One");
    createTenantIfMissing("tenant-2", "Tenant Two");
  }

  private void createTenantIfMissing(String tenantId, String name) {
    if (!tenantRepository.findById(tenantId).isPresent()) {
      Tenant tenant = new Tenant();
      tenant.setId(tenantId);
      tenant.setName(name);
      tenantRepository.save(tenant);
    }
  }

  private void ensureUsersExist() {
    createUserIfMissing(TRUCKER_ID, "trucker456@test.com", UserRole.TRUCKER, TENANT_ID);
    createUserIfMissing("trucker-1", "trucker1@test.com", UserRole.TRUCKER, TENANT_ID);
    createUserIfMissing("trucker-2", "trucker2@test.com", UserRole.TRUCKER, TENANT_ID);
    createUserIfMissing("trucker-1", "trucker1@tenant2.com", UserRole.TRUCKER, "tenant-2");
  }

  private void createUserIfMissing(String userId, String email, UserRole role, String tenantId) {
    if (!userRepository.findById(userId).isPresent()) {
      // US-858: this fixture creates users for tenants OTHER than TENANT_ID (e.g. "tenant-2")
      // — the INSERT's WITH CHECK needs app.current_tenant to match THIS user's own
      // tenant_id, not whatever was bound when setup() started. Switch, flush, restore.
      String callerTenantId = TenantContextHolder.getTenantId();
      TenantContextHolder.setTenantId(tenantId);
      User user = new User(userId);
      user.setTenantId(tenantId);
      user.setEmail(email);
      user.setPasswordHash("$2a$10$testpassword");
      user.setRole(role);
      user.setFirstName("Test");
      user.setLastName("User");
      userRepository.save(user);
      entityManager.flush();
      TenantContextHolder.setTenantId(callerTenantId);
    }
  }

  @AfterEach
  void cleanup() {
    TenantContextHolder.clear();
  }

  @Test
  void testCreateCostProfile() {
    CarrierCostProfile domain = CarrierCostProfile.createNew(
        TENANT_ID,
        TRUCKER_ID,
        new BigDecimal("2500"),      // monthly fixed
        new BigDecimal("3.50"),       // fuel per gallon
        new BigDecimal("6.5"),        // mpg
        new BigDecimal("0.15"),       // maintenance per mile
        10000,                        // monthly miles target
        new BigDecimal("0.50")        // target margin
    );

    CarrierCostProfileEntity entity = CarrierCostProfileEntity.fromDomain(domain);
    CarrierCostProfileEntity saved = repository.save(entity);

    assertThat(saved.getId()).isNotNull();
    assertThat(saved.getTenantId()).isEqualTo(TENANT_ID);
    assertThat(saved.getTruckerId()).isEqualTo(TRUCKER_ID);
    assertThat(saved.getMonthlyFixedCosts()).isEqualTo(new BigDecimal("2500"));
  }

  @Test
  void testCalculateMinimumRPM() {
    CarrierCostProfile domain = CarrierCostProfile.createNew(
        TENANT_ID,
        TRUCKER_ID,
        new BigDecimal("2500"),
        new BigDecimal("3.50"),
        new BigDecimal("6.5"),
        new BigDecimal("0.15"),
        10000,
        new BigDecimal("0.50")
    );

    // Fixed CPM = 2500 / 10000 = 0.25
    // Fuel CPM = 3.50 / 6.5 ≈ 0.5385
    // Variable CPM = 0.5385 + 0.15 ≈ 0.6885
    // Total CPM = 0.25 + 0.6885 ≈ 0.9385
    // Minimum RPM = 0.9385 + 0.50 ≈ 1.4385

    BigDecimal minRPM = domain.calculateMinimumRPM();
    assertThat(minRPM).isGreaterThan(new BigDecimal("1.40"));
    assertThat(minRPM).isLessThan(new BigDecimal("1.50"));
  }

  @Test
  void testFindActiveProfile_RespectsSoftDelete() {
    CarrierCostProfile domain = CarrierCostProfile.createNew(
        TENANT_ID,
        TRUCKER_ID,
        new BigDecimal("2500"),
        new BigDecimal("3.50"),
        new BigDecimal("6.5"),
        new BigDecimal("0.15"),
        10000,
        new BigDecimal("0.50")
    );

    CarrierCostProfileEntity entity = CarrierCostProfileEntity.fromDomain(domain);
    CarrierCostProfileEntity saved = repository.save(entity);

    // Should find when active
    Optional<CarrierCostProfileEntity> foundActive =
        repository.findActiveProfile(TENANT_ID, TRUCKER_ID);
    assertThat(foundActive).isNotEmpty();
    assertThat(foundActive.get().getId()).isEqualTo(saved.getId());

    // Soft delete
    saved.setDeletedAt(OffsetDateTime.now(ZoneOffset.UTC));
    repository.save(saved);

    // Should not find when soft-deleted
    Optional<CarrierCostProfileEntity> notFound =
        repository.findActiveProfile(TENANT_ID, TRUCKER_ID);
    assertThat(notFound).isEmpty();
  }

  @Test
  void testFindByTenantIdAndTruckerId_RLS() {
    CarrierCostProfile domain = CarrierCostProfile.createNew(
        TENANT_ID,
        TRUCKER_ID,
        new BigDecimal("2500"),
        new BigDecimal("3.50"),
        new BigDecimal("6.5"),
        new BigDecimal("0.15"),
        10000,
        new BigDecimal("0.50")
    );

    CarrierCostProfileEntity entity = CarrierCostProfileEntity.fromDomain(domain);
    repository.save(entity);

    Optional<CarrierCostProfileEntity> found =
        repository.findByTenantIdAndTruckerId(TENANT_ID, TRUCKER_ID);
    assertThat(found).isNotEmpty();
    assertThat(found.get().getTenantId()).isEqualTo(TENANT_ID);
  }

  @Test
  void testTenantIsolation_SeparateTruckersPerTenant() {
    String tenant1 = "tenant-1";
    String tenant2 = "tenant-2";
    String trucker1 = "trucker-1";

    // Create profile for tenant1
    TenantContextHolder.setTenantId(tenant1);
    CarrierCostProfile domain1 = CarrierCostProfile.createNew(
        tenant1,
        trucker1,
        new BigDecimal("3000"),
        new BigDecimal("3.75"),
        new BigDecimal("7.0"),
        new BigDecimal("0.12"),
        12000,
        new BigDecimal("0.60")
    );
    CarrierCostProfileEntity entity1 = CarrierCostProfileEntity.fromDomain(domain1);
    CarrierCostProfileEntity saved1 = repository.saveAndFlush(entity1);

    // Create profile for tenant2 (same trucker)
    TenantContextHolder.setTenantId(tenant2);
    CarrierCostProfile domain2 = CarrierCostProfile.createNew(
        tenant2,
        trucker1,
        new BigDecimal("2200"),
        new BigDecimal("3.25"),
        new BigDecimal("5.5"),
        new BigDecimal("0.20"),
        8000,
        new BigDecimal("0.40")
    );
    CarrierCostProfileEntity entity2 = CarrierCostProfileEntity.fromDomain(domain2);
    CarrierCostProfileEntity saved2 = repository.save(entity2);

    // Verify tenant1 sees only its profile
    TenantContextHolder.setTenantId(tenant1);
    Optional<CarrierCostProfileEntity> found1 =
        repository.findByTenantIdAndTruckerId(tenant1, trucker1);
    assertThat(found1).isNotEmpty();
    assertThat(found1.get().getId()).isEqualTo(saved1.getId());
    assertThat(found1.get().getMonthlyFixedCosts()).isEqualTo(new BigDecimal("3000"));

    // Verify tenant2 sees only its profile
    TenantContextHolder.setTenantId(tenant2);
    Optional<CarrierCostProfileEntity> found2 =
        repository.findByTenantIdAndTruckerId(tenant2, trucker1);
    assertThat(found2).isNotEmpty();
    assertThat(found2.get().getId()).isEqualTo(saved2.getId());
    assertThat(found2.get().getMonthlyFixedCosts()).isEqualTo(new BigDecimal("2200"));
  }

  @Test
  void testUpdateCostProfile() {
    CarrierCostProfile domain = CarrierCostProfile.createNew(
        TENANT_ID,
        TRUCKER_ID,
        new BigDecimal("2500"),
        new BigDecimal("3.50"),
        new BigDecimal("6.5"),
        new BigDecimal("0.15"),
        10000,
        new BigDecimal("0.50")
    );

    CarrierCostProfileEntity entity = CarrierCostProfileEntity.fromDomain(domain);
    entity = repository.save(entity);

    OffsetDateTime beforeUpdate = entity.getUpdatedAt();

    domain.update(
        new BigDecimal("3000"),       // increased fixed costs
        new BigDecimal("3.75"),
        new BigDecimal("7.0"),
        new BigDecimal("0.12"),
        12000,
        new BigDecimal("0.60")
    );

    entity = CarrierCostProfileEntity.fromDomain(domain);
    entity = repository.save(entity);

    assertThat(entity.getMonthlyFixedCosts()).isEqualTo(new BigDecimal("3000"));
    assertThat(entity.getUpdatedAt()).isAfter(beforeUpdate);
  }

  @Test
  void testFindAllActiveByTenant() {
    CarrierCostProfile domain1 = CarrierCostProfile.createNew(
        TENANT_ID,
        "trucker-1",
        new BigDecimal("2500"),
        new BigDecimal("3.50"),
        new BigDecimal("6.5"),
        new BigDecimal("0.15"),
        10000,
        new BigDecimal("0.50")
    );

    CarrierCostProfile domain2 = CarrierCostProfile.createNew(
        TENANT_ID,
        "trucker-2",
        new BigDecimal("3000"),
        new BigDecimal("3.75"),
        new BigDecimal("7.0"),
        new BigDecimal("0.12"),
        12000,
        new BigDecimal("0.60")
    );

    repository.save(CarrierCostProfileEntity.fromDomain(domain1));
    repository.save(CarrierCostProfileEntity.fromDomain(domain2));

    var allActive = repository.findAllActiveByTenantId(TENANT_ID);
    assertThat(allActive).hasSize(2);
  }
}
