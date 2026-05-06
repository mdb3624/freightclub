package com.freightclub.modules.shipper.infrastructure.rest;

import com.freightclub.modules.shipper.domain.ShipperReputation;
import com.freightclub.modules.shipper.infrastructure.ShipperReputationEntity;
import java.math.BigDecimal;

public record ShipperReputationResponse(
    String shipperId,
    String paymentSpeedLabel,
    Integer completedLoadCount,
    Boolean isNewShipper,
    Boolean hasHighRiskFlags,
    String riskWarningText) {

  public static ShipperReputationResponse from(ShipperReputationEntity entity) {
    if (entity == null) {
      return null;
    }

    String riskWarning = null;
    if (entity.hasHighRiskFlags()) {
      if (entity.getCancelledLoadCount() > 2) {
        riskWarning = "This shipper has a history of cancellations, which can strand truckers";
      } else if (entity.getOpenDisputeCount() > 2) {
        riskWarning = "This shipper has a history of payment disputes";
      }
    }

    return new ShipperReputationResponse(
        entity.getShipperId(),
        entity.getPaymentSpeedLabel(),
        entity.getCompletedLoadCount(),
        entity.isNewShipper(),
        entity.hasHighRiskFlags(),
        riskWarning);
  }

  public static ShipperReputationResponse from(ShipperReputation domain) {
    if (domain == null) {
      return null;
    }

    String riskWarning = null;
    if (domain.hasHighRiskFlags()) {
      if (domain.getCancelledLoadCount() > 2) {
        riskWarning = "This shipper has a history of cancellations, which can strand truckers";
      } else if (domain.getOpenDisputeCount() > 2) {
        riskWarning = "This shipper has a history of payment disputes";
      }
    }

    return new ShipperReputationResponse(
        domain.getShipperId(),
        domain.getPaymentSpeedLabel(),
        domain.getCompletedLoadCount(),
        domain.isNewShipper(),
        domain.hasHighRiskFlags(),
        riskWarning);
  }
}
