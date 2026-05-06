package com.freightclub.modules.carrier.application;

import java.time.OffsetDateTime;

public record BlockedCarrierDTO(
    String id,
    String tenantId,
    String shipperId,
    String truckerId,
    OffsetDateTime blockedAt,
    OffsetDateTime unblockedAt) {}
