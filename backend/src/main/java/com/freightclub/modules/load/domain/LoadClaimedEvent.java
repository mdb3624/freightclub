package com.freightclub.modules.load.domain;

public record LoadClaimedEvent(
        String loadId,
        CarrierId carrierId,
        String tenantId
) implements DomainEvent {

    @Override
    public String aggregateId() { return loadId; }
}
