package com.freightclub.modules.recommendation.infrastructure;

import static org.junit.jupiter.api.Assertions.*;

import com.freightclub.domain.EquipmentType;
import com.freightclub.domain.User;
import com.freightclub.domain.UserRole;
import com.freightclub.modules.load.domain.LoadStatus;
import com.freightclub.modules.load.domain.PayRateType;
import com.freightclub.modules.load.infrastructure.persistence.jpa.LoadEntity;
import com.freightclub.modules.load.infrastructure.persistence.jpa.SpringDataLoadRepository;
import com.freightclub.modules.recommendation.domain.LoadRecommendation;
import com.freightclub.modules.recommendation.domain.MatchReason;
import com.freightclub.repository.UserRepository;
import com.freightclub.security.TenantContextHolder;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@DisplayName("LoadRecommendationRepository Integration Tests")
class LoadRecommendationRepositoryTest {

  @Autowired private LoadRecommendationRepository repository;
  @Autowired private SpringDataLoadRepository loadRepository;
  @Autowired private UserRepository userRepository;

  private String tenantId;
  private String loadId;
  private String truckerId;
  private static final String SHIPPER_ID = "shipper-rec-test";

  @BeforeEach
  void setUp() {
    tenantId = "test-tenant-123";
    loadId = "load-rec-test";
    truckerId = "trucker-rec-test";
    TenantContextHolder.setTenantId(tenantId);
    ensureFixturesExist();
  }

  private void ensureFixturesExist() {
    createUserIfMissing(SHIPPER_ID, "shipper@test.com", UserRole.SHIPPER, tenantId);
    createUserIfMissing(truckerId, "trucker@test.com", UserRole.TRUCKER, tenantId);
    createLoadIfMissing();
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

  private void createLoadIfMissing() {
    createLoadIfMissing(loadId);
  }

  private void createLoadIfMissing(String id) {
    if (!loadRepository.findById(id).isPresent()) {
      LoadEntity load = new LoadEntity();
      load.setId(id);
      load.setTenantId(tenantId);
      load.setShipperId(SHIPPER_ID);
      load.setStatus(LoadStatus.PUBLISHED);
      load.setEquipmentType(EquipmentType.FLATBED);
      load.setWeightLbs(BigDecimal.valueOf(1000));
      load.setOriginCity("Dallas");
      load.setOriginState("TX");
      load.setOriginZip("75001");
      load.setOriginAddress1("123 Main St");
      load.setDestinationCity("Houston");
      load.setDestState("TX");
      load.setDestinationZip("77001");
      load.setDestinationAddress1("456 Main St");
      load.setPayRate(BigDecimal.valueOf(2500));
      load.setPayRateType(PayRateType.PER_MILE);
      load.setCommodity("General Freight");
      OffsetDateTime now = OffsetDateTime.now();
      load.setPickupFrom(now);
      load.setPickupTo(now.plusHours(2));
      load.setDeliveryFrom(now.plusDays(1));
      load.setDeliveryTo(now.plusDays(2));
      loadRepository.save(load);
    }
  }

  @AfterEach
  void tearDown() {
    TenantContextHolder.clear();
  }

  @Test
  @DisplayName("should save and retrieve recommendation")
  void testSaveAndRetrieve() {
    LoadRecommendation domain = LoadRecommendation.createRecommendation(
        tenantId, loadId, truckerId, 150, new MatchReason(true, true, true, true));

    LoadRecommendationEntity entity = LoadRecommendationEntity.fromDomain(domain);
    LoadRecommendationEntity saved = repository.save(entity);

    Optional<LoadRecommendationEntity> retrieved =
        repository.findByTenantIdAndLoadIdAndTruckerIdAndDeletedAtIsNull(
            tenantId, loadId, truckerId);

    assertTrue(retrieved.isPresent());
    assertEquals(saved.getId(), retrieved.get().getId());
    assertEquals(150, retrieved.get().getMatchScore());
  }

  @Test
  @DisplayName("should enforce soft delete in queries")
  void testSoftDelete_EnforcedInQueries() {
    LoadRecommendation domain = LoadRecommendation.createRecommendation(
        tenantId, loadId, truckerId, 150, new MatchReason(true, true, true, true));

    LoadRecommendationEntity entity = LoadRecommendationEntity.fromDomain(domain);
    LoadRecommendationEntity saved = repository.save(entity);

    domain.softDelete();
    LoadRecommendationEntity deletedEntity = LoadRecommendationEntity.fromDomain(domain);
    deletedEntity.setId(saved.getId());
    repository.save(deletedEntity);

    Optional<LoadRecommendationEntity> retrieved =
        repository.findByTenantIdAndLoadIdAndTruckerIdAndDeletedAtIsNull(
            tenantId, loadId, truckerId);

    assertFalse(retrieved.isPresent());
  }

  @Test
  @DisplayName("should find recommendations by trucker")
  void testFindByTrucker() {
    String load1 = "load-rec-test-1";
    String load2 = "load-rec-test-2";
    createLoadIfMissing(load1);
    createLoadIfMissing(load2);

    LoadRecommendation rec1 = LoadRecommendation.createRecommendation(
        tenantId, load1, truckerId, 100,
        new MatchReason(true, false, false, false));
    LoadRecommendation rec2 = LoadRecommendation.createRecommendation(
        tenantId, load2, truckerId, 150,
        new MatchReason(true, true, true, true));

    repository.save(LoadRecommendationEntity.fromDomain(rec1));
    repository.save(LoadRecommendationEntity.fromDomain(rec2));

    List<LoadRecommendationEntity> results =
        repository.findByTenantIdAndTruckerIdAndDeletedAtIsNull(tenantId, truckerId);

    assertEquals(2, results.size());
  }

  @Test
  @DisplayName("should find recommendations by load")
  void testFindByLoad() {
    String trucker1 = "trucker-rec-test-1";
    String trucker2 = "trucker-rec-test-2";
    createUserIfMissing(trucker1, "trucker1@test.com", UserRole.TRUCKER, tenantId);
    createUserIfMissing(trucker2, "trucker2@test.com", UserRole.TRUCKER, tenantId);

    LoadRecommendation rec1 = LoadRecommendation.createRecommendation(
        tenantId, loadId, trucker1, 100,
        new MatchReason(true, false, false, false));
    LoadRecommendation rec2 = LoadRecommendation.createRecommendation(
        tenantId, loadId, trucker2, 150,
        new MatchReason(true, true, true, true));

    repository.save(LoadRecommendationEntity.fromDomain(rec1));
    repository.save(LoadRecommendationEntity.fromDomain(rec2));

    List<LoadRecommendationEntity> results =
        repository.findByTenantIdAndLoadIdAndDeletedAtIsNull(tenantId, loadId);

    assertEquals(2, results.size());
  }
}
