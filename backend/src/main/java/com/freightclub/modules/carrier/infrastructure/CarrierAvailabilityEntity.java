package com.freightclub.modules.carrier.infrastructure;

import com.freightclub.modules.carrier.domain.AvailableDays;
import com.freightclub.modules.carrier.domain.CarrierAvailability;
import jakarta.persistence.*;
import java.time.LocalTime;
import java.time.OffsetDateTime;

@Entity
@Table(
    name = "carrier_availability",
    indexes = {
        @Index(name = "idx_carrier_availability_tenant", columnList = "tenant_id")
    }
)
public class CarrierAvailabilityEntity {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "tenant_id", nullable = false, length = 36)
    private String tenantId;

    @Column(name = "trucker_id", nullable = false, length = 36, unique = true)
    private String truckerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "available_days", nullable = false)
    private AvailableDays availableDays;

    @Column(name = "available_start_time", nullable = false)
    private LocalTime availableStartTime;

    @Column(name = "available_end_time", nullable = false)
    private LocalTime availableEndTime;

    @Column(name = "time_zone", nullable = false, length = 50)
    private String timeZone;

    @Column(name = "currently_on_load", nullable = false)
    private boolean currentlyOnLoad;

    @Column(name = "last_updated_at", nullable = false)
    private OffsetDateTime lastUpdatedAt;

    public CarrierAvailabilityEntity() {}

    public CarrierAvailabilityEntity(String id, String tenantId, String truckerId, AvailableDays availableDays,
                                    LocalTime availableStartTime, LocalTime availableEndTime, String timeZone,
                                    boolean currentlyOnLoad, OffsetDateTime lastUpdatedAt) {
        this.id = id;
        this.tenantId = tenantId;
        this.truckerId = truckerId;
        this.availableDays = availableDays;
        this.availableStartTime = availableStartTime;
        this.availableEndTime = availableEndTime;
        this.timeZone = timeZone;
        this.currentlyOnLoad = currentlyOnLoad;
        this.lastUpdatedAt = lastUpdatedAt;
    }

    public static CarrierAvailabilityEntity fromDomain(CarrierAvailability domain) {
        return new CarrierAvailabilityEntity(
            domain.getId(),
            domain.getTenantId(),
            domain.getTruckerId(),
            domain.getAvailableDays(),
            domain.getAvailableStartTime(),
            domain.getAvailableEndTime(),
            domain.getTimeZone(),
            domain.isCurrentlyOnLoad(),
            domain.getLastUpdatedAt()
        );
    }

    public CarrierAvailability toDomain() {
        return new CarrierAvailability(
            id, tenantId, truckerId, availableDays, availableStartTime, availableEndTime,
            timeZone, currentlyOnLoad, lastUpdatedAt
        );
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }
    public String getTruckerId() { return truckerId; }
    public void setTruckerId(String truckerId) { this.truckerId = truckerId; }
    public AvailableDays getAvailableDays() { return availableDays; }
    public void setAvailableDays(AvailableDays availableDays) { this.availableDays = availableDays; }
    public LocalTime getAvailableStartTime() { return availableStartTime; }
    public void setAvailableStartTime(LocalTime availableStartTime) { this.availableStartTime = availableStartTime; }
    public LocalTime getAvailableEndTime() { return availableEndTime; }
    public void setAvailableEndTime(LocalTime availableEndTime) { this.availableEndTime = availableEndTime; }
    public String getTimeZone() { return timeZone; }
    public void setTimeZone(String timeZone) { this.timeZone = timeZone; }
    public boolean isCurrentlyOnLoad() { return currentlyOnLoad; }
    public void setCurrentlyOnLoad(boolean currentlyOnLoad) { this.currentlyOnLoad = currentlyOnLoad; }
    public OffsetDateTime getLastUpdatedAt() { return lastUpdatedAt; }
    public void setLastUpdatedAt(OffsetDateTime lastUpdatedAt) { this.lastUpdatedAt = lastUpdatedAt; }
}
