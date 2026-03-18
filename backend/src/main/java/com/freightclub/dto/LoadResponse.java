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
        String originCity,
        String originState,
        String originZip,
        String originAddress1,
        String originAddress2,
        String destinationCity,
        String destinationState,
        String destinationZip,
        String destinationAddress1,
        String destinationAddress2,
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
                load.getOriginCity(),
                load.getOriginState(),
                load.getOriginZip(),
                load.getOriginAddress1(),
                load.getOriginAddress2(),
                load.getDestinationCity(),
                load.getDestinationState(),
                load.getDestinationZip(),
                load.getDestinationAddress1(),
                load.getDestinationAddress2(),
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
