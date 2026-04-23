package com.freightclub.modules.load.infrastructure.persistence.jpa;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.freightclub.modules.load.application.ports.out.DomainEventPublisher;
import com.freightclub.modules.load.domain.DomainEvent;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Writes domain events to the message_outbox table within the caller's active transaction.
 * No @Transactional here — must be invoked from a @Transactional service method so the
 * outbox insert and the aggregate state change share the same DB transaction.
 */
@Component
public class OutboxDomainEventPublisher implements DomainEventPublisher {

    private final SpringDataOutboxRepository outboxRepository;
    private final ObjectMapper objectMapper;

    public OutboxDomainEventPublisher(SpringDataOutboxRepository outboxRepository,
                                      ObjectMapper objectMapper) {
        this.outboxRepository = outboxRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public void publish(List<DomainEvent> events) {
        for (DomainEvent event : events) {
            String payload = serialize(event);
            outboxRepository.save(new MessageOutboxEntity(
                    event.aggregateId(),
                    event.tenantId(),
                    event.getClass().getSimpleName(),
                    payload
            ));
        }
    }

    private String serialize(DomainEvent event) {
        try {
            return objectMapper.writeValueAsString(event);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize domain event: " + event.getClass().getSimpleName(), e);
        }
    }
}
