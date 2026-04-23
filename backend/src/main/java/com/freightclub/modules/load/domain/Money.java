package com.freightclub.modules.load.domain;

import java.math.BigDecimal;

public record Money(BigDecimal amount) {

    public Money {
        if (amount == null) throw new LoadDomainException("Money amount cannot be null");
        if (amount.compareTo(BigDecimal.ZERO) < 0) throw new LoadDomainException("Money amount cannot be negative");
    }

    public static Money of(BigDecimal amount) {
        return new Money(amount);
    }

    public static Money of(long cents) {
        return new Money(BigDecimal.valueOf(cents));
    }
}
