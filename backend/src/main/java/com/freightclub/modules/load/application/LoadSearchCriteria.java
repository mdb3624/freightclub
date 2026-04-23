package com.freightclub.modules.load.application;

import com.freightclub.domain.EquipmentType;

import java.math.BigDecimal;

public record LoadSearchCriteria(
        String originCity,
        EquipmentType equipmentType,
        BigDecimal minRate
) {
    public static LoadSearchCriteria empty() {
        return new LoadSearchCriteria(null, null, null);
    }
}
