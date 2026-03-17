package com.freightclub.dto;

import com.freightclub.domain.EquipmentType;
import com.freightclub.domain.Load;
import com.freightclub.domain.LoadStatus;
import com.freightclub.domain.PayRateType;
import com.freightclub.domain.PaymentTerms;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record LoadSummaryResponse(
        String id,
        LoadStatus status,
        String origin,
        String destination,
        BigDecimal distanceMiles,
        LocalDateTime pickupFrom,
        EquipmentType equipmentType,
        BigDecimal payRate,
        PayRateType payRateType,
        PaymentTerms paymentTerms,
        LocalDateTime deliveryTo,
        LocalDateTime createdAt
) {
    public static LoadSummaryResponse from(Load load) {
        return new LoadSummaryResponse(
                load.getId(),
                load.getStatus(),
                load.getOrigin(),
                load.getDestination(),
                load.getDistanceMiles(),
                load.getPickupFrom(),
                load.getEquipmentType(),
                load.getPayRate(),
                load.getPayRateType(),
                load.getPaymentTerms(),
                load.getDeliveryTo(),
                load.getCreatedAt()
        );
    }
}
