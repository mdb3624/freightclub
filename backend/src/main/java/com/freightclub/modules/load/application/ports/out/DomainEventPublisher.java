package com.freightclub.modules.load.application.ports.out;

import com.freightclub.modules.load.domain.DomainEvent;

import java.util.List;

public interface DomainEventPublisher {

    /** Persists domain events to the transactional outbox. Must be called within an active transaction. */
    void publish(List<DomainEvent> events);
}
