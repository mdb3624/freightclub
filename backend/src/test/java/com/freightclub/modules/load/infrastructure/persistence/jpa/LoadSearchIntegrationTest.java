package com.freightclub.modules.load.infrastructure.persistence.jpa;

import com.freightclub.domain.EquipmentType;
import com.freightclub.modules.load.application.LoadSearchCriteria;
import com.freightclub.modules.load.domain.LoadStatus;
import com.freightclub.test.DataJpaSliceTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaSliceTest
class LoadSearchIntegrationTest {

    @Autowired TestEntityManager em;
    @Autowired SpringDataLoadRepository repo;

    private static final String TENANT_A = "tenant-aaa";
    private static final String TENANT_B = "tenant-bbb";

    private LoadEntity makeLoad(String tenantId, LoadStatus status,
                                EquipmentType type, String city, BigDecimal rate) {
        LoadEntity e = new LoadEntity();
        e.setId(java.util.UUID.randomUUID().toString());
        e.setTenantId(tenantId);
        e.setShipperId("shipper-1");
        e.setStatus(status);
        e.setWeightLbs(BigDecimal.valueOf(1000));
        e.setOriginCity(city);
        e.setEquipmentType(type);
        e.setPayRate(rate);
        return e;
    }

    @BeforeEach
    void seed() {
        // Tenant A — two PUBLISHED loads, different equipment types
        em.persistAndFlush(makeLoad(TENANT_A, LoadStatus.PUBLISHED, EquipmentType.FLATBED, "Dallas", BigDecimal.valueOf(2500)));
        em.persistAndFlush(makeLoad(TENANT_A, LoadStatus.PUBLISHED, EquipmentType.DRY_VAN, "Houston", BigDecimal.valueOf(1800)));
        // Tenant A — one DRAFT (must never appear in search results)
        em.persistAndFlush(makeLoad(TENANT_A, LoadStatus.DRAFT, EquipmentType.FLATBED, "Austin", BigDecimal.valueOf(2000)));
        // Tenant B — FLATBED that matches Tenant A's equipment criteria
        em.persistAndFlush(makeLoad(TENANT_B, LoadStatus.PUBLISHED, EquipmentType.FLATBED, "Dallas", BigDecimal.valueOf(2500)));
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
