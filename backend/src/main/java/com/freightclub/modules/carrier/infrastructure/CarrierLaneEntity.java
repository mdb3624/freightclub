package com.freightclub.modules.carrier.infrastructure;

import com.freightclub.modules.carrier.domain.CarrierLane;
import com.freightclub.modules.carrier.domain.FrequencyPreference;
import com.freightclub.modules.carrier.domain.LaneStatus;
import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(
    name = "carrier_lanes",
    indexes = {
        @Index(name = "idx_carrier_lanes_regions", columnList = "origin_region, destination_region, tenant_id, deleted_at"),
        @Index(name = "idx_carrier_lanes_trucker", columnList = "tenant_id, trucker_id, deleted_at")
    }
)
public class CarrierLaneEntity {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "tenant_id", nullable = false, length = 36)
    private String tenantId;

    @Column(name = "trucker_id", nullable = false, length = 36)
    private String truckerId;

    @Column(name = "origin_region", nullable = false, length = 50)
    private String originRegion;

    @Column(name = "destination_region", nullable = false, length = 50)
    private String destinationRegion;

    @Column(name = "min_rate_cents")
    private Long minRateCents;

    @Enumerated(EnumType.STRING)
    @Column(name = "frequency_preference", nullable = false)
    private FrequencyPreference frequencyPreference;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private LaneStatus status;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;

    public CarrierLaneEntity() {}

    public CarrierLaneEntity(String id, String tenantId, String truckerId, String originRegion,
                            String destinationRegion, Long minRateCents, FrequencyPreference frequencyPreference,
                            LaneStatus status, OffsetDateTime createdAt, OffsetDateTime deletedAt) {
        this.id = id;
        this.tenantId = tenantId;
        this.truckerId = truckerId;
        this.originRegion = originRegion;
        this.destinationRegion = destinationRegion;
        this.minRateCents = minRateCents;
        this.frequencyPreference = frequencyPreference;
        this.status = status;
        this.createdAt = createdAt;
        this.deletedAt = deletedAt;
    }

    public static CarrierLaneEntity fromDomain(CarrierLane domain) {
        return new CarrierLaneEntity(
            domain.getId(),
            domain.getTenantId(),
            domain.getTruckerId(),
            domain.getOriginRegion(),
            domain.getDestinationRegion(),
            domain.getMinRateCents(),
            domain.getFrequencyPreference(),
            domain.getStatus(),
            domain.getCreatedAt(),
            domain.getDeletedAt()
        );
    }

    public CarrierLane toDomain() {
        return new CarrierLane(
            id, tenantId, truckerId, originRegion, destinationRegion,
            minRateCents, frequencyPreference, status, createdAt, deletedAt
        );
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }
    public String getTruckerId() { return truckerId; }
    public void setTruckerId(String truckerId) { this.truckerId = truckerId; }
    public String getOriginRegion() { return originRegion; }
    public void setOriginRegion(String originRegion) { this.originRegion = originRegion; }
    public String getDestinationRegion() { return destinationRegion; }
    public void setDestinationRegion(String destinationRegion) { this.destinationRegion = destinationRegion; }
    public Long getMinRateCents() { return minRateCents; }
    public void setMinRateCents(Long minRateCents) { this.minRateCents = minRateCents; }
    public FrequencyPreference getFrequencyPreference() { return frequencyPreference; }
    public void setFrequencyPreference(FrequencyPreference frequencyPreference) { this.frequencyPreference = frequencyPreference; }
    public LaneStatus getStatus() { return status; }
    public void setStatus(LaneStatus status) { this.status = status; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getDeletedAt() { return deletedAt; }
    public void setDeletedAt(OffsetDateTime deletedAt) { this.deletedAt = deletedAt; }
}
