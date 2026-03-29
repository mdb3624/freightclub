package com.freightclub.dto;

import com.freightclub.domain.EquipmentType;

import java.time.LocalDate;

public record LoadBoardFilter(
        String originState,
        String destinationState,
        EquipmentType equipmentType,
        LocalDate pickupDate,
        LocalDate deliveryDate,
        String sortBy,
        String sortDir
) {}
