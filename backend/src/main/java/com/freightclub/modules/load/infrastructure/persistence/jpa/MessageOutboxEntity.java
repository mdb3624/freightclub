package com.freightclub.modules.load.infrastructure.persistence.jpa;

import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "message_outbox")
public class MessageOutboxEntity {

    @Id
    private String id;

    @Column(name = "aggregate_id", nullable = false)
    private String aggregateId;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(name = "event_type", nullable = false)
    private String eventType;

    // Stored as TEXT in H2 (test) and JSONB in PostgreSQL (production via Flyway migration)
    @Column(nullable = false, columnDefinition = "TEXT")
    private String payload;

    @Column(nullable = false)
    private String status;

    @Column(name = "occurred_at", nullable = false)
    private OffsetDateTime occurredAt;

    @Column(name = "processed_at")
    private OffsetDateTime processedAt;

    protected MessageOutboxEntity() {}

    public MessageOutboxEntity(String aggregateId, String tenantId, String eventType, String payload) {
        this.id = UUID.randomUUID().toString();
        this.aggregateId = aggregateId;
        this.tenantId = tenantId;
        this.eventType = eventType;
        this.payload = payload;
        this.status = "PENDING";
        this.occurredAt = OffsetDateTime.now();
    }

    public String getId()            { return id; }
    public String getAggregateId()   { return aggregateId; }
    public String getTenantId()      { return tenantId; }
    public String getEventType()     { return eventType; }
    public String getPayload()       { return payload; }
    public String getStatus()        { return status; }
    public OffsetDateTime getOccurredAt()  { return occurredAt; }
    public OffsetDateTime getProcessedAt() { return processedAt; }

    public void markProcessed() {
        this.status = "PROCESSED";
        this.processedAt = OffsetDateTime.now();
    }
}
