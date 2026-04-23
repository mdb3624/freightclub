package com.freightclub.modules.load.infrastructure.persistence;

import com.freightclub.modules.load.domain.LoadStatus;
import com.freightclub.modules.load.infrastructure.persistence.jpa.LoadEntity;
import com.freightclub.modules.load.infrastructure.persistence.jpa.SpringDataLoadRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest(properties = {
        "spring.flyway.enabled=false",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@EntityScan("com.freightclub.modules.load.infrastructure.persistence.jpa")
@EnableJpaRepositories("com.freightclub.modules.load.infrastructure.persistence.jpa")
class LoadTenantIsolationTest {

    @Autowired SpringDataLoadRepository repository;
    @Autowired TestEntityManager em;

    @Test
    void tenantA_cannot_read_tenantB_load() {
        UUID tenantA = UUID.randomUUID();
        UUID tenantB = UUID.randomUUID();

        LoadEntity load = buildLoad(tenantB);
        em.persistAndFlush(load);
        em.clear();

        assertThat(repository.findByIdAndTenantIdAndDeletedAtIsNull(load.getId(), tenantA)).isEmpty();
        assertThat(repository.findByIdAndTenantIdAndDeletedAtIsNull(load.getId(), tenantB)).isPresent();
    }

    @Test
    void each_tenant_only_sees_their_own_loads() {
        UUID tenantA = UUID.randomUUID();
        UUID tenantB = UUID.randomUUID();

        LoadEntity loadA = buildLoad(tenantA);
        LoadEntity loadB = buildLoad(tenantB);
        em.persistAndFlush(loadA);
        em.persistAndFlush(loadB);
        em.clear();

        assertThat(repository.findByIdAndTenantIdAndDeletedAtIsNull(loadA.getId(), tenantB)).isEmpty();
        assertThat(repository.findByIdAndTenantIdAndDeletedAtIsNull(loadB.getId(), tenantA)).isEmpty();
    }

    @Test
    void soft_deleted_load_is_invisible_to_its_own_tenant() {
        UUID tenantId = UUID.randomUUID();

        LoadEntity load = buildLoad(tenantId);
        em.persistAndFlush(load);
        load.setDeletedAt(java.time.OffsetDateTime.now());
        em.persistAndFlush(load);
        em.clear();

        assertThat(repository.findByIdAndTenantIdAndDeletedAtIsNull(load.getId(), tenantId)).isEmpty();
    }

    private LoadEntity buildLoad(UUID tenantId) {
        LoadEntity e = new LoadEntity();
        e.setId(UUID.randomUUID());
        e.setTenantId(tenantId);
        e.setShipperId(UUID.randomUUID());
        e.setStatus(LoadStatus.DRAFT);
        e.setWeightLbs(new BigDecimal("12500.00"));
        return e;
    }
}
