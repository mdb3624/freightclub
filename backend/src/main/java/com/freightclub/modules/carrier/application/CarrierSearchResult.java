package com.freightclub.modules.carrier.application;

public record CarrierSearchResult(
        String id,
        String firstName,
        String lastName,
        String email,
        String equipmentType
) {}
