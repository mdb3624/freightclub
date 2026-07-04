package com.freightclub.dto;

import java.time.OffsetDateTime;

public record PaymentStatusResponse(
        String status,
        OffsetDateTime paidAt,
        long truckerPayoutCents
) {
}
