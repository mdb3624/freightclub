package com.freightclub.modules.settlement.domain;

import java.math.BigDecimal;

/**
 * SettlementBreakdown: Value object for settlement calculation results.
 * Immutable record capturing all settlement amounts and metadata.
 * Traceability: US-501 AC-1, AC-2, AC-3, AC-5; REQ-5.1
 */
public record SettlementBreakdown(
    long grossAmountCents,
    long commissionCents,
    long quickPayFeeCents,
    long finalPayoutCents,
    BigDecimal commissionRatePercent,
    int payoutDateDays
) {
    public SettlementBreakdown {
        // Validation: reconciliation check
        long reconstructed = commissionCents + quickPayFeeCents + finalPayoutCents;
        if (reconstructed != grossAmountCents) {
            throw new IllegalArgumentException(
                "Settlement reconciliation failed: " +
                "commission (" + commissionCents + ") + fee (" + quickPayFeeCents + ") + " +
                "payout (" + finalPayoutCents + ") != gross (" + grossAmountCents + ")"
            );
        }

        // Validation: commission rate should be between 0 and 10%
        if (commissionRatePercent.compareTo(BigDecimal.ZERO) < 0 ||
            commissionRatePercent.compareTo(BigDecimal.TEN) > 0) {
            throw new IllegalArgumentException(
                "Commission rate must be between 0% and 10%, got: " + commissionRatePercent
            );
        }

        // Validation: amounts should be non-negative
        if (grossAmountCents < 0 || commissionCents < 0 || quickPayFeeCents < 0 || finalPayoutCents < 0) {
            throw new IllegalArgumentException("All amounts must be non-negative");
        }

        // Validation: payout days should be 0-3
        if (payoutDateDays < 0 || payoutDateDays > 3) {
            throw new IllegalArgumentException("Payout days must be 0-3, got: " + payoutDateDays);
        }
    }
}
