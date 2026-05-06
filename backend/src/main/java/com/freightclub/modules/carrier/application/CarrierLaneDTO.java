package com.freightclub.modules.carrier.application;

import com.freightclub.modules.carrier.domain.FrequencyPreference;
import com.freightclub.modules.carrier.domain.LaneStatus;
import java.time.OffsetDateTime;

public record CarrierLaneDTO(
    String id,
    String originRegion,
    String destinationRegion,
    Long minRateCents,
    FrequencyPreference frequencyPreference,
    LaneStatus status,
    OffsetDateTime createdAt
) {}
