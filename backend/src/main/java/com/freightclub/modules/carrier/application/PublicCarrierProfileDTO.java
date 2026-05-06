package com.freightclub.modules.carrier.application;

import java.util.List;

public record PublicCarrierProfileDTO(
    String truckerId,
    List<CarrierEquipmentDTO> equipment,
    List<CarrierLaneDTO> lanes,
    CarrierAvailabilityDTO availability
) {}
