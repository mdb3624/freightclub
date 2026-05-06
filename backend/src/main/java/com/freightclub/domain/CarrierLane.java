package com.freightclub.domain;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

public class CarrierLane {

    private String id;
    private String tenantId;
    private String truckerId;
    private String originRegion;
    private String destinationRegion;
    private Long minRateCents; // Rate in cents (e.g., 175 = $1.75)
    private String frequencyPreference; // e.g., "ANY", "WEEKLY", "DAILY"
    private OffsetDateTime createdAt;
    private OffsetDateTime deletedAt;

    public CarrierLane(
        String id,
        String tenantId,
        String truckerId,
        String originRegion,
        String destinationRegion,
        Long minRateCents,
        String frequencyPreference,
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
        this.createdAt = createdAt;
        this.deletedAt = deletedAt;
    }

    public static CarrierLane createNew(
        String tenantId,
        String truckerId,
        String originRegion,
        String destinationRegion,
        Long minRateCents,
        String frequencyPreference
    ) {
        if (originRegion == null || originRegion.isBlank()) {
            throw new IllegalArgumentException("Origin region is required");
        }
        if (destinationRegion == null || destinationRegion.isBlank()) {
            throw new IllegalArgumentException("Destination region is required");
        }

        return new CarrierLane(
            UUID.randomUUID().toString(),
            tenantId,
            truckerId,
            originRegion,
            destinationRegion,
            minRateCents,
            frequencyPreference != null ? frequencyPreference : "ANY",
            OffsetDateTime.now(ZoneOffset.UTC),
            null
        );
    }

    public void softDelete() {
        this.deletedAt = OffsetDateTime.now(ZoneOffset.UTC);
    }

    // Builder pattern for test fixture support
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String tenantId;
        private String truckerId;
        private String originRegion;
        private String destinationRegion;
        private Long minRateCents;
        private String frequencyPreference;

        public Builder id(String id) {
            this.id = id;
            return this;
        }

        public Builder tenantId(String tenantId) {
            this.tenantId = tenantId;
            return this;
        }

        public Builder truckerId(String truckerId) {
            this.truckerId = truckerId;
            return this;
        }

        public Builder originRegion(String originRegion) {
            this.originRegion = originRegion;
            return this;
        }

        public Builder destinationRegion(String destinationRegion) {
            this.destinationRegion = destinationRegion;
            return this;
        }

        public Builder minRateCents(Long minRateCents) {
            this.minRateCents = minRateCents;
            return this;
        }

        public Builder frequencyPreference(String frequencyPreference) {
            this.frequencyPreference = frequencyPreference;
            return this;
        }

        public CarrierLane build() {
            String finalId = id != null ? id : UUID.randomUUID().toString();
            OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
            return new CarrierLane(
                finalId,
                tenantId,
                truckerId,
                originRegion,
                destinationRegion,
                minRateCents,
                frequencyPreference != null ? frequencyPreference : "ANY",
                now,
                null
            );
        }
    }

    // Getters
    public String getId() { return id; }
    public String getTenantId() { return tenantId; }
    public String getTruckerId() { return truckerId; }
    public String getOriginRegion() { return originRegion; }
    public String getDestinationRegion() { return destinationRegion; }
    public Long getMinRateCents() { return minRateCents; }
    public String getFrequencyPreference() { return frequencyPreference; }
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
                '}';
    }
}
