package com.freightclub.dto;

import com.freightclub.domain.EquipmentType;
import com.freightclub.domain.Load;
import com.freightclub.domain.LoadStatus;
import com.freightclub.domain.PayRateType;
import com.freightclub.domain.PaymentTerms;
import com.freightclub.domain.User;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record LoadResponse(
        String id,
        String tenantId,
        String shipperId,
        String truckerId,
        LoadStatus status,
        String origin,
        String originAddress,
        String originZip,
        String destination,
        String destinationAddress,
        String destinationZip,
        BigDecimal distanceMiles,
        LocalDateTime pickupFrom,
        LocalDateTime pickupTo,
        LocalDateTime deliveryFrom,
        LocalDateTime deliveryTo,
        String commodity,
        BigDecimal weightLbs,
        EquipmentType equipmentType,
        BigDecimal payRate,
        PayRateType payRateType,
        PaymentTerms paymentTerms,
        String specialRequirements,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LoadContactInfo shipperContact,
        LoadContactInfo truckerContact
) {
    public static LoadResponse from(Load load) {
        return from(load, null, null);
    }

    public static LoadResponse from(Load load, User shipper, User trucker) {
        return new LoadResponse(
                load.getId(),
                load.getTenantId(),
                load.getShipperId(),
                load.getTruckerId(),
                load.getStatus(),
                load.getOrigin(),
                load.getOriginAddress(),
                load.getOriginZip(),
                load.getDestination(),
                load.getDestinationAddress(),
                load.getDestinationZip(),
                load.getDistanceMiles(),
                load.getPickupFrom(),
                load.getPickupTo(),
                load.getDeliveryFrom(),
                load.getDeliveryTo(),
                load.getCommodity(),
                load.getWeightLbs(),
                load.getEquipmentType(),
                load.getPayRate(),
                load.getPayRateType(),
                load.getPaymentTerms(),
                load.getSpecialRequirements(),
                load.getCreatedAt(),
                load.getUpdatedAt(),
                shipper != null ? LoadContactInfo.fromShipper(shipper) : null,
                trucker != null ? LoadContactInfo.fromTrucker(trucker) : null
        );
    }
}
