package com.freightclub.dto;

public record DieselPriceResponse(
        Double eastPrice,
        Double eastDelta,
        Double midwestPrice,
        Double midwestDelta,
        Double southPrice,
        Double southDelta,
        Double rockyPrice,
        Double rockyDelta,
        Double westPrice,
        Double westDelta,
        String period,
        boolean stale,
        boolean available
) {
    public static DieselPriceResponse unavailable() {
        return new DieselPriceResponse(null, null, null, null, null, null, null, null, null, null, null, false, false);
    }

    public DieselPriceResponse withStale(boolean stale) {
        return new DieselPriceResponse(eastPrice, eastDelta, midwestPrice, midwestDelta,
                southPrice, southDelta, rockyPrice, rockyDelta, westPrice, westDelta, period, stale, available);
    }
}
