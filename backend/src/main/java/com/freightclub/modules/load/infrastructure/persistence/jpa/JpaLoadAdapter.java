package com.freightclub.modules.load.infrastructure.persistence.jpa;

import com.freightclub.modules.load.application.ports.out.LoadRepositoryPort;
import com.freightclub.modules.load.domain.CarrierId;
import com.freightclub.modules.load.domain.LoadAggregate;
import com.freightclub.modules.load.domain.Money;
import com.freightclub.modules.load.domain.Weight;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Component
@Transactional
public class JpaLoadAdapter implements LoadRepositoryPort {

    private final SpringDataLoadRepository repo;
    private final EntityManager em;

    public JpaLoadAdapter(SpringDataLoadRepository repo, EntityManager em) {
        this.repo = repo;
        this.em = em;
    }

    @Override
    public LoadAggregate save(LoadAggregate aggregate) {
        setTenant(aggregate.getTenantId());
        return toDomain(repo.save(toEntity(aggregate)));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<LoadAggregate> findById(String tenantId, String loadId) {
        setTenant(tenantId);
        return repo.findByIdAndTenantIdAndDeletedAtIsNull(loadId, tenantId)
                .map(this::toDomain);
    }

    // ── RLS propagation ───────────────────────────────────────────────────────

    /**
     * Sets app.current_tenant as a transaction-local session variable so the
     * PostgreSQL RLS policy can filter rows. Reverts automatically when the
     * transaction ends — safe for connection pools.
     */
    private void setTenant(String tenantId) {
        em.createNativeQuery("SELECT set_config('app.current_tenant', :tid, true)")
                .setParameter("tid", tenantId)
                .getSingleResult();
    }

    // ── Mapping ───────────────────────────────────────────────────────────────

    private LoadEntity toEntity(LoadAggregate a) {
        LoadEntity e = new LoadEntity();
        e.setId(a.getId());
        e.setTenantId(a.getTenantId());
        e.setShipperId(a.getShipperId());
        e.setStatus(a.getStatus());
        e.setWeightLbs(a.getWeight().lbs());
        e.setOriginCity(a.getOriginCity());
        e.setOriginState(a.getOriginState());
        e.setDestState(a.getDestState());
        e.setPayRate(a.getPayRate() != null ? a.getPayRate().amount() : null);
        e.setPayRateType(a.getPayRateType());
        e.setDistanceMiles(a.getDistanceMiles());
        e.setTruckerId(a.getCarrierId() != null ? a.getCarrierId().value() : null);
        e.setPodUrl(a.getPodUrl());
        e.setCancelReason(a.getCancelReason());
        return e;
    }

    private LoadAggregate toDomain(LoadEntity e) {
        return LoadAggregate.reconstitute(
                e.getId(),
                e.getTenantId(),
                e.getShipperId(),
                Weight.of(e.getWeightLbs()),
                e.getStatus(),
                e.getTruckerId() != null ? CarrierId.of(e.getTruckerId()) : null,
                e.getPodUrl(),
                e.getCancelReason(),
                e.getEquipmentType() != null ? e.getEquipmentType().name() : null,
                e.getOriginCity(),
                e.getOriginState(),
                e.getDestState(),
                e.getPayRate() != null ? Money.of(e.getPayRate()) : null,
                e.getPayRateType(),
                e.getDistanceMiles()
        );
    }
}
