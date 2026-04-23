package com.freightclub.modules.load.infrastructure.persistence.jpa;

import com.freightclub.modules.load.application.LoadSearchCriteria;
import com.freightclub.modules.load.application.LoadSummary;
import com.freightclub.modules.load.application.ports.out.LoadSearchPort;
import com.freightclub.modules.load.domain.Money;
import jakarta.persistence.EntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Transactional(readOnly = true)
public class LoadSearchAdapter implements LoadSearchPort {

    private final SpringDataLoadRepository repo;
    private final EntityManager em;

    public LoadSearchAdapter(SpringDataLoadRepository repo, EntityManager em) {
        this.repo = repo;
        this.em = em;
    }

    @Override
    public Page<LoadSummary> findAvailableLoads(String tenantId, LoadSearchCriteria criteria, Pageable pageable) {
        setTenant(tenantId);
        return repo.findAll(LoadSpecification.forCriteria(tenantId, criteria), pageable)
                .map(this::toSummary);
    }

    private void setTenant(String tenantId) {
        em.createNativeQuery("SELECT set_config('app.current_tenant', :tid, true)")
                .setParameter("tid", tenantId)
                .getSingleResult();
    }

    private LoadSummary toSummary(LoadEntity e) {
        return new LoadSummary(
                e.getId(),
                e.getTenantId(),
                e.getShipperId(),
                e.getStatus(),
                e.getWeightLbs(),
                e.getOriginCity(),
                e.getEquipmentType(),
                e.getPayRate() != null ? Money.of(e.getPayRate()) : null
        );
    }
}
