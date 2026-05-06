package com.freightclub.modules.load.infrastructure.persistence;

import com.freightclub.modules.load.domain.LoadStatus;
import com.freightclub.modules.load.infrastructure.persistence.jpa.LoadEntity;
import com.freightclub.modules.load.infrastructure.persistence.jpa.SpringDataLoadRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * JPA mapping tests for LoadEntity using H2 in-memory.
 *
 * RLS enforcement (cross-tenant isolation) is covered by RlsPolicyTest, which
 * uses a real PostgreSQL container. These tests focus on entity mapping and
 * the soft-delete query contract.
 */
@DataJpaTest(properties = {
        "spring.flyway.enabled=false",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect"
})
@EntityScan("com.freightclub.modules.load.infrastructure.persistence.jpa")
@EnableJpaRepositories("com.freightclub.modules.load.infrastructure.persistence.jpa")
class LoadPersistenceIntegrationTest {

    @Autowired SpringDataLoadRepository repo;
    @Autowired EntityManager em;

    // ── Test 1: JPA mapping and same-tenant retrieval ─────────────────────────

    @Test
    @DisplayName("Test 1: saved load is retrievable with correct field mapping")
    void savedLoadCanBeFoundById() {
        LoadEntity saved = repo.save(draftEntity("tenant-a"));
        em.flush();
        em.clear();

        Optional<LoadEntity> found = repo.findByIdAndDeletedAtIsNull(saved.getId());

        assertThat(found).isPresent();
        assertThat(found.get().getTenantId()).isEqualTo("tenant-a");
        assertThat(found.get().getShipperId()).isEqualTo("shipper-1");
        assertThat(found.get().getStatus()).isEqualTo(LoadStatus.DRAFT);
        assertThat(found.get().getWeightLbs()).isEqualByComparingTo("45000");
        assertThat(found.get().getCarrierId()).isNull();
        assertThat(found.get().getPodUrl()).isNull();
        assertThat(found.get().getCreatedAt()).isNotNull();
        assertThat(found.get().getUpdatedAt()).isNotNull();
        assertThat(found.get().getDeletedAt()).isNull();
    }

    // ── Test 2: soft-delete contract ──────────────────────────────────────────

    @Test
    @DisplayName("Test 2: soft-deleted load is excluded from findByIdAndDeletedAtIsNull")
    void softDeletedLoadIsInvisibleToQuery() {
        LoadEntity entity = repo.save(draftEntity("tenant-b"));
        em.flush();

        // Soft-delete it
        entity.setDeletedAt(OffsetDateTime.now());
        repo.save(entity);
        em.flush();
        em.clear();

        Optional<LoadEntity> result = repo.findByIdAndDeletedAtIsNull(entity.getId());

        assertThat(result)
                .as("findByIdAndDeletedAtIsNull must exclude soft-deleted rows")
                .isEmpty();
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private LoadEntity draftEntity(String tenantId) {
        LoadEntity e = new LoadEntity();
        e.setId(UUID.randomUUID().toString());
        e.setTenantId(tenantId);
        e.setShipperId("shipper-1");
        e.setStatus(LoadStatus.DRAFT);
        e.setWeightLbs(new BigDecimal("45000"));
        return e;
    }
}
