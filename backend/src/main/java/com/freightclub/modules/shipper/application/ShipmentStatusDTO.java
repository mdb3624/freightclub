package com.freightclub.modules.shipper.application;

import java.math.BigDecimal;

public record ShipmentStatusDTO(
    String loadId,
    String status,
    BigDecimal progress,
    String equipment,
    String carrier,
    BigDecimal rating,
    String destination
) {}
