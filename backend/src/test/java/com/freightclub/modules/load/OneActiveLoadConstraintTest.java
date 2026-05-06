package com.freightclub.modules.load;

import static org.assertj.core.api.Assertions.*;

import com.freightclub.domain.Tenant;
import com.freightclub.domain.User;
import com.freightclub.domain.UserRole;
import com.freightclub.modules.load.application.LoadApplicationService;
import com.freightclub.modules.load.application.OneActiveLoadException;
import com.freightclub.modules.load.domain.LoadAggregate;
import com.freightclub.modules.load.domain.LoadStatus;
import com.freightclub.modules.load.domain.Weight;
import com.freightclub.modules.load.infrastructure.persistence.jpa.LoadEntity;
import com.freightclub.modules.load.infrastructure.persistence.jpa.SpringDataLoadRepository;
import com.freightclub.repository.TenantRepository;
import com.freightclub.repository.UserRepository;
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

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class OneActiveLoadConstraintTest {

  private static final String TENANT_ID = "test-tenant-one-active";
  private static final String TRUCKER_ID = "trucker-one-active";
  private static final String SHIPPER_ID = "shipper-one-active";

  @Autowired private LoadApplicationService loadService;
  @Autowired private SpringDataLoadRepository loadRepository;
  @Autowired private TenantRepository tenantRepository;
  @Autowired private UserRepository userRepository;

  @BeforeEach
  void setup() {
    TenantContextHolder.setTenantId(TENANT_ID);
    ensureTenantsAndUsersExist();
  }

  private void ensureTenantsAndUsersExist() {
    // Create tenant
    createTenantIfMissing(TENANT_ID, "One Active Load Test Tenant");

    // Create shipper and trucker users
    createUserIfMissing(SHIPPER_ID, "shipper@test.com", UserRole.SHIPPER, TENANT_ID);
    createUserIfMissing(TRUCKER_ID, "trucker@test.com", UserRole.TRUCKER, TENANT_ID);
  }

  private void createTenantIfMissing(String tenantId, String name) {
    if (!tenantRepository.findById(tenantId).isPresent()) {
      Tenant tenant = new Tenant();
      tenant.setId(tenantId);
      tenant.setName(name);
      tenantRepository.save(tenant);
    }
  }

  private void createUserIfMissing(String userId, String email, UserRole role, String tenantId) {
    if (!userRepository.findById(userId).isPresent()) {
      User user = new User(userId);
      user.setTenantId(tenantId);
      user.setEmail(email);
      user.setPasswordHash("$2a$10$testpassword");
      user.setRole(role);
      user.setFirstName("Test");
      user.setLastName("User");
      userRepository.save(user);
    }
  }

  @AfterEach
  void cleanup() {
    TenantContextHolder.clear();
  }

  private LoadEntity makeLoadEntity(String id, BigDecimal weight) {
    LoadEntity entity = new LoadEntity();
    entity.setId(id);
    entity.setTenantId(TENANT_ID);
    entity.setShipperId(SHIPPER_ID);
    entity.setWeightLbs(weight);
    entity.setStatus(LoadStatus.PUBLISHED);
    entity.setOriginCity("Dallas");
    entity.setOriginState("TX");
    entity.setOriginZip("75001");
    entity.setOriginAddress1("123 Main St");
    entity.setDestinationCity("Houston");
    entity.setDestState("TX");
    entity.setDestinationZip("77001");
    entity.setDestinationAddress1("456 Main St");
    entity.setEquipmentType(com.freightclub.domain.EquipmentType.DRY_VAN);
    entity.setPayRate(BigDecimal.valueOf(2500));
    entity.setPayRateType(com.freightclub.modules.load.domain.PayRateType.PER_MILE);
    entity.setCommodity("General Freight");
    OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
    entity.setPickupFrom(now);
    entity.setPickupTo(now.plusHours(2));
    entity.setDeliveryFrom(now.plusDays(1));
    entity.setDeliveryTo(now.plusDays(2));
    return entity;
  }

  @Test
  void testClaimLoad_FirstLoadAllowed() {
    LoadAggregate load = LoadAggregate.create(TENANT_ID, SHIPPER_ID, new Weight(new BigDecimal("5000")));
    LoadEntity saved = loadRepository.save(makeLoadEntity(load.getId(), load.getWeight().lbs()));

    assertThatCode(() -> loadService.claim(saved.getId(), TRUCKER_ID))
        .doesNotThrowAnyException();

    LoadEntity claimed = loadRepository.findById(saved.getId()).orElseThrow();
    assertThat(claimed.getStatus()).isEqualTo(LoadStatus.CLAIMED);
    assertThat(claimed.getTruckerId()).isEqualTo(TRUCKER_ID);
  }

  @Test
  void testClaimLoad_SecondLoadRejected_WhenFirstIsClaimed() {
    LoadAggregate load1 = LoadAggregate.create(TENANT_ID, SHIPPER_ID, new Weight(new BigDecimal("5000")));
    LoadEntity saved1 = loadRepository.save(makeLoadEntity(load1.getId(), load1.getWeight().lbs()));

    LoadAggregate load2 = LoadAggregate.create(TENANT_ID, SHIPPER_ID, new Weight(new BigDecimal("8000")));
    LoadEntity saved2 = loadRepository.save(makeLoadEntity(load2.getId(), load2.getWeight().lbs()));

    // Claim first load
    loadService.claim(saved1.getId(), TRUCKER_ID);
    LoadEntity claimed1 = loadRepository.findById(saved1.getId()).orElseThrow();
    assertThat(claimed1.getStatus()).isEqualTo(LoadStatus.CLAIMED);

    // Attempt to claim second load should fail
    assertThatThrownBy(() -> loadService.claim(saved2.getId(), TRUCKER_ID))
        .isInstanceOf(OneActiveLoadException.class)
        .hasMessageContaining("Owner/operator can only have 1 active load");
  }

  @Test
  void testClaimLoad_SecondLoadAllowedAfterDelivery() {
    LoadAggregate load1 = LoadAggregate.create(TENANT_ID, SHIPPER_ID, new Weight(new BigDecimal("5000")));
    LoadEntity saved1 = loadRepository.save(makeLoadEntity(load1.getId(), load1.getWeight().lbs()));

    LoadAggregate load2 = LoadAggregate.create(TENANT_ID, SHIPPER_ID, new Weight(new BigDecimal("8000")));
    LoadEntity saved2 = loadRepository.save(makeLoadEntity(load2.getId(), load2.getWeight().lbs()));

    // Claim first load
    loadService.claim(saved1.getId(), TRUCKER_ID);

    // Complete first load (deliver)
    LoadEntity claimed1 = loadRepository.findById(saved1.getId()).orElseThrow();
    claimed1.setStatus(LoadStatus.DELIVERED);
    loadRepository.save(claimed1);

    // Now claiming second load should succeed
    assertThatCode(() -> loadService.claim(saved2.getId(), TRUCKER_ID))
        .doesNotThrowAnyException();

    LoadEntity claimed2 = loadRepository.findById(saved2.getId()).orElseThrow();
    assertThat(claimed2.getStatus()).isEqualTo(LoadStatus.CLAIMED);
    assertThat(claimed2.getTruckerId()).isEqualTo(TRUCKER_ID);
  }

  @Test
  void testClaimLoad_SecondLoadAllowedAfterSoftDelete() {
    LoadAggregate load1 = LoadAggregate.create(TENANT_ID, SHIPPER_ID, new Weight(new BigDecimal("5000")));
    LoadEntity saved1 = loadRepository.save(makeLoadEntity(load1.getId(), load1.getWeight().lbs()));

    LoadAggregate load2 = LoadAggregate.create(TENANT_ID, SHIPPER_ID, new Weight(new BigDecimal("8000")));
    LoadEntity saved2 = loadRepository.save(makeLoadEntity(load2.getId(), load2.getWeight().lbs()));

    // Claim first load
    loadService.claim(saved1.getId(), TRUCKER_ID);

    // Cancel first load (soft delete)
    LoadEntity claimed1 = loadRepository.findById(saved1.getId()).orElseThrow();
    claimed1.setDeletedAt(OffsetDateTime.now(ZoneOffset.UTC));
    loadRepository.save(claimed1);

    // Now claiming second load should succeed (deleted loads don't count)
    assertThatCode(() -> loadService.claim(saved2.getId(), TRUCKER_ID))
        .doesNotThrowAnyException();

    LoadEntity claimed2 = loadRepository.findById(saved2.getId()).orElseThrow();
    assertThat(claimed2.getStatus()).isEqualTo(LoadStatus.CLAIMED);
    assertThat(claimed2.getTruckerId()).isEqualTo(TRUCKER_ID);
  }

  @Test
  void testClaimLoad_TenantIsolation_DifferentTruckersCanClaimConcurrently() {
    String trucker1 = "trucker-1";
    String trucker2 = "trucker-2";

    LoadAggregate load1 = LoadAggregate.create(TENANT_ID, SHIPPER_ID, new Weight(new BigDecimal("5000")));
    LoadEntity saved1 = loadRepository.save(makeLoadEntity(load1.getId(), load1.getWeight().lbs()));

    LoadAggregate load2 = LoadAggregate.create(TENANT_ID, SHIPPER_ID, new Weight(new BigDecimal("8000")));
    LoadEntity saved2 = loadRepository.save(makeLoadEntity(load2.getId(), load2.getWeight().lbs()));

    // Different truckers can each have 1 active load
    loadService.claim(saved1.getId(), trucker1);
    loadService.claim(saved2.getId(), trucker2);

    LoadEntity claimed1 = loadRepository.findById(saved1.getId()).orElseThrow();
    LoadEntity claimed2 = loadRepository.findById(saved2.getId()).orElseThrow();

    assertThat(claimed1.getTruckerId()).isEqualTo(trucker1);
    assertThat(claimed2.getTruckerId()).isEqualTo(trucker2);
  }
}
