package com.freightclub.modules.load.application;

import com.freightclub.modules.load.application.ports.in.LoadUseCase;
import com.freightclub.modules.load.application.ports.out.DomainEventPublisher;
import com.freightclub.modules.load.application.ports.out.LoadRepositoryPort;
import com.freightclub.modules.load.domain.CarrierId;
import com.freightclub.modules.load.domain.DomainEvent;
import com.freightclub.modules.load.domain.LoadAggregate;
import com.freightclub.modules.load.domain.LoadDomainException;
import com.freightclub.modules.load.domain.Weight;
import com.freightclub.security.TenantContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.regex.Pattern;

@Service
@Transactional
public class LoadApplicationService implements LoadUseCase {

    private static final Pattern STATE_CODE = Pattern.compile("^[A-Z]{2}$");

    private final LoadRepositoryPort repository;
    private final DomainEventPublisher eventPublisher;

    public LoadApplicationService(LoadRepositoryPort repository, DomainEventPublisher eventPublisher) {
        this.repository = repository;
        this.eventPublisher = eventPublisher;
    }

    @Override
    public LoadAggregate createLoad(String shipperId, CreateLoadCommand cmd) {
        validateStateCode(cmd.originState(), "origin_state");
        validateStateCode(cmd.destState(), "dest_state");
        String tenantId = TenantContextHolder.getTenantId();
        return repository.save(LoadAggregate.create(tenantId, shipperId, cmd));
    }

    @Override
    public LoadAggregate createDraft(String shipperId, BigDecimal weightLbs) {
        String tenantId = TenantContextHolder.getTenantId();
        return repository.save(LoadAggregate.create(tenantId, shipperId, Weight.of(weightLbs)));
    }

    @Override
    public LoadAggregate publish(String loadId) {
        LoadAggregate load = findOrThrow(loadId);
        load.publish();
        List<DomainEvent> events = load.pullDomainEvents();
        LoadAggregate saved = repository.save(load);
        eventPublisher.publish(events);
        return saved;
    }

    @Override
    public LoadAggregate claim(String loadId, String carrierId) {
        // [OO-CRIT-6] One Active Load constraint: owner/operator can only claim 1 load at a time
        long activeLoadCount = repository.countActiveLoadsByCarrier(carrierId);
        if (activeLoadCount > 0) {
            throw new OneActiveLoadException(
                    "Owner/operator can only have 1 active load. Deliver your current load to claim a new one.");
        }

        LoadAggregate load = findOrThrow(loadId);
        load.claim(CarrierId.of(carrierId));
        List<DomainEvent> events = load.pullDomainEvents();
        LoadAggregate saved = repository.save(load);
        eventPublisher.publish(events);
        return saved;
    }

    @Override
    public LoadAggregate cancelLoad(String loadId, String reason) {
        LoadAggregate load = findOrThrow(loadId);
        load.cancel(reason);
        return repository.save(load);
    }

    @Override
    public LoadAggregate startTrip(String loadId) {
        LoadAggregate load = findOrThrow(loadId);
        load.startTrip();
        return repository.save(load);
    }

    @Override
    public LoadAggregate completeDelivery(String loadId, String podUrl) {
        LoadAggregate load = findOrThrow(loadId);
        load.completeDelivery(podUrl);
        List<DomainEvent> events = load.pullDomainEvents();
        LoadAggregate saved = repository.save(load);
        eventPublisher.publish(events);
        return saved;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void validateStateCode(String state, String field) {
        if (state == null || !STATE_CODE.matcher(state).matches()) {
            throw new LoadDomainException(field + " must be a 2-letter uppercase US state code, got: " + state);
        }
    }

    private LoadAggregate findOrThrow(String loadId) {
        return repository.findById(loadId)
                .orElseThrow(() -> new LoadNotFoundException(loadId));
    }
}
