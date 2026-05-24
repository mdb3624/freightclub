package com.freightclub.modules.load.domain;

public record LoadDeliveredDomainEvent(
        String loadId,
        CarrierId carrierId,
        String tenantId,
        String podUrl
) implements DomainEvent {

    @Override
    public String aggregateId() { return loadId; }
}
