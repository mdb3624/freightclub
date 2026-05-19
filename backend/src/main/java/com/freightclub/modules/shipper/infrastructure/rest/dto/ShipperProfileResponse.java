package com.freightclub.modules.shipper.infrastructure.rest.dto;

import com.freightclub.modules.shipper.domain.ShipperProfile;

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
) {
  public static ShipperProfileResponse from(ShipperProfile profile) {
    return new ShipperProfileResponse(
        profile.id(),
        profile.companyName(),
        profile.billingEmail(),
        profile.phoneNumber(),
        profile.city(),
        profile.state(),
        profile.zipCode(),
        profile.mcNumber(),
        profile.usdotNumber(),
        profile.logoUrl(),
        profile.completenessPercent(),
        profile.createdAt() != null ? profile.createdAt().toString() : null,
        profile.updatedAt() != null ? profile.updatedAt().toString() : null
    );
  }
}
