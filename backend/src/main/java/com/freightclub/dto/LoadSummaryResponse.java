package com.freightclub.dto;

import com.freightclub.domain.EquipmentType;
import com.freightclub.domain.Load;
import com.freightclub.domain.LoadStatus;
import com.freightclub.domain.PayRateType;
import com.freightclub.domain.PaymentTerms;
import com.freightclub.modules.carrier.application.DieselPriceResolution;

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
        LocalDateTime createdAt,
        BigDecimal shipperAvgStars,   // null if shipper has no ratings yet
        long shipperRatingCount,
        String regionUsed,           // US-854: null if not resolved (e.g. no cost profile)
        String asOfPeriod,           // US-854: null if not resolved or EIA data unavailable
        boolean isFallback           // US-854: true if regionUsed came from the carrier's saved home region, not the load's origin
) {
    public static LoadSummaryResponse from(Load load) {
        return from(load, null, 0L, null);
    }

    public static LoadSummaryResponse from(Load load, Double shipperAvgStars, long shipperRatingCount) {
        return from(load, shipperAvgStars, shipperRatingCount, null);
    }

    public static LoadSummaryResponse from(
            Load load, Double shipperAvgStars, long shipperRatingCount, DieselPriceResolution dieselResolution) {
        BigDecimal avg = shipperAvgStars != null
                ? java.math.BigDecimal.valueOf(shipperAvgStars)
                        .setScale(1, java.math.RoundingMode.HALF_UP)
                : null;
        return new LoadSummaryResponse(
                load.getId(),
                load.getStatus(),
                load.getOriginCity() + ", " + load.getOriginState(),
                load.getDestinationCity() + ", " + load.getDestinationState(),
                load.getDistanceMiles(),
                load.getPickupFrom(),
                load.getEquipmentType(),
                load.getPayRate(),
                load.getPayRateType(),
                load.getPaymentTerms(),
                load.getDeliveryTo(),
                load.getCreatedAt(),
                avg,
                shipperRatingCount,
                dieselResolution != null ? dieselResolution.regionUsed() : null,
                dieselResolution != null ? dieselResolution.asOfPeriod() : null,
                dieselResolution != null && dieselResolution.isFallback()
        );
    }
}
