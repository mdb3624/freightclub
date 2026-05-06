package com.freightclub.modules.carrier.application;

import java.time.OffsetDateTime;

public record PreferredCarrierDTO(
    String id,
    String tenantId,
    String shipperId,
    String truckerId,
    OffsetDateTime addedAt) {}
