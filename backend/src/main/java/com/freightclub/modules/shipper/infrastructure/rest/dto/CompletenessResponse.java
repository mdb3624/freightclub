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
      if (profile.getCompanyName() == null || profile.getCompanyName().isEmpty()) {
        remainingFields.add("companyName");
      }
      if (profile.getBillingEmail() == null || profile.getBillingEmail().isEmpty()) {
        remainingFields.add("billingEmail");
      }
      if (profile.getPhoneNumber() == null || profile.getPhoneNumber().isEmpty()) {
        remainingFields.add("phoneNumber");
      }
      if (profile.getCity() == null || profile.getCity().isEmpty()) {
        remainingFields.add("city");
      }
      if (profile.getState() == null || profile.getState().isEmpty()) {
        remainingFields.add("state");
      }
      if (profile.getZipCode() == null || profile.getZipCode().isEmpty()) {
        remainingFields.add("zipCode");
      }
      if ((profile.getMcNumber() == null || profile.getMcNumber().isEmpty()) &&
          (profile.getUsdotNumber() == null || profile.getUsdotNumber().isEmpty())) {
        remainingFields.add("mcNumber or usdotNumber");
      }
      if (profile.getLogoUrl() == null || profile.getLogoUrl().isEmpty()) {
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
