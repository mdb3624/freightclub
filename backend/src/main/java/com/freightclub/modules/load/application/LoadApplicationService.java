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
    public LoadAggregate publish(String loadId, String callerId) {
        LoadAggregate load = findOwnedByShipperOrThrow(loadId, callerId);
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
    public LoadAggregate cancelLoad(String loadId, String callerId, String reason) {
        LoadAggregate load = findOwnedByShipperOrThrow(loadId, callerId);
        load.cancel(reason);
        return repository.save(load);
    }

    @Override
    public LoadAggregate startTrip(String loadId, String callerId) {
        LoadAggregate load = findOwnedByCarrierOrThrow(loadId, callerId);
        load.startTrip();
        return repository.save(load);
    }

    @Override
    public LoadAggregate completeDelivery(String loadId, String callerId, String podUrl) {
        LoadAggregate load = findOwnedByCarrierOrThrow(loadId, callerId);
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

    /**
     * Returns the load only if callerId is its shipper. Throws the same
     * LoadNotFoundException used for missing loads (not a 403) so a non-owner
     * can't distinguish "not mine" from "doesn't exist" — matches the
     * anti-enumeration pattern already used for trucker-assigned loads
     * (see LoadService.findAssignedLoad in the legacy v1 controller).
     */
    private LoadAggregate findOwnedByShipperOrThrow(String loadId, String callerId) {
        LoadAggregate load = findOrThrow(loadId);
        if (!load.getShipperId().equals(callerId)) {
            throw new LoadNotFoundException(loadId);
        }
        return load;
    }

    private LoadAggregate findOwnedByCarrierOrThrow(String loadId, String callerId) {
        LoadAggregate load = findOrThrow(loadId);
        if (load.getCarrierId() == null || !load.getCarrierId().value().equals(callerId)) {
            throw new LoadNotFoundException(loadId);
        }
        return load;
    }
}
