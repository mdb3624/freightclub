package com.freightclub.modules.shipper.infrastructure.rest.dto;

import com.freightclub.modules.shipper.domain.ShipperProfile;

import java.time.OffsetDateTime;

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
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {
  public static ShipperProfileResponse from(ShipperProfile profile) {
    return new ShipperProfileResponse(
        profile.getId(),
        profile.getCompanyName(),
        profile.getBillingEmail(),
        profile.getPhoneNumber(),
        profile.getCity(),
        profile.getState(),
        profile.getZipCode(),
        profile.getMcNumber(),
        profile.getUsdotNumber(),
        profile.getLogoUrl(),
        profile.getCompletenessPercent(),
        profile.getCreatedAt(),
        profile.getUpdatedAt()
    );
  }
}
