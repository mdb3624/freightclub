package com.freightclub.modules.carrier.application;

import com.freightclub.modules.carrier.domain.AvailableDays;
import java.time.LocalTime;
import java.time.OffsetDateTime;

public record CarrierAvailabilityDTO(
    String id,
    AvailableDays availableDays,
    LocalTime availableStartTime,
    LocalTime availableEndTime,
    String timeZone,
    boolean currentlyOnLoad,
    OffsetDateTime lastUpdatedAt
) {}
