package com.freightclub.modules.carrier.domain;

import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

public class CarrierAvailability {

    private String id;
    private String tenantId;
    private String truckerId;
    private AvailableDays availableDays;
    private LocalTime availableStartTime;
    private LocalTime availableEndTime;
    private String timeZone;
    private boolean currentlyOnLoad;
    private OffsetDateTime lastUpdatedAt;

    public CarrierAvailability(
        String id,
        String tenantId,
        String truckerId,
        AvailableDays availableDays,
        LocalTime availableStartTime,
        LocalTime availableEndTime,
        String timeZone,
        boolean currentlyOnLoad,
        OffsetDateTime lastUpdatedAt
    ) {
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

    public static CarrierAvailability createNew(
        String tenantId,
        String truckerId,
        AvailableDays availableDays,
        LocalTime availableStartTime,
        LocalTime availableEndTime,
        String timeZone,
        boolean currentlyOnLoad
    ) {
        validateTimeWindow(availableStartTime, availableEndTime);
        validateTimeZone(timeZone);
        if (availableDays == null) {
            throw new IllegalArgumentException("Available days is required");
        }

        return new CarrierAvailability(
            UUID.randomUUID().toString(),
            tenantId,
            truckerId,
            availableDays,
            availableStartTime,
            availableEndTime,
            timeZone,
            currentlyOnLoad,
            OffsetDateTime.now(ZoneOffset.UTC)
        );
    }

    public void updateAvailability(
        AvailableDays availableDays,
        LocalTime availableStartTime,
        LocalTime availableEndTime,
        String timeZone,
        boolean currentlyOnLoad
    ) {
        validateTimeWindow(availableStartTime, availableEndTime);
        validateTimeZone(timeZone);
        this.availableDays = availableDays;
        this.availableStartTime = availableStartTime;
        this.availableEndTime = availableEndTime;
        this.timeZone = timeZone;
        this.currentlyOnLoad = currentlyOnLoad;
        this.lastUpdatedAt = OffsetDateTime.now(ZoneOffset.UTC);
    }

    public void setCurrentlyOnLoad(boolean onLoad) {
        this.currentlyOnLoad = onLoad;
        this.lastUpdatedAt = OffsetDateTime.now(ZoneOffset.UTC);
    }

    private static void validateTimeWindow(LocalTime startTime, LocalTime endTime) {
        if (startTime == null || endTime == null) {
            throw new IllegalArgumentException("Start and end times are required");
        }
        if (!startTime.isBefore(endTime)) {
            throw new IllegalArgumentException("Start time must be before end time");
        }
    }

    private static void validateTimeZone(String timeZone) {
        if (timeZone == null || timeZone.isBlank()) {
            throw new IllegalArgumentException("Time zone is required");
        }
    }

    public String getId() { return id; }
    public String getTenantId() { return tenantId; }
    public String getTruckerId() { return truckerId; }
    public AvailableDays getAvailableDays() { return availableDays; }
    public LocalTime getAvailableStartTime() { return availableStartTime; }
    public LocalTime getAvailableEndTime() { return availableEndTime; }
    public String getTimeZone() { return timeZone; }
    public boolean isCurrentlyOnLoad() { return currentlyOnLoad; }
    public OffsetDateTime getLastUpdatedAt() { return lastUpdatedAt; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CarrierAvailability)) return false;
        CarrierAvailability that = (CarrierAvailability) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }

    @Override
    public String toString() {
        return "CarrierAvailability{" +
                "id='" + id + '\'' +
                ", days=" + availableDays +
                ", hours=" + availableStartTime + "-" + availableEndTime +
                ", timeZone=" + timeZone +
                ", onLoad=" + currentlyOnLoad +
                '}';
    }
}
