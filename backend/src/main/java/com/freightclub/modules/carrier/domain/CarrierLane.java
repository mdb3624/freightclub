package com.freightclub.modules.carrier.domain;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

public class CarrierLane {

    private String id;
    private String tenantId;
    private String truckerId;
    private String originRegion;
    private String destinationRegion;
    private Long minRateCents;
    private FrequencyPreference frequencyPreference;
    private LaneStatus status;
    private OffsetDateTime createdAt;
    private OffsetDateTime deletedAt;

    public CarrierLane(
        String id,
        String tenantId,
        String truckerId,
        String originRegion,
        String destinationRegion,
        Long minRateCents,
        FrequencyPreference frequencyPreference,
        LaneStatus status,
        OffsetDateTime createdAt,
        OffsetDateTime deletedAt
    ) {
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

    public static CarrierLane createNew(
        String tenantId,
        String truckerId,
        String originRegion,
        String destinationRegion,
        Long minRateCents,
        FrequencyPreference frequencyPreference
    ) {
        validateRegions(originRegion, destinationRegion);
        validateRate(minRateCents);
        if (frequencyPreference == null) {
            throw new IllegalArgumentException("Frequency preference is required");
        }

        return new CarrierLane(
            UUID.randomUUID().toString(),
            tenantId,
            truckerId,
            originRegion,
            destinationRegion,
            minRateCents,
            frequencyPreference,
            LaneStatus.ACTIVE,
            OffsetDateTime.now(ZoneOffset.UTC),
            null
        );
    }

    public void updateLane(String originRegion, String destinationRegion, Long minRateCents, FrequencyPreference frequency) {
        if (this.deletedAt != null) {
            throw new IllegalStateException("Cannot update deleted lane");
        }
        validateRegions(originRegion, destinationRegion);
        validateRate(minRateCents);
        this.originRegion = originRegion;
        this.destinationRegion = destinationRegion;
        this.minRateCents = minRateCents;
        this.frequencyPreference = frequency;
    }

    public void softDelete() {
        this.deletedAt = OffsetDateTime.now(ZoneOffset.UTC);
    }

    private static void validateRegions(String origin, String destination) {
        if (origin == null || origin.isBlank()) {
            throw new IllegalArgumentException("Origin region is required");
        }
        if (destination == null || destination.isBlank()) {
            throw new IllegalArgumentException("Destination region is required");
        }
    }

    private static void validateRate(Long minRate) {
        if (minRate != null && minRate <= 0) {
            throw new IllegalArgumentException("Min rate must be positive");
        }
    }

    public String getId() { return id; }
    public String getTenantId() { return tenantId; }
    public String getTruckerId() { return truckerId; }
    public String getOriginRegion() { return originRegion; }
    public String getDestinationRegion() { return destinationRegion; }
    public Long getMinRateCents() { return minRateCents; }
    public FrequencyPreference getFrequencyPreference() { return frequencyPreference; }
    public LaneStatus getStatus() { return status; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getDeletedAt() { return deletedAt; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CarrierLane)) return false;
        CarrierLane that = (CarrierLane) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }

    @Override
    public String toString() {
        return "CarrierLane{" +
                "id='" + id + '\'' +
                ", origin=" + originRegion +
                ", destination=" + destinationRegion +
                ", minRate=" + minRateCents +
                ", status=" + status +
                '}';
    }
}
