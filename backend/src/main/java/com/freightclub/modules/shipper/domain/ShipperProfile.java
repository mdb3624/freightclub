package com.freightclub.modules.shipper.domain;

import java.time.OffsetDateTime;

public record ShipperProfile(
    String id,
    String tenantId,
    String companyName,
    String billingEmail,
    String phoneNumber,
    String city,
    String state,
    String zipCode,
    String mcNumber,
    String usdotNumber,
    String logoUrl,
    Integer completenessPercent,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt,
    OffsetDateTime deletedAt
) {}
