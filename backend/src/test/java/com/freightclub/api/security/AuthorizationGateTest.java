package com.freightclub.api.security;

import com.freightclub.domain.*;
import com.freightclub.repository.LoadRepository;
import com.freightclub.security.TenantContextHolder;
import com.freightclub.service.LoadService;
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
}
