package com.freightclub.modules.load.domain;

import java.util.UUID;

public record CarrierId(String value) {

    public CarrierId {
        if (value == null || value.isBlank()) {
            throw new LoadDomainException("CarrierId must not be blank");
        }
    }

    public static CarrierId of(String value) {
        return new CarrierId(value);
    }

    public static CarrierId newId() {
        return new CarrierId(UUID.randomUUID().toString());
    }
}
