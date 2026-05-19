package com.freightclub.modules.shipper.infrastructure.rest.dto;

public record ShipperProfileResponse(
    String id,
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
    String createdAt,
    String updatedAt
) {}
