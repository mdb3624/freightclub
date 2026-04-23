package com.freightclub.modules.load.application;

import com.freightclub.modules.load.application.ports.in.LoadUseCase;
import com.freightclub.modules.load.application.ports.out.DomainEventPublisher;
import com.freightclub.modules.load.application.ports.out.LoadRepositoryPort;
import com.freightclub.modules.load.domain.CarrierId;
import com.freightclub.modules.load.domain.DomainEvent;
import com.freightclub.modules.load.domain.LoadAggregate;
import com.freightclub.modules.load.domain.LoadDomainException;
import com.freightclub.modules.load.domain.Weight;
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
    public LoadAggregate createLoad(String tenantId, String shipperId, CreateLoadCommand cmd) {
        validateStateCode(cmd.originState(), "origin_state");
        validateStateCode(cmd.destState(), "dest_state");
        return repository.save(LoadAggregate.create(tenantId, shipperId, cmd));
    }

    @Override
    public LoadAggregate createDraft(String tenantId, String shipperId, BigDecimal weightLbs) {
        return repository.save(LoadAggregate.create(tenantId, shipperId, Weight.of(weightLbs)));
    }

    @Override
    public LoadAggregate publish(String tenantId, String loadId) {
        LoadAggregate load = findOrThrow(tenantId, loadId);
        load.publish();
        List<DomainEvent> events = load.pullDomainEvents();
        LoadAggregate saved = repository.save(load);
        eventPublisher.publish(events);
        return saved;
    }

    @Override
    public LoadAggregate claim(String tenantId, String loadId, String carrierId) {
        LoadAggregate load = findOrThrow(tenantId, loadId);
        load.claim(CarrierId.of(carrierId));
        List<DomainEvent> events = load.pullDomainEvents();
        LoadAggregate saved = repository.save(load);
        eventPublisher.publish(events);
        return saved;
    }

    @Override
    public LoadAggregate cancelLoad(String tenantId, String loadId, String reason) {
        LoadAggregate load = findOrThrow(tenantId, loadId);
        load.cancel(reason);
        return repository.save(load);
    }

    @Override
    public LoadAggregate startTrip(String tenantId, String loadId) {
        LoadAggregate load = findOrThrow(tenantId, loadId);
        load.startTrip();
        return repository.save(load);
    }

    @Override
    public LoadAggregate completeDelivery(String tenantId, String loadId, String podUrl) {
        LoadAggregate load = findOrThrow(tenantId, loadId);
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

    private LoadAggregate findOrThrow(String tenantId, String loadId) {
        return repository.findById(tenantId, loadId)
                .orElseThrow(() -> new LoadNotFoundException(loadId));
    }
}
