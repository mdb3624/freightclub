package com.freightclub.modules.shipper.application;

import com.freightclub.domain.Load;
import com.freightclub.domain.LoadStatus;
import com.freightclub.domain.Tenant;
import com.freightclub.domain.User;
import com.freightclub.domain.UserRole;
import com.freightclub.modules.shipper.infrastructure.rest.dto.LoadListResponse;
import com.freightclub.modules.shipper.infrastructure.rest.dto.LoadStatsResponse;
import com.freightclub.repository.LoadRepository;
import com.freightclub.repository.TenantRepository;
import com.freightclub.repository.UserRepository;
import com.freightclub.security.TenantContextHolder;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

/**
 * Tests for LoadQueryService with RLS and soft-delete filtering.
 * AC-US-715: Load statistics and pagination with tenant isolation.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class LoadQueryServiceTest {

    @Autowired
    private LoadQueryService service;

    @Autowired
    private LoadRepository loadRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private jakarta.persistence.EntityManager em;


    private String tenantId;
    private String shipperId;

    @BeforeEach
    void setup() {
        tenantId = "t" + System.nanoTime();
        // Create tenant before creating loads
        Tenant tenant = new Tenant();
        tenant.setId(tenantId);
        tenant.setName("Test Tenant");
        tenantRepository.save(tenant);

        // Create shipper user for this tenant
        shipperId = "s" + System.nanoTime();
        User shipper = new User(shipperId);
        shipper.setTenantId(tenantId);
        shipper.setEmail(shipperId + "@test.local");
        shipper.setPasswordHash("hash");
        shipper.setRole(UserRole.SHIPPER);
        shipper.setFirstName("Test");
        shipper.setLastName("Shipper");
        userRepository.save(shipper);

        TenantContextHolder.setTenantId(tenantId);
        TenantContextHolder.setUserId(shipperId);

        // Set PostgreSQL session variable for RLS policies
        em.createNativeQuery("SELECT set_config('app.current_tenant', :tid, true)")
                .setParameter("tid", tenantId)
                .getSingleResult();
    }


    @AfterEach
    void teardown() {
        TenantContextHolder.clear();
    }

    private void refreshSessionVariable() {
        em.createNativeQuery("SELECT set_config('app.current_tenant', :tid, true)")
                .setParameter("tid", tenantId)
                .getSingleResult();
    }

    @Test
    @DisplayName("direct repository query returns saved load")
    void testDirectRepositoryQuery() {

        // Given: Create and save a load directly
        Load load = new Load();
        setField(load, "id", "repo-test-load");
        load.setTenantId(tenantId);
        load.setShipperId(TenantContextHolder.getCurrentUserId());
        load.setStatus(LoadStatus.OPEN);
        load.setOriginCity("Test");
        load.setOriginState("TX");
        load.setOriginZip("75001");
        load.setOriginAddress1("123 St");
        load.setDestinationCity("Test2");
        load.setDestinationState("TX");
        load.setDestinationZip("75002");
        load.setDestinationAddress1("456 St");
        load.setCommodity("Test");
        load.setWeightLbs(BigDecimal.valueOf(1000));
        load.setEquipmentType(com.freightclub.domain.EquipmentType.FLATBED);
        load.setPayRate(BigDecimal.valueOf(1500));
        load.setPayRateType(com.freightclub.domain.PayRateType.PER_MILE);
        load.setPickupFrom(LocalDateTime.now());
        load.setPickupTo(LocalDateTime.now().plusHours(1));
        load.setDeliveryFrom(LocalDateTime.now().plusDays(1));
        load.setDeliveryTo(LocalDateTime.now().plusDays(1).plusHours(1));

        loadRepository.save(load);

        // When: Query by tenant and status
        long count = loadRepository.countByTenantIdAndStatusAndDeletedAtIsNull(tenantId, LoadStatus.OPEN);

        // Then: Should find the load
        assertEquals(1, count, "Direct repository query should find 1 OPEN load");
    }

    @Test
    @DisplayName("direct repository query with multiple loads")
    void testDirectRepositoryQueryMultipleLoads() {
        // Given: Create multiple loads directly (inline without helper)
        refreshSessionVariable();

        Load load1 = new Load();
        setField(load1, "id", "LOAD-001");
        load1.setTenantId(tenantId);
        load1.setShipperId(shipperId);
        load1.setStatus(LoadStatus.OPEN);
        load1.setOriginCity("Test");
        load1.setOriginState("TX");
        load1.setOriginZip("75001");
        load1.setOriginAddress1("123 St");
        load1.setDestinationCity("Test2");
        load1.setDestinationState("TX");
        load1.setDestinationZip("75002");
        load1.setDestinationAddress1("456 St");
        load1.setCommodity("Test");
        load1.setWeightLbs(BigDecimal.valueOf(1000));
        load1.setEquipmentType(com.freightclub.domain.EquipmentType.FLATBED);
        load1.setPayRate(BigDecimal.valueOf(1500));
        load1.setPayRateType(com.freightclub.domain.PayRateType.PER_MILE);
        load1.setPickupFrom(LocalDateTime.now());
        load1.setPickupTo(LocalDateTime.now().plusHours(1));
        load1.setDeliveryFrom(LocalDateTime.now().plusDays(1));
        load1.setDeliveryTo(LocalDateTime.now().plusDays(1).plusHours(1));
        loadRepository.save(load1);

        refreshSessionVariable();

        Load load2 = new Load();
        setField(load2, "id", "LOAD-002");
        load2.setTenantId(tenantId);
        load2.setShipperId(shipperId);
        load2.setStatus(LoadStatus.OPEN);
        load2.setOriginCity("Test");
        load2.setOriginState("TX");
        load2.setOriginZip("75001");
        load2.setOriginAddress1("123 St");
        load2.setDestinationCity("Test2");
        load2.setDestinationState("TX");
        load2.setDestinationZip("75002");
        load2.setDestinationAddress1("456 St");
        load2.setCommodity("Test");
        load2.setWeightLbs(BigDecimal.valueOf(1000));
        load2.setEquipmentType(com.freightclub.domain.EquipmentType.FLATBED);
        load2.setPayRate(BigDecimal.valueOf(1500));
        load2.setPayRateType(com.freightclub.domain.PayRateType.PER_MILE);
        load2.setPickupFrom(LocalDateTime.now());
        load2.setPickupTo(LocalDateTime.now().plusHours(1));
        load2.setDeliveryFrom(LocalDateTime.now().plusDays(1));
        load2.setDeliveryTo(LocalDateTime.now().plusDays(1).plusHours(1));
        loadRepository.save(load2);

        // When: Query by tenant and status
        long count = loadRepository.countByTenantIdAndStatusAndDeletedAtIsNull(tenantId, LoadStatus.OPEN);

        // Then: Should find the 2 OPEN loads
        assertEquals(2, count, "Should find 2 OPEN loads when querying directly");
    }

    @Test
    @DisplayName("getLoadStats returns active load counts excluding draft and cancelled")
    void testGetLoadStatsActiveView() {
        // Given: Create test loads for active view (inline, matching working pattern)
        for (String[] load : new String[][] {
            {"LOAD-001", "OPEN", "false"},
            {"LOAD-002", "OPEN", "false"},
            {"LOAD-003", "CLAIMED", "false"},
            {"LOAD-004", "IN_TRANSIT", "false"},
            {"LOAD-005", "DELIVERED", "false"},
            {"LOAD-006", "DRAFT", "false"},
            {"LOAD-007", "CANCELLED", "true"}
        }) {
            Load l = new Load();
            setField(l, "id", load[0]);
            l.setTenantId(tenantId);
            l.setShipperId(shipperId);
            l.setStatus(LoadStatus.valueOf(load[1]));
            l.setOriginCity("Los Angeles");
            l.setOriginState("CA");
            l.setOriginZip("90001");
            l.setOriginAddress1("123 Main St");
            l.setDestinationCity("San Francisco");
            l.setDestinationState("CA");
            l.setDestinationZip("94102");
            l.setDestinationAddress1("456 Market St");
            l.setCommodity("Dry Goods");
            l.setWeightLbs(BigDecimal.valueOf(1000));
            l.setEquipmentType(com.freightclub.domain.EquipmentType.FLATBED);
            l.setPayRate(BigDecimal.valueOf(1500));
            l.setPayRateType(com.freightclub.domain.PayRateType.PER_MILE);
            l.setPickupFrom(LocalDateTime.of(2026, 6, 1, 10, 0));
            l.setPickupTo(LocalDateTime.of(2026, 6, 1, 17, 0));
            l.setDeliveryFrom(LocalDateTime.of(2026, 6, 2, 10, 0));
            l.setDeliveryTo(LocalDateTime.of(2026, 6, 2, 17, 0));
            if (load[2].equals("true")) {
                l.setDeletedAt(LocalDateTime.now());
            }
            loadRepository.save(l);
        }

        // When: Query active stats
        var stats = service.getLoadStats("active");

        // Then: Verify counts match active loads only
        assertNotNull(stats.active());
        assertEquals(2, stats.active().open(), "Should count 2 OPEN loads");
        assertEquals(1, stats.active().claimed(), "Should count 1 CLAIMED load");
        assertEquals(1, stats.active().inTransit(), "Should count 1 IN_TRANSIT load");
        assertEquals(1, stats.active().delivered(), "Should count 1 DELIVERED load");
        assertEquals(0, stats.active().draft(), "Draft should be 0 in active view");
        assertEquals(0, stats.active().cancelled(), "Cancelled should be 0 in active view");
    }

    @Test
    @DisplayName("getLoadStats returns all load counts including draft and soft-deleted")
    void testGetLoadStatsAllView() {

        // Given: Create test loads for all view
        createLoad("LOAD-001", LoadStatus.DRAFT, false);
        createLoad("LOAD-002", LoadStatus.OPEN, false);
        createLoad("LOAD-003", LoadStatus.CLAIMED, false);
        createLoad("LOAD-004", LoadStatus.IN_TRANSIT, false);
        createLoad("LOAD-005", LoadStatus.DELIVERED, false);
        createLoad("LOAD-006", LoadStatus.CANCELLED, true); // Soft-deleted

        // When: Query all stats
        var stats = service.getLoadStats("all");

        // Then: Verify counts include draft and soft-deleted
        assertNotNull(stats.all());
        assertEquals(1, stats.all().draft(), "Should count 1 DRAFT load");
        assertEquals(1, stats.all().open(), "Should count 1 OPEN load");
        assertEquals(1, stats.all().claimed(), "Should count 1 CLAIMED load");
        assertEquals(1, stats.all().inTransit(), "Should count 1 IN_TRANSIT load");
        assertEquals(1, stats.all().delivered(), "Should count 1 DELIVERED load");
        assertEquals(1, stats.all().cancelled(), "Should count 1 soft-deleted CANCELLED load");
    }

    @Test
    @DisplayName("getShipperLoads returns paginated results with correct pagination metadata")
    void testGetShipperLoadsWithPagination() {

        // Given: Create 25 loads
        for (int i = 0; i < 25; i++) {
            createLoad("LOAD-" + String.format("%03d", i), LoadStatus.OPEN, false);
        }

        // When: Query page 1 (20 per page)
        var page1 = service.getShipperLoads(0, 20, "active", "pickupFrom", "asc");

        // Then: Verify page 1 has 20 loads
        assertNotNull(page1);
        assertEquals(20, page1.loads().length, "Page 1 should have 20 loads");
        assertEquals(0, page1.pagination().page(), "Page should be 0-indexed");
        assertEquals(25, page1.pagination().total(), "Total should be 25");

        // When: Query page 2
        var page2 = service.getShipperLoads(1, 20, "active", "pickupFrom", "asc");

        // Then: Verify page 2 has remaining 5 loads
        assertNotNull(page2);
        assertEquals(5, page2.loads().length, "Page 2 should have 5 remaining loads");
        assertEquals(1, page2.pagination().page(), "Page should be 1");
        assertEquals(25, page2.pagination().total(), "Total should still be 25");
    }

    @Test
    @DisplayName("getShipperLoads respects tenant isolation via TenantContextHolder")
    void testGetShipperLoadsRespectsTenantIsolation() {

        // Given: Create load for tenant1
        String tenant1 = tenantId;
        String shipper1 = TenantContextHolder.getCurrentUserId();  // Store tenant1's shipper
        TenantContextHolder.setTenantId(tenant1);
        createLoad("LOAD-001", LoadStatus.OPEN, false);

        // And: Create tenant2 and its shipper, then create load
        String tenant2 = "t" + System.nanoTime();
        Tenant t2 = new Tenant();
        t2.setId(tenant2);
        t2.setName("Tenant 2");
        tenantRepository.save(t2);

        String shipper2 = "s" + System.nanoTime();
        User u2 = new User(shipper2);
        u2.setTenantId(tenant2);
        u2.setEmail(shipper2 + "@test.local");
        u2.setPasswordHash("hash");
        u2.setRole(UserRole.SHIPPER);
        u2.setFirstName("Test");
        u2.setLastName("Shipper2");
        userRepository.save(u2);

        TenantContextHolder.setTenantId(tenant2);
        TenantContextHolder.setUserId(shipper2);
        em.createNativeQuery("SELECT set_config('app.current_tenant', :tid, true)")
                .setParameter("tid", tenant2)
                .getSingleResult();
        createLoad("LOAD-002", LoadStatus.OPEN, false);

        em.flush();

        // When: Query as tenant1 - switch tenant context and update session variable
        TenantContextHolder.setTenantId(tenant1);
        TenantContextHolder.setUserId(shipper1);
        em.createNativeQuery("SELECT set_config('app.current_tenant', :tid, true)")
                .setParameter("tid", tenant1)
                .getSingleResult();
        var results = service.getShipperLoads(0, 20, "active", "pickupFrom", "asc");

        // Then: Tenant1 should see only their load
        assertNotNull(results);
        assertEquals(1, results.loads().length, "Tenant1 should see only their load");
        assertEquals("LOAD-001", results.loads()[0].id(), "Should be tenant1's load");
    }

    @Test
    @DisplayName("getShipperLoads excludes soft-deleted loads from active view")
    void testGetShipperLoadsExcludesSoftDeleted() {

        // Given: Create mix of active and soft-deleted loads
        createLoad("LOAD-001", LoadStatus.OPEN, false);
        createLoad("LOAD-002", LoadStatus.OPEN, false);
        createLoad("LOAD-003", LoadStatus.DELIVERED, true); // Soft-deleted

        // When: Query active view
        var results = service.getShipperLoads(0, 20, "active", "pickupFrom", "asc");

        // Then: Should not include soft-deleted load
        assertNotNull(results);
        assertEquals(2, results.loads().length, "Should exclude soft-deleted loads");
    }

    @Test
    @DisplayName("getShipperLoads returns correct load item data mapping")
    void testGetShipperLoadsDataMapping() {

        // Given: Create load with specific data
        createLoad("LOAD-001", LoadStatus.OPEN, false);

        // When: Query loads
        var results = service.getShipperLoads(0, 20, "active", "pickupFrom", "asc");

        // Then: Verify load item has correct mapped fields
        assertNotNull(results);
        assertEquals(1, results.loads().length);
        var loadItem = results.loads()[0];
        assertEquals("LOAD-001", loadItem.id());
        assertEquals("Los Angeles", loadItem.originCity());
        assertEquals("CA", loadItem.originState());
        assertEquals("San Francisco", loadItem.destinationCity());
        assertEquals("CA", loadItem.destinationState());
        assertEquals("OPEN", loadItem.status());
        assertEquals(1500.0, loadItem.payAmount());
        assertEquals("per mile", loadItem.payUnit());
    }

    @Test
    @DisplayName("getShipperLoads supports sorting in ascending order")
    void testGetShipperLoadsSortingAsc() {

        // Given: Create loads with different pickup times
        createLoadWithPickupFrom("LOAD-001", LoadStatus.OPEN, false,
                LocalDateTime.of(2026, 6, 1, 10, 0));
        createLoadWithPickupFrom("LOAD-002", LoadStatus.OPEN, false,
                LocalDateTime.of(2026, 6, 3, 10, 0));

        // When: Query with ascending sort
        var results = service.getShipperLoads(0, 20, "active", "pickupFrom", "asc");

        // Then: Results should be sorted earliest first
        assertNotNull(results);
        assertEquals(2, results.loads().length);
        assertEquals("LOAD-001", results.loads()[0].id());
        assertEquals("LOAD-002", results.loads()[1].id());
    }

    @Test
    @DisplayName("getShipperLoads supports sorting in descending order")
    void testGetShipperLoadsSortingDesc() {

        // Given: Create loads with different pickup times
        createLoadWithPickupFrom("LOAD-001", LoadStatus.OPEN, false,
                LocalDateTime.of(2026, 6, 1, 10, 0));
        createLoadWithPickupFrom("LOAD-002", LoadStatus.OPEN, false,
                LocalDateTime.of(2026, 6, 3, 10, 0));

        // When: Query with descending sort
        var results = service.getShipperLoads(0, 20, "active", "pickupFrom", "desc");

        // Then: Results should be sorted latest first
        assertNotNull(results);
        assertEquals(2, results.loads().length);
        assertEquals("LOAD-002", results.loads()[0].id());
        assertEquals("LOAD-001", results.loads()[1].id());
    }

    // Helper methods

    private Load createLoad(String id, LoadStatus status, boolean deleted) {
        // Ensure session variable is set before creating load (for RLS enforcement)
        refreshSessionVariable();

        var load = new Load();
        setField(load, "id", id);
        load.setTenantId(tenantId);
        load.setShipperId(shipperId);
        load.setStatus(status);
        load.setOriginCity("Los Angeles");
        load.setOriginState("CA");
        load.setOriginZip("90001");
        load.setOriginAddress1("123 Main St");
        load.setDestinationCity("San Francisco");
        load.setDestinationState("CA");
        load.setDestinationZip("94102");
        load.setDestinationAddress1("456 Market St");
        load.setCommodity("Dry Goods");
        load.setWeightLbs(BigDecimal.valueOf(1000));
        load.setEquipmentType(com.freightclub.domain.EquipmentType.FLATBED);
        load.setPayRate(BigDecimal.valueOf(1500));
        load.setPayRateType(com.freightclub.domain.PayRateType.PER_MILE);
        load.setPickupFrom(LocalDateTime.of(2026, 6, 1, 10, 0));
        load.setPickupTo(LocalDateTime.of(2026, 6, 1, 17, 0));
        load.setDeliveryFrom(LocalDateTime.of(2026, 6, 2, 10, 0));
        load.setDeliveryTo(LocalDateTime.of(2026, 6, 2, 17, 0));

        if (deleted) {
            load.setDeletedAt(LocalDateTime.now());
        }

        return loadRepository.save(load);
    }

    private Load createLoadWithPickupFrom(String id, LoadStatus status, boolean deleted, LocalDateTime pickupFrom) {
        // Ensure session variable is set before creating load (for RLS enforcement)
        refreshSessionVariable();

        var load = new Load();
        setField(load, "id", id);
        load.setTenantId(tenantId);
        load.setShipperId(shipperId);
        load.setStatus(status);
        load.setOriginCity("Los Angeles");
        load.setOriginState("CA");
        load.setOriginZip("90001");
        load.setOriginAddress1("123 Main St");
        load.setDestinationCity("San Francisco");
        load.setDestinationState("CA");
        load.setDestinationZip("94102");
        load.setDestinationAddress1("456 Market St");
        load.setCommodity("Dry Goods");
        load.setWeightLbs(BigDecimal.valueOf(1000));
        load.setEquipmentType(com.freightclub.domain.EquipmentType.FLATBED);
        load.setPayRate(BigDecimal.valueOf(1500));
        load.setPayRateType(com.freightclub.domain.PayRateType.PER_MILE);
        load.setPickupFrom(pickupFrom);
        load.setPickupTo(pickupFrom.plusHours(7));
        load.setDeliveryFrom(pickupFrom.plusDays(1));
        load.setDeliveryTo(pickupFrom.plusDays(1).plusHours(7));

        if (deleted) {
            load.setDeletedAt(LocalDateTime.now());
        }

        return loadRepository.save(load);
    }

    private static void setField(Object target, String name, Object value) {
        try {
            var f = target.getClass().getDeclaredField(name);
            f.setAccessible(true);
            f.set(target, value);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
