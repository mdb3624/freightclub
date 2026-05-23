package com.freightclub.api.security;

import com.freightclub.domain.*;
import com.freightclub.modules.carrier.domain.CarrierEquipment;
import com.freightclub.modules.carrier.domain.CarrierLane;
import com.freightclub.modules.carrier.infrastructure.CarrierEquipmentEntity;
import com.freightclub.modules.carrier.infrastructure.CarrierEquipmentRepository;
import com.freightclub.modules.carrier.infrastructure.CarrierLaneEntity;
import com.freightclub.modules.carrier.infrastructure.CarrierLaneRepository;
import com.freightclub.modules.carrier.application.CarrierProfileService;
import com.freightclub.repository.LoadRepository;
import com.freightclub.repository.UserRepository;
import com.freightclub.security.TenantContextHolder;
import com.freightclub.service.LoadService;
import com.freightclub.service.ProfileService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

/**
 * SEC-001-AC-001: Authorization gates on DELETE/PUT endpoints.
 * Verify that @PreAuthorize annotations with service-layer isOwner() checks
 * block unauthorized users from modifying other tenants' resources.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AuthorizationGateTest {

    @Autowired
    private LoadRepository loadRepository;

    @Autowired
    private LoadService loadService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileService profileService;

    @Autowired
    private CarrierProfileService carrierProfileService;

    @Autowired
    private CarrierEquipmentRepository carrierEquipmentRepository;

    @Autowired
    private CarrierLaneRepository carrierLaneRepository;

    private static final String TENANT_A = "00000000-0000-0000-0000-000000000001";
    private static final String TENANT_B = "00000000-0000-0000-0000-000000000002";
    private static final String SHIPPER_A = "11111111-1111-1111-1111-111111111111";
    private static final String SHIPPER_B = "22222222-2222-2222-2222-222222222222";

    private Load createTestLoad(String tenantId, String shipperId) {
        Load load = new Load();
        load.setTenantId(tenantId);
        load.setShipperId(shipperId);
        load.setStatus(LoadStatus.DRAFT);
        load.setOriginCity("Chicago");
        load.setOriginState("IL");
        load.setOriginZip("60601");
        load.setOriginAddress1("123 Main St");
        load.setDestinationCity("Los Angeles");
        load.setDestinationState("CA");
        load.setDestinationZip("90001");
        load.setDestinationAddress1("456 Oak Ave");
        load.setEquipmentType(EquipmentType.DRY_VAN);
        load.setCommodity("General Freight");
        load.setWeightLbs(new BigDecimal("5000"));
        load.setPayRate(new BigDecimal("0.50"));
        load.setPayRateType(PayRateType.PER_MILE);
        LocalDateTime now = LocalDateTime.now();
        load.setPickupFrom(now);
        load.setPickupTo(now.plusHours(2));
        load.setDeliveryFrom(now.plusDays(1));
        load.setDeliveryTo(now.plusDays(2));
        return load;
    }

    private User createTestUser(String userId, String tenantId, String email) {
        User user = new User(userId);
        user.setTenantId(tenantId);
        user.setEmail(email);
        user.setFirstName("Test");
        user.setLastName("User");
        user.setRole(UserRole.SHIPPER);
        user.setPasswordHash("hashed-password");
        return user;
    }

    private CarrierEquipmentEntity createTestEquipment(String tenantId, String truckerId) {
        CarrierEquipment domain = CarrierEquipment.createNew(
            com.freightclub.modules.carrier.domain.EquipmentType.DRY_VAN,
            50, 10, 10, 45000L,
            com.freightclub.modules.carrier.domain.EquipmentCondition.GOOD,
            "2020", tenantId, truckerId
        );
        return CarrierEquipmentEntity.fromDomain(domain);
    }

    private CarrierLaneEntity createTestLane(String tenantId, String truckerId) {
        CarrierLane domain = CarrierLane.createNew(
            tenantId, truckerId,
            "MIDWEST", "SOUTHEAST", 25000L,
            com.freightclub.modules.carrier.domain.FrequencyPreference.WEEKLY
        );
        return CarrierLaneEntity.fromDomain(domain);
    }

    @BeforeEach
    void setUp() {
        TenantContextHolder.setTenantId(TENANT_A);
    }

    @AfterEach
    void tearDown() {
        TenantContextHolder.clear();
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // SEC-001-AC-002-TEST-1: isOwner() returns false for cross-tenant load
    // ═════════════════════════════════════════════════════════════════════════════
    @Test
    void testIsOwnerReturnsFalseForCrossTenantLoad() {
        // Setup: Create load owned by Tenant A
        TenantContextHolder.setTenantId(TENANT_A);
        Load load = createTestLoad(TENANT_A, SHIPPER_A);
        Load savedLoad = loadRepository.save(load);

        // Act: Check ownership as Tenant B
        TenantContextHolder.setTenantId(TENANT_B);
        boolean isOwner = loadService.isOwner(savedLoad.getId());

        // Assert: Tenant B should NOT own Tenant A's load
        assertFalse(isOwner, "isOwner() should return false for cross-tenant load");
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // SEC-001-AC-002-TEST-2: isOwner() returns true for same-tenant load
    // ═════════════════════════════════════════════════════════════════════════════
    @Test
    void testIsOwnerReturnsTrueForSameTenantLoad() {
        // Setup: Create load owned by Tenant A
        TenantContextHolder.setTenantId(TENANT_A);
        Load load = createTestLoad(TENANT_A, SHIPPER_A);
        Load savedLoad = loadRepository.save(load);

        // Act: Check ownership as Tenant A (owner)
        boolean isOwner = loadService.isOwner(savedLoad.getId());

        // Assert: Tenant A SHOULD own Tenant A's load
        assertTrue(isOwner, "isOwner() should return true for same-tenant load");
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // SEC-001-AC-003: Service-layer isOwner() respects tenant isolation
    // ═════════════════════════════════════════════════════════════════════════════
    @Test
    void testIsOwnerMethodEnforcesTenantIsolation() {
        // Setup: Create two loads, one per tenant
        TenantContextHolder.setTenantId(TENANT_A);
        Load loadA = createTestLoad(TENANT_A, SHIPPER_A);
        Load savedLoadA = loadRepository.save(loadA);

        TenantContextHolder.setTenantId(TENANT_B);
        Load loadB = createTestLoad(TENANT_B, SHIPPER_B);
        Load savedLoadB = loadRepository.save(loadB);

        // Act & Assert: Verify tenant isolation enforcement
        TenantContextHolder.setTenantId(TENANT_A);
        assertTrue(loadService.isOwner(savedLoadA.getId()),
            "Tenant A should own loadA");
        assertFalse(loadService.isOwner(savedLoadB.getId()),
            "Tenant A should NOT own loadB");

        TenantContextHolder.setTenantId(TENANT_B);
        assertTrue(loadService.isOwner(savedLoadB.getId()),
            "Tenant B should own loadB");
        assertFalse(loadService.isOwner(savedLoadA.getId()),
            "Tenant B should NOT own loadA");
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // SEC-001-AC-001: isOwner() blocks access to non-existent load
    // ═════════════════════════════════════════════════════════════════════════════
    @Test
    void testIsOwnerReturnsFalseForNonExistentLoad() {
        // Act: Check ownership of non-existent load
        TenantContextHolder.setTenantId(TENANT_A);
        boolean isOwner = loadService.isOwner("non-existent-load-id");

        // Assert: Should return false for non-existent resource
        assertFalse(isOwner, "isOwner() should return false for non-existent load");
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // SEC-001-AC-003: ProfileService.isOwner() enforces tenant isolation
    // ═════════════════════════════════════════════════════════════════════════════
    @Test
    void testProfileServiceIsOwnerEnforcesTenantIsolation() {
        // Setup: Create users in different tenants
        TenantContextHolder.setTenantId(TENANT_A);
        User userA = createTestUser(SHIPPER_A, TENANT_A, "user.a@test.com");
        User savedUserA = userRepository.save(userA);

        TenantContextHolder.setTenantId(TENANT_B);
        User userB = createTestUser(SHIPPER_B, TENANT_B, "user.b@test.com");
        User savedUserB = userRepository.save(userB);

        // Act & Assert: Verify tenant isolation for ProfileService.isOwner()
        TenantContextHolder.setTenantId(TENANT_A);
        assertTrue(profileService.isOwner(savedUserA.getId()),
            "Tenant A should own userA");
        assertFalse(profileService.isOwner(savedUserB.getId()),
            "Tenant A should NOT own userB");

        TenantContextHolder.setTenantId(TENANT_B);
        assertTrue(profileService.isOwner(savedUserB.getId()),
            "Tenant B should own userB");
        assertFalse(profileService.isOwner(savedUserA.getId()),
            "Tenant B should NOT own userA");
    }

    @Test
    void testProfileServiceIsOwnerReturnsFalseForNonExistentUser() {
        TenantContextHolder.setTenantId(TENANT_A);
        boolean isOwner = profileService.isOwner("non-existent-user-id");
        assertFalse(isOwner, "isOwner() should return false for non-existent user");
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // SEC-001-AC-003: CarrierProfileService.isEquipmentOwner() enforces isolation
    // ═════════════════════════════════════════════════════════════════════════════
    @Test
    void testCarrierEquipmentIsOwnerEnforcesTenantIsolation() {
        // Setup: Create equipment in different tenants
        TenantContextHolder.setTenantId(TENANT_A);
        CarrierEquipmentEntity equipmentA = createTestEquipment(TENANT_A, SHIPPER_A);
        CarrierEquipmentEntity savedEquipmentA = carrierEquipmentRepository.save(equipmentA);

        TenantContextHolder.setTenantId(TENANT_B);
        CarrierEquipmentEntity equipmentB = createTestEquipment(TENANT_B, SHIPPER_B);
        CarrierEquipmentEntity savedEquipmentB = carrierEquipmentRepository.save(equipmentB);

        // Act & Assert: Verify tenant isolation
        TenantContextHolder.setTenantId(TENANT_A);
        assertTrue(carrierProfileService.isEquipmentOwner(savedEquipmentA.getId()),
            "Tenant A should own equipmentA");
        assertFalse(carrierProfileService.isEquipmentOwner(savedEquipmentB.getId()),
            "Tenant A should NOT own equipmentB");

        TenantContextHolder.setTenantId(TENANT_B);
        assertTrue(carrierProfileService.isEquipmentOwner(savedEquipmentB.getId()),
            "Tenant B should own equipmentB");
        assertFalse(carrierProfileService.isEquipmentOwner(savedEquipmentA.getId()),
            "Tenant B should NOT own equipmentA");
    }

    @Test
    void testCarrierEquipmentIsOwnerReturnsFalseForNonExistent() {
        TenantContextHolder.setTenantId(TENANT_A);
        boolean isOwner = carrierProfileService.isEquipmentOwner("non-existent-equipment-id");
        assertFalse(isOwner, "isEquipmentOwner() should return false for non-existent equipment");
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // SEC-001-AC-003: CarrierProfileService.isLaneOwner() enforces isolation
    // ═════════════════════════════════════════════════════════════════════════════
    @Test
    void testCarrierLaneIsOwnerEnforcesTenantIsolation() {
        // Setup: Create lanes in different tenants
        TenantContextHolder.setTenantId(TENANT_A);
        CarrierLaneEntity laneA = createTestLane(TENANT_A, SHIPPER_A);
        CarrierLaneEntity savedLaneA = carrierLaneRepository.save(laneA);

        TenantContextHolder.setTenantId(TENANT_B);
        CarrierLaneEntity laneB = createTestLane(TENANT_B, SHIPPER_B);
        CarrierLaneEntity savedLaneB = carrierLaneRepository.save(laneB);

        // Act & Assert: Verify tenant isolation
        TenantContextHolder.setTenantId(TENANT_A);
        assertTrue(carrierProfileService.isLaneOwner(savedLaneA.getId()),
            "Tenant A should own laneA");
        assertFalse(carrierProfileService.isLaneOwner(savedLaneB.getId()),
            "Tenant A should NOT own laneB");

        TenantContextHolder.setTenantId(TENANT_B);
        assertTrue(carrierProfileService.isLaneOwner(savedLaneB.getId()),
            "Tenant B should own laneB");
        assertFalse(carrierProfileService.isLaneOwner(savedLaneA.getId()),
            "Tenant B should NOT own laneA");
    }

    @Test
    void testCarrierLaneIsOwnerReturnsFalseForNonExistent() {
        TenantContextHolder.setTenantId(TENANT_A);
        boolean isOwner = carrierProfileService.isLaneOwner("non-existent-lane-id");
        assertFalse(isOwner, "isLaneOwner() should return false for non-existent lane");
    }
}
