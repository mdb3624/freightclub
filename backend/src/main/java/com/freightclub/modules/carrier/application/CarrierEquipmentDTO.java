package com.freightclub.modules.carrier.application;

import com.freightclub.modules.carrier.domain.EquipmentCondition;
import com.freightclub.modules.carrier.domain.EquipmentStatus;
import com.freightclub.modules.carrier.domain.EquipmentType;
import java.time.OffsetDateTime;

public record CarrierEquipmentDTO(
    String id,
    EquipmentType equipmentType,
    int lengthFeet,
    int widthFeet,
    int heightFeet,
    long capacityLbs,
    EquipmentCondition equipmentCondition,
    String yearModel,
    EquipmentStatus status,
    OffsetDateTime createdAt
) {
}
