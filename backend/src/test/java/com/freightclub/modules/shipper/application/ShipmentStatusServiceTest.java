package com.freightclub.modules.shipper.application;

import jakarta.persistence.EntityManager;
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
