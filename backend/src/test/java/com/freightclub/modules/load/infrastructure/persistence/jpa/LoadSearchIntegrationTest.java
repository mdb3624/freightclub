package com.freightclub.modules.load.infrastructure.persistence.jpa;

import com.freightclub.domain.EquipmentType;
import com.freightclub.domain.Tenant;
import com.freightclub.domain.User;
import com.freightclub.domain.UserRole;
import com.freightclub.modules.load.application.LoadSearchCriteria;
import com.freightclub.modules.load.domain.LoadStatus;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class LoadSearchIntegrationTest {

    @Autowired SpringDataLoadRepository repo;
    @Autowired UserRepository userRepository;
    @Autowired TenantRepository tenantRepository;
    @Autowired jakarta.persistence.EntityManager entityManager;

    private static final String TENANT_A = "tenant-load-search-a";
    private static final String TENANT_B = "tenant-load-search-b";
    private static final String SHIPPER_A = "shipper-load-search-a";
    private static final String SHIPPER_B = "shipper-load-search-b";

    private LoadEntity makeLoad(String tenantId, String shipperId, LoadStatus status,
                                EquipmentType type, String city, BigDecimal rate) {
        LoadEntity e = new LoadEntity();
        e.setId(java.util.UUID.randomUUID().toString());
        e.setTenantId(tenantId);
        e.setShipperId(shipperId);
        e.setStatus(status);
        e.setWeightLbs(BigDecimal.valueOf(1000));
        e.setOriginCity(city);
        e.setOriginState("TX");
        e.setOriginZip("75001");
        e.setOriginAddress1("123 Main St");
        e.setDestinationCity("Houston");
        e.setDestState("TX");
        e.setDestinationZip("77001");
        e.setDestinationAddress1("456 Main St");
        e.setEquipmentType(type);
        e.setPayRate(rate);
        e.setPayRateType(com.freightclub.modules.load.domain.PayRateType.PER_MILE);
        e.setCommodity("General Freight");
        java.time.OffsetDateTime now = java.time.OffsetDateTime.now();
        e.setPickupFrom(now);
        e.setPickupTo(now.plusHours(2));
        e.setDeliveryFrom(now.plusDays(1));
        e.setDeliveryTo(now.plusDays(2));
        return e;
    }

    @BeforeEach
    void setUp() {
        TenantContextHolder.setTenantId(TENANT_A);
        ensureTenantsAndShippersExist();
        seed();
    }

    private void ensureTenantsAndShippersExist() {
        // Create tenants first — tenants_insert allows this with no context bound.
        createTenantIfMissing(TENANT_A, "Load Search Test Tenant A");
        createTenantIfMissing(TENANT_B, "Load Search Test Tenant B");

        // Users are RLS-checked against their own tenant_id — SHIPPER_B needs context
        // switched to TENANT_B first, or its INSERT is rejected under real RLS (US-858).
        createUserIfMissing(SHIPPER_A, "shippera@test.com", UserRole.SHIPPER, TENANT_A);
        entityManager.flush();

        TenantContextHolder.setTenantId(TENANT_B);
        createUserIfMissing(SHIPPER_B, "shipperb@test.com", UserRole.SHIPPER, TENANT_B);
        entityManager.flush();
        TenantContextHolder.setTenantId(TENANT_A);
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
            user.setLastName("Shipper");
            userRepository.save(user);
        }
    }

    @AfterEach
    void tearDown() {
        TenantContextHolder.clear();
    }

    void seed() {
        // Tenant A — two PUBLISHED loads, different equipment types
        repo.save(makeLoad(TENANT_A, SHIPPER_A, LoadStatus.PUBLISHED, EquipmentType.FLATBED, "Dallas", BigDecimal.valueOf(2500)));
        repo.save(makeLoad(TENANT_A, SHIPPER_A, LoadStatus.PUBLISHED, EquipmentType.DRY_VAN, "Houston", BigDecimal.valueOf(1800)));
        // Tenant A — one DRAFT (must never appear in search results)
        repo.save(makeLoad(TENANT_A, SHIPPER_A, LoadStatus.DRAFT, EquipmentType.FLATBED, "Austin", BigDecimal.valueOf(2000)));
        entityManager.flush();

        // Tenant B — FLATBED that matches Tenant A's equipment criteria. Needs context
        // switched to TENANT_B first, or its INSERT is rejected under real RLS (US-858).
        TenantContextHolder.setTenantId(TENANT_B);
        repo.save(makeLoad(TENANT_B, SHIPPER_B, LoadStatus.PUBLISHED, EquipmentType.FLATBED, "Dallas", BigDecimal.valueOf(2500)));
        entityManager.flush();
        TenantContextHolder.setTenantId(TENANT_A);
    }

    @Test
    @DisplayName("Filtering by FLATBED only returns FLATBED loads for the given tenant")
    void equipmentFilter_onlyReturnsFlatbeds() {
        Specification<LoadEntity> spec = LoadSpecification.forCriteria(TENANT_A,
                new LoadSearchCriteria(null, EquipmentType.FLATBED, null));

        List<LoadEntity> results = repo.findAll(spec);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getEquipmentType()).isEqualTo(EquipmentType.FLATBED);
        assertThat(results.get(0).getTenantId()).isEqualTo(TENANT_A);
    }

    @Test
    @DisplayName("Tenant A search never returns Tenant B loads even when criteria match")
    void tenantIsolation_crossTenantLoadsNotReturned() {
        // Both tenants have FLATBED loads in Dallas at the same rate.
        // Searching as Tenant A must return only Tenant A's load.
        Specification<LoadEntity> spec = LoadSpecification.forCriteria(TENANT_A,
                new LoadSearchCriteria("Dallas", EquipmentType.FLATBED, null));

        List<LoadEntity> results = repo.findAll(spec);

        assertThat(results).allMatch(e -> TENANT_A.equals(e.getTenantId()));
        assertThat(results).noneMatch(e -> TENANT_B.equals(e.getTenantId()));
    }

    @Test
    @DisplayName("DRAFT loads are excluded even if other criteria match")
    void draftLoads_excluded() {
        Specification<LoadEntity> spec = LoadSpecification.forCriteria(TENANT_A,
                new LoadSearchCriteria("Austin", EquipmentType.FLATBED, null));

        List<LoadEntity> results = repo.findAll(spec);

        // The Austin FLATBED is DRAFT — must not appear
        assertThat(results).isEmpty();
    }

    @Test
    @DisplayName("minRate filter excludes loads below threshold")
    void minRateFilter_excludesBelowThreshold() {
        Specification<LoadEntity> spec = LoadSpecification.forCriteria(TENANT_A,
                new LoadSearchCriteria(null, null, BigDecimal.valueOf(2000)));

        List<LoadEntity> results = repo.findAll(spec);

        // DRY_VAN at 1800 excluded; FLATBED at 2500 included
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getPayRate()).isGreaterThanOrEqualTo(BigDecimal.valueOf(2000));
    }

    @Test
    @DisplayName("Empty criteria returns all PUBLISHED loads for tenant")
    void emptyCriteria_returnsAllPublished() {
        Specification<LoadEntity> spec = LoadSpecification.forCriteria(TENANT_A, LoadSearchCriteria.empty());

        List<LoadEntity> results = repo.findAll(spec);

        assertThat(results).hasSize(2); // FLATBED + DRY_VAN (DRAFT excluded)
        assertThat(results).allMatch(e -> e.getStatus() == LoadStatus.PUBLISHED);
    }

    @Test
    @DisplayName("Paging limits results to requested page size")
    void paging_limitsByPageSize() {
        Specification<LoadEntity> spec = LoadSpecification.forCriteria(TENANT_A, LoadSearchCriteria.empty());
        Pageable firstPage = PageRequest.of(0, 1);

        Page<LoadEntity> page = repo.findAll(spec, firstPage);

        assertThat(page.getContent()).hasSize(1);
        assertThat(page.getTotalElements()).isEqualTo(2); // FLATBED + DRY_VAN
        assertThat(page.getTotalPages()).isEqualTo(2);
    }

    @Test
    @DisplayName("Second page returns remaining results")
    void paging_secondPageHasRemainder() {
        Specification<LoadEntity> spec = LoadSpecification.forCriteria(TENANT_A, LoadSearchCriteria.empty());
        Pageable secondPage = PageRequest.of(1, 1);

        Page<LoadEntity> page = repo.findAll(spec, secondPage);

        assertThat(page.getContent()).hasSize(1);
        assertThat(page.getNumber()).isEqualTo(1);
        assertThat(page.getTotalElements()).isEqualTo(2);
    }
}
