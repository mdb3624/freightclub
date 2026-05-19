package com.freightclub.modules.shipper.infrastructure.rest.dto;

import com.freightclub.modules.shipper.domain.ShipperProfile;

import java.util.ArrayList;
import java.util.List;

public record CompletenessResponse(
    Integer completenessPercent,
    Boolean isPublishReady,
    List<String> remainingFields
) {
  public static CompletenessResponse from(ShipperProfile profile, int calculatedCompleteness) {
    List<String> remainingFields = new ArrayList<>();

    if (calculatedCompleteness < 80) {
      if (profile.companyName() == null || profile.companyName().isEmpty()) {
        remainingFields.add("companyName");
      }
      if (profile.billingEmail() == null || profile.billingEmail().isEmpty()) {
        remainingFields.add("billingEmail");
      }
      if (profile.phoneNumber() == null || profile.phoneNumber().isEmpty()) {
        remainingFields.add("phoneNumber");
      }
      if (profile.city() == null || profile.city().isEmpty()) {
        remainingFields.add("city");
      }
      if (profile.state() == null || profile.state().isEmpty()) {
        remainingFields.add("state");
      }
      if (profile.zipCode() == null || profile.zipCode().isEmpty()) {
        remainingFields.add("zipCode");
      }
      if ((profile.mcNumber() == null || profile.mcNumber().isEmpty()) &&
          (profile.usdotNumber() == null || profile.usdotNumber().isEmpty())) {
        remainingFields.add("mcNumber or usdotNumber");
      }
      if (profile.logoUrl() == null || profile.logoUrl().isEmpty()) {
        remainingFields.add("logoUrl");
      }
    }

    return new CompletenessResponse(
        calculatedCompleteness,
        calculatedCompleteness >= 80,
        remainingFields
    );
  }
}
