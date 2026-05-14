package com.freightclub.modules.carrier.application;

import com.freightclub.modules.carrier.domain.CarrierAvailability;
import com.freightclub.modules.carrier.domain.CarrierEquipment;
import com.freightclub.modules.carrier.domain.CarrierLane;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CarrierMapper {
    CarrierEquipmentDTO toDto(CarrierEquipment domain);
    CarrierLaneDTO toLaneDto(CarrierLane domain);
    CarrierAvailabilityDTO toAvailabilityDto(CarrierAvailability domain);
}
