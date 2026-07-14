package com.freightclub.modules.carrier.application;

import java.math.BigDecimal;

/**
 * US-854: result of resolving a diesel price for a specific load's origin.
 * Computed live per request from EiaFuelPriceService's already-cached data;
 * never persisted.
 */
public record DieselPriceResolution(
    BigDecimal pricePerGallon,
    String regionUsed,
    String asOfPeriod,
    boolean isFallback
) {}
