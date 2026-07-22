package com.freightclub.modules.shipper.application;

import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ShipmentStatusServiceTest {

    @Autowired
    private ShipmentStatusService shipmentStatusService;

    @Autowired
    private EntityManager em;

    @AfterEach
    void tearDown() {
        com.freightclub.security.TenantContextHolder.clear();
    }

    @Test
    void testCalculateProgressOpen() {
        // Use reflection to call private method for testing
        BigDecimal progress = callCalculateProgress("OPEN", null, null, null);
        assertEquals(0, progress.intValue());
    }

    @Test
    void testCalculateProgressClaimed() {
        BigDecimal progress = callCalculateProgress("CLAIMED", null, null, null);
        assertEquals(15, progress.intValue());
    }

    @Test
    void testCalculateProgressDelivered() {
        BigDecimal progress = callCalculateProgress("DELIVERED", null, null, null);
        assertEquals(100, progress.intValue());
    }

    @Test
    void testGetActiveShipmentsReturnsEmptyListForNoData() {
        String tenantId = "test-tenant-" + System.nanoTime();

        List<ShipmentStatusDTO> shipments = shipmentStatusService.getActiveShipments(tenantId);

        assertNotNull(shipments);
        assertTrue(shipments.isEmpty());
    }

    // Bug: Action Zone "Find Carriers for This Load" always returned zero carriers because
    // ShipmentStatusDTO never carried the origin/destination STATE CODE that
    // CarrierSearchService.searchCarriersByLane() lane-matches against — only origin was
    // missing entirely, and "destination" was a city name ("Detroit"), not a state code ("MI").
    @Test
    void testGetActiveShipmentsIncludesOriginAndDestinationStateCodes() {
        String suffix = String.valueOf(System.nanoTime());
        String tenantId = "test-tenant-" + suffix;
        String shipperId = "test-shipper-" + suffix;
        String loadId = "test-load-" + suffix;

        // US-858: this test never bound tenant context at all — the users/loads INSERTs
        // below get rejected under real RLS with no app.current_tenant set. tenants_insert
        // allows WITH CHECK(true), so this first insert doesn't strictly need it, but binding
        // before all three keeps the fixture setup consistent and correct.
        com.freightclub.security.TenantContextHolder.setTenantId(tenantId);

        em.createNativeQuery(
            "INSERT INTO freightclub.tenants (id, name, plan) VALUES (:id, :name, 'FREE')"
        ).setParameter("id", tenantId).setParameter("name", "Test Tenant " + suffix).executeUpdate();

        em.createNativeQuery("""
            INSERT INTO freightclub.users (id, tenant_id, email, password_hash, role, first_name, last_name)
            VALUES (:id, :tenantId, :email, 'x', 'SHIPPER', 'Test', 'Shipper')
            """)
            .setParameter("id", shipperId)
            .setParameter("tenantId", tenantId)
            .setParameter("email", "shipper-" + suffix + "@test.local")
            .executeUpdate();

        em.createNativeQuery("""
            INSERT INTO freightclub.loads (
                id, tenant_id, shipper_id, status,
                origin_city, origin_state, origin_zip, origin_address_1,
                destination_city, destination_state, destination_zip, destination_address_1,
                pickup_from, pickup_to, delivery_from, delivery_to,
                commodity, weight_lbs, equipment_type, pay_rate, pay_rate_type
            ) VALUES (
                :loadId, :tenantId, :shipperId, 'OPEN',
                'Chicago', 'IL', '60601', '1 Test St',
                'Detroit', 'MI', '48201', '2 Test Ave',
                CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + interval '1 day',
                CURRENT_TIMESTAMP + interval '2 day', CURRENT_TIMESTAMP + interval '3 day',
                'Test Freight', 10000, 'DRY_VAN', 1500, 'FLAT_RATE'
            )
            """)
            .setParameter("loadId", loadId)
            .setParameter("tenantId", tenantId)
            .setParameter("shipperId", shipperId)
            .executeUpdate();

        List<ShipmentStatusDTO> shipments = shipmentStatusService.getActiveShipments(tenantId);

        assertEquals(1, shipments.size());
        ShipmentStatusDTO dto = shipments.get(0);
        assertEquals("IL", dto.originState());
        assertEquals("MI", dto.destinationState());
        assertEquals("Chicago", dto.origin());
    }

    private BigDecimal callCalculateProgress(String status, Object pickupFrom, Object deliveryTo, Object pickedUpAt) {
        try {
            var method = ShipmentStatusService.class.getDeclaredMethod(
                "calculateProgress",
                String.class, java.time.LocalDateTime.class, java.time.LocalDateTime.class, java.time.LocalDateTime.class
            );
            method.setAccessible(true);
            return (BigDecimal) method.invoke(shipmentStatusService, status, pickupFrom, deliveryTo, pickedUpAt);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
