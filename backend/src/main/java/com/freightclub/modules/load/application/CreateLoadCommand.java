package com.freightclub.modules.load.application;

import com.freightclub.modules.load.domain.PayRateType;

import java.math.BigDecimal;

public record CreateLoadCommand(
        BigDecimal weightLbs,
        String originState,
        String destState,
        BigDecimal payRate,
        PayRateType payRateType,
        BigDecimal distanceMiles
) {}
