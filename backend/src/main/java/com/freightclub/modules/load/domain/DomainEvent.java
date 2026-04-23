package com.freightclub.modules.load.domain;

public interface DomainEvent {
    String aggregateId();
    String tenantId();
}
