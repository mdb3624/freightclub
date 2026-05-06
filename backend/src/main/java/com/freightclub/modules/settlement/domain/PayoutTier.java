package com.freightclub.modules.settlement.domain;

/**
 * PayoutTier: Enumeration of payout acceleration options.
 * Traceability: US-501 AC-1, AC-2, AC-3; REQ-5.3, REQ-5.4
 */
public enum PayoutTier {
    STANDARD(0, 2),      // 0% fee, 2-3 business days
    QUICK_PAY(1, 1),     // 1% fee, next business day
    ULTRA_FAST(2, 0);    // 2% fee, same day

    private final int feePercent;
    private final int payoutDays;

    PayoutTier(int feePercent, int payoutDays) {
        this.feePercent = feePercent;
        this.payoutDays = payoutDays;
    }

    public int getFeePercent() {
        return feePercent;
    }

    public int getPayoutDays() {
        return payoutDays;
    }
}
