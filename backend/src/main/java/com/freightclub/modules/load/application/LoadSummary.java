package com.freightclub.modules.load.application;

import com.freightclub.domain.EquipmentType;
import com.freightclub.modules.load.domain.LoadStatus;
import com.freightclub.modules.load.domain.Money;

import java.math.BigDecimal;

public record LoadSummary(
        String id,
        String tenantId,
        String shipperId,
        LoadStatus status,
        BigDecimal weightLbs,
        String originCity,
        EquipmentType equipmentType,
        Money payRate
) {}
