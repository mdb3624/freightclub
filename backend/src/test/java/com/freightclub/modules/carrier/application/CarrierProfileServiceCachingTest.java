package com.freightclub.modules.carrier.application;

import com.freightclub.domain.Tenant;
import com.freightclub.domain.User;
import com.freightclub.domain.UserRole;
import com.freightclub.modules.carrier.domain.*;
import com.freightclub.modules.carrier.infrastructure.*;
import com.freightclub.repository.TenantRepository;
import com.freightclub.repository.UserRepository;
import com.freightclub.security.TenantContextHolder;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cache.CacheManager;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CarrierProfileServiceCachingTest {

    @Autowired
    private CarrierProfileService service;

    @Autowired
    private CarrierEquipmentRepository equipmentRepository;

    @Autowired
    private CacheManager cacheManager;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    private String tenantId = "tenant-test";
    private String truckerId = "trucker-1";

    @BeforeEach
    void setUp() {
        TenantContextHolder.setTenantId(tenantId);
        cacheManager.getCache("carrierEquipment").clear();
        cacheManager.getCache("carrierLanes").clear();
        cacheManager.getCache("carrierAvailability").clear();
        ensureTenantsAndUsersExist();
    }

    @AfterEach
    void tearDown() {
        TenantContextHolder.clear();
    }

    private void ensureTenantsAndUsersExist() {
        if (!tenantRepository.findById(tenantId).isPresent()) {
            Tenant tenant = new Tenant();
            tenant.setId(tenantId);
            tenant.setName("Test Tenant");
            tenantRepository.save(tenant);
        }
        if (!userRepository.findById(truckerId).isPresent()) {
            User user = new User(truckerId);
            user.setTenantId(tenantId);
            user.setEmail("trucker@test.com");
            user.setPasswordHash("$2a$10$testpassword");
            user.setRole(UserRole.TRUCKER);
            user.setFirstName("Test");
            user.setLastName("Trucker");
            userRepository.save(user);
        }
    }

    @Test
    void getEquipment_cachedOnSecondCall() {
        // Pre-create equipment (AC-1)
        CarrierEquipmentDTO dto = new CarrierEquipmentDTO(
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
        service.addEquipment(truckerId, dto);

        // First call - should hit DB
        var result1 = service.getEquipment(truckerId);

        // Second call - should hit cache
        var result2 = service.getEquipment(truckerId);

        assertEquals(result1.size(), result2.size());
        assertNotNull(cacheManager.getCache("carrierEquipment").get(truckerId + ":" + tenantId));
    }

    @Test
    void addEquipment_evictsCacheImmediately() {
        // Pre-create equipment
        CarrierEquipmentDTO dto1 = new CarrierEquipmentDTO(
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
        service.addEquipment(truckerId, dto1);

        // Pre-populate cache
        service.getEquipment(truckerId);
        assertNotNull(cacheManager.getCache("carrierEquipment").get(truckerId + ":" + tenantId));

        // Add another equipment - should evict cache
        CarrierEquipmentDTO dto2 = new CarrierEquipmentDTO(
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
        service.addEquipment(truckerId, dto2);

        // Cache should be evicted
        assertNull(cacheManager.getCache("carrierEquipment").get(truckerId + ":" + tenantId));
    }

    @Test
    void multiTenantCacheIsolation() {
        String trucker2 = "trucker-2";
        String tenantB = "tenant-b";

        // Create second tenant and user
        if (!tenantRepository.findById(tenantB).isPresent()) {
            Tenant tenant = new Tenant();
            tenant.setId(tenantB);
            tenant.setName("Test Tenant B");
            tenantRepository.save(tenant);
        }
        if (!userRepository.findById(trucker2).isPresent()) {
            User user = new User(trucker2);
            user.setTenantId(tenantB);
            user.setEmail("trucker2@test.com");
            user.setPasswordHash("$2a$10$testpassword");
            user.setRole(UserRole.TRUCKER);
            user.setFirstName("Test");
            user.setLastName("Trucker2");
            userRepository.save(user);
        }

        // Create equipment in tenant-a
        CarrierEquipmentDTO dto1 = new CarrierEquipmentDTO(
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
        service.addEquipment(truckerId, dto1);
        service.getEquipment(truckerId);

        // Create equipment in tenant-b
        TenantContextHolder.setTenantId(tenantB);
        CarrierEquipmentDTO dto2 = new CarrierEquipmentDTO(
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
        service.addEquipment(trucker2, dto2);
        service.getEquipment(trucker2);

        // Both should have different cache keys including tenant ID
        var cacheA = cacheManager.getCache("carrierEquipment").get(truckerId + ":" + tenantId);
        var cacheB = cacheManager.getCache("carrierEquipment").get(trucker2 + ":" + tenantB);

        assertNotNull(cacheA);
        assertNotNull(cacheB);
    }

    @Test
    void deleteEquipment_evictsCacheAndRelatedCaches() {
        // Pre-create equipment
        CarrierEquipmentDTO dto = new CarrierEquipmentDTO(
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
        service.addEquipment(truckerId, dto);

        // Pre-populate caches
        service.getEquipment(truckerId);
        assertNotNull(cacheManager.getCache("carrierEquipment").get(truckerId + ":" + tenantId));

        // Delete should evict equipment cache
        var equipment = equipmentRepository.findByTenantIdAndTruckerIdAndDeletedAtIsNull(tenantId, truckerId);
        if (!equipment.isEmpty()) {
            service.deleteEquipment(truckerId, equipment.get(0).getId());

            // Cache should be evicted
            assertNull(cacheManager.getCache("carrierEquipment").get(truckerId + ":" + tenantId));
        }
    }
}
