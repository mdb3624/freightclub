package com.freightclub.modules.load.infrastructure.rest.dto;

import com.freightclub.modules.load.domain.LoadAggregate;

import java.math.BigDecimal;

public record LoadResponse(
        String id,
        String tenantId,
        String shipperId,
        String carrierId,
        String status,
        BigDecimal weightLbs,
        String podUrl,
        String cancelReason
) {
    public static LoadResponse from(LoadAggregate a) {
        return new LoadResponse(
                a.getId(),
                a.getTenantId(),
                a.getShipperId(),
                a.getCarrierId() != null ? a.getCarrierId().value() : null,
                a.getStatus().name(),
                a.getWeight().lbs(),
                a.getPodUrl(),
                a.getCancelReason()
        );
    }
}
