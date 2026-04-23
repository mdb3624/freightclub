package com.freightclub.modules.load.domain;

import java.math.BigDecimal;

public record Weight(BigDecimal lbs) {

    public Weight {
        if (lbs == null || lbs.compareTo(BigDecimal.ZERO) <= 0) {
            throw new LoadDomainException("Weight must be greater than zero");
        }
    }

    public static Weight of(BigDecimal lbs) {
        return new Weight(lbs);
    }
}
