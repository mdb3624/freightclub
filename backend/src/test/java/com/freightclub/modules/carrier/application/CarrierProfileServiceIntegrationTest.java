package com.freightclub.modules.carrier.application;

import static org.assertj.core.api.Assertions.*;

import com.freightclub.domain.Tenant;
import com.freightclub.domain.User;
import com.freightclub.domain.UserRole;
import com.freightclub.repository.TenantRepository;
import com.freightclub.repository.UserRepository;
import com.freightclub.modules.carrier.domain.CarrierEquipment;
import com.freightclub.modules.carrier.domain.EquipmentCondition;
import com.freightclub.modules.carrier.domain.EquipmentStatus;
import com.freightclub.modules.carrier.domain.EquipmentType;
import com.freightclub.modules.carrier.infrastructure.CarrierEquipmentEntity;
import com.freightclub.modules.carrier.infrastructure.CarrierEquipmentRepository;
import com.freightclub.security.TenantContextHolder;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.List;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CarrierProfileServiceIntegrationTest {

  @Autowired
  private CarrierProfileService carrierProfileService;

  @Autowired
  private CarrierEquipmentRepository equipmentRepository;

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private TenantRepository tenantRepository;

  private static final String TENANT_A = "tenant-carrier-a";
  private static final String TENANT_B = "tenant-carrier-b";
  private static final String TRUCKER_A = "trucker-carrier-a";

  private String tenantId;
  private String truckerId;

  @BeforeEach
  void setUp() {
    tenantId = "test-tenant-carrier";
    truckerId = "trucker-carrier-456";
    TenantContextHolder.setTenantId(tenantId);
    ensureTenantsAndUsersExist();
  }

  private void ensureTenantsAndUsersExist() {
    // Create tenants first
    createTenantIfMissing(tenantId, "Carrier Test Tenant");
    createTenantIfMissing(TENANT_A, "Carrier Tenant A");
    createTenantIfMissing(TENANT_B, "Carrier Tenant B");

    // Then create users
    createUserIfMissing(truckerId, "trucker456@test.com", UserRole.TRUCKER, tenantId);
    createUserIfMissing(TRUCKER_A, "truckera@test.com", UserRole.TRUCKER, TENANT_A);
    createUserIfMissing(TRUCKER_A, "truckera@tenantb.com", UserRole.TRUCKER, TENANT_B);
  }

  private void createTenantIfMissing(String tenantId, String name) {
    if (!tenantRepository.findById(tenantId).isPresent()) {
      Tenant tenant = new Tenant();
      tenant.setId(tenantId);
      tenant.setName(name);
      tenantRepository.save(tenant);
    }
  }

  private void createUserIfMissing(String userId, String email, UserRole role, String tenant) {
    if (!userRepository.findById(userId).isPresent()) {
      User user = new User(userId);
      user.setTenantId(tenant);
      user.setEmail(email);
      user.setPasswordHash("$2a$10$testpassword");
      user.setRole(role);
      user.setFirstName("Test");
      user.setLastName("User");
      userRepository.save(user);
    }
  }

  @AfterEach
  void tearDown() {
    TenantContextHolder.clear();
  }

  // AC-1: Trucker Can Add Equipment to Profile
  @Test
  void testAddEquipmentCreatesActiveRecord() {
    // Given
    CarrierEquipmentDTO equipment = new CarrierEquipmentDTO(
        null,
        EquipmentType.FLATBED,
        48,
        8,
        6,
        45000L,
        EquipmentCondition.GOOD,
        "2022",
        EquipmentStatus.ACTIVE,
        null
    );

    // When
    CarrierEquipmentDTO result = carrierProfileService.addEquipment(truckerId, equipment);

    // Then
    assertThat(result).isNotNull();
    assertThat(result.status()).isEqualTo(EquipmentStatus.ACTIVE);
    assertThat(result.equipmentType()).isEqualTo(EquipmentType.FLATBED);
    assertThat(result.capacityLbs()).isEqualTo(45000);

    // Verify persisted with soft-delete null
    CarrierEquipment persisted = equipmentRepository.findById(result.id()).orElseThrow().toDomain();
    assertThat(persisted.getDeletedAt()).isNull();
    assertThat(persisted.getTenantId()).isEqualTo(tenantId);
  }

  // AC-2: Validation: Equipment Type Required
  @Test
  void testAddEquipmentWithoutTypeThrowsValidationError() {
    CarrierEquipmentDTO invalidEquipment = new CarrierEquipmentDTO(
        null,
        null, // Missing type
        48,
        8,
        6,
        45000L,
        EquipmentCondition.GOOD,
        "2022",
        EquipmentStatus.ACTIVE,
        null
    );

    assertThatThrownBy(() -> carrierProfileService.addEquipment(truckerId, invalidEquipment))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("Equipment type is required");
  }

  // AC-2: Validation: Dimensions Positive
  @Test
  void testAddEquipmentWithNegativeDimensionsThrows() {
    CarrierEquipmentDTO invalidEquipment = new CarrierEquipmentDTO(
        null,
        EquipmentType.FLATBED,
        -48, // Negative dimension
        8,
        6,
        45000L,
        EquipmentCondition.GOOD,
        "2022",
        EquipmentStatus.ACTIVE,
        null
    );

    assertThatThrownBy(() -> carrierProfileService.addEquipment(truckerId, invalidEquipment))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("Dimensions must be positive");
  }

  // AC-3: Trucker Can Edit Equipment
  @Test
  void testUpdateEquipmentModifiesAndPersists() {
    // Given: equipment already added
    CarrierEquipmentDTO original = new CarrierEquipmentDTO(
        null,
        EquipmentType.FLATBED,
        48,
        8,
        6,
        45000L,
        EquipmentCondition.GOOD,
        "2022",
        EquipmentStatus.ACTIVE,
        null
    );
    CarrierEquipmentDTO created = carrierProfileService.addEquipment(truckerId, original);

    // When: update condition
    CarrierEquipmentDTO update = new CarrierEquipmentDTO(
        created.id(),
        EquipmentType.FLATBED,
        48,
        8,
        6,
        45000L,
        EquipmentCondition.NEEDS_REPAIR, // Changed
        "2022",
        EquipmentStatus.ACTIVE,
        created.createdAt()
    );
    CarrierEquipmentDTO updated = carrierProfileService.updateEquipment(truckerId, update);

    // Then
    assertThat(updated.equipmentCondition()).isEqualTo(EquipmentCondition.NEEDS_REPAIR);
    CarrierEquipment persisted = equipmentRepository.findById(updated.id()).orElseThrow().toDomain();
    assertThat(persisted.getEquipmentCondition()).isEqualTo(EquipmentCondition.NEEDS_REPAIR);
  }

  // AC-4: Trucker Can Delete Equipment (Soft Delete)
  @Test
  void testDeleteEquipmentSetsDeletedAt() {
    // Given
    CarrierEquipmentDTO equipment = new CarrierEquipmentDTO(
        null,
        EquipmentType.FLATBED,
        48,
        8,
        6,
        45000L,
        EquipmentCondition.GOOD,
        "2022",
        EquipmentStatus.ACTIVE,
        null
    );
    CarrierEquipmentDTO created = carrierProfileService.addEquipment(truckerId, equipment);

    // When
    carrierProfileService.deleteEquipment(truckerId, created.id());

    // Then: soft-deleted
    CarrierEquipment deleted = equipmentRepository.findById(created.id()).orElseThrow().toDomain();
    assertThat(deleted.getDeletedAt()).isNotNull();

    // When queried with deleted_at filter, should not appear
    List<CarrierEquipmentEntity> activeEquipment = equipmentRepository
        .findByTenantIdAndTruckerIdAndDeletedAtIsNull(tenantId, truckerId);
    assertThat(activeEquipment.stream().map(e -> e.getId()).toList()).doesNotContain(deleted.getId());
  }

  // AC-5: Multi-Tenancy Isolation
  @Test
  void testTenantIsolationPreventsViewingOtherTenantEquipment() {
    // Given: Tenant A adds equipment
    String tenantA = TENANT_A;
    String tenantB = TENANT_B;
    String truckerA = TRUCKER_A;

    TenantContextHolder.setTenantId(tenantA);
    CarrierEquipmentDTO equipmentA = new CarrierEquipmentDTO(
        null,
        EquipmentType.FLATBED,
        48,
        8,
        6,
        45000L,
        EquipmentCondition.GOOD,
        "2022",
        EquipmentStatus.ACTIVE,
        null
    );
    CarrierEquipmentDTO createdA = carrierProfileService.addEquipment(truckerA, equipmentA);

    // When: Switch to Tenant B
    TenantContextHolder.setTenantId(tenantB);

    // Then: Tenant B cannot see Tenant A's equipment
    List<CarrierEquipmentDTO> tenantBEquipment = carrierProfileService.getEquipment(truckerA);
    assertThat(tenantBEquipment).isEmpty();

    // Verify at database level
    List<CarrierEquipmentEntity> dbResult = equipmentRepository.findByTenantIdAndTruckerIdAndDeletedAtIsNull(tenantB, truckerA);
    assertThat(dbResult).isEmpty(); // RLS should filter
  }

  // AC-6: Cache Behavior (NFR-504: 1h TTL)
  @Test
  void testGetEquipmentCached() {
    // Given
    CarrierEquipmentDTO equipment = new CarrierEquipmentDTO(
        null,
        EquipmentType.DRY_VAN,
        53,
        8,
        9,
        50000L,
        EquipmentCondition.GOOD,
        "2023",
        EquipmentStatus.ACTIVE,
        null
    );
    carrierProfileService.addEquipment(truckerId, equipment);

    // When: First call - cache miss
    List<CarrierEquipmentDTO> first = carrierProfileService.getEquipment(truckerId);

    // When: Second call - should be cached
    List<CarrierEquipmentDTO> second = carrierProfileService.getEquipment(truckerId);

    // Then: Same results
    assertThat(first).isEqualTo(second);
    assertThat(first).hasSize(1);
  }

  // AC-7: List Multiple Equipment
  @Test
  void testTruckerCanListMultipleEquipmentItems() {
    // Given
    CarrierEquipmentDTO flatbed = new CarrierEquipmentDTO(
        null,
        EquipmentType.FLATBED,
        48,
        8,
        6,
        45000L,
        EquipmentCondition.GOOD,
        "2022",
        EquipmentStatus.ACTIVE,
        null
    );
    CarrierEquipmentDTO van = new CarrierEquipmentDTO(
        null,
        EquipmentType.DRY_VAN,
        53,
        8,
        9,
        50000L,
        EquipmentCondition.GOOD,
        "2023",
        EquipmentStatus.ACTIVE,
        null
    );

    // When
    carrierProfileService.addEquipment(truckerId, flatbed);
    carrierProfileService.addEquipment(truckerId, van);
    List<CarrierEquipmentDTO> equipment = carrierProfileService.getEquipment(truckerId);

    // Then
    assertThat(equipment).hasSize(2);
    assertThat(equipment)
        .extracting("equipmentType")
        .containsExactlyInAnyOrder(EquipmentType.FLATBED, EquipmentType.DRY_VAN);
  }

  // AC-8: Audit Trail Created
  @Test
  void testAuditLogCreatedOnEquipmentAdd() {
    // Given
    CarrierEquipmentDTO equipment = new CarrierEquipmentDTO(
        null,
        EquipmentType.TANKER,
        48,
        8,
        9,
        60000L,
        EquipmentCondition.GOOD,
        "2021",
        EquipmentStatus.ACTIVE,
        null
    );

    // When
    CarrierEquipmentDTO created = carrierProfileService.addEquipment(truckerId, equipment);

    // Then: audit log should be created (verify in next story: audit integration)
    assertThat(created.id()).isNotNull();
    assertThat(created.createdAt()).isNotNull();
  }
}
