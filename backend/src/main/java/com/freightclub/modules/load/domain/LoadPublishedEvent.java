package com.freightclub.modules.load.domain;

public record LoadPublishedEvent(
        String loadId,
        String tenantId,
        String shipperId,
        String equipmentType,
        String originCity
) implements DomainEvent {

    @Override
    public String aggregateId() { return loadId; }
}
