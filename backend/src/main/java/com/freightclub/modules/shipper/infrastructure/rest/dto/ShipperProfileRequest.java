package com.freightclub.modules.shipper.infrastructure.rest.dto;

public record ShipperProfileRequest(
    String companyName,
    String billingEmail,
    String phoneNumber,
    String city,
    String state,
    String zipCode,
    String mcNumber,
    String usdotNumber,
    String logoUrl
) {}
