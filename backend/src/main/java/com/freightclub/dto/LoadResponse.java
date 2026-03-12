package com.freightclub.dto;

import com.freightclub.domain.EquipmentType;
import com.freightclub.domain.Load;
import com.freightclub.domain.LoadStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record LoadResponse(
        String id,
        String tenantId,
        String shipperId,
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
        String specialRequirements,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static LoadResponse from(Load load) {
        return new LoadResponse(
                load.getId(),
                load.getTenantId(),
                load.getShipperId(),
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
                load.getSpecialRequirements(),
                load.getCreatedAt(),
                load.getUpdatedAt()
        );
    }
}
