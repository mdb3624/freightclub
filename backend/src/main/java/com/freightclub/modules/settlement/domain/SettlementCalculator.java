package com.freightclub.modules.settlement.domain;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * SettlementCalculator: Domain service for settlement calculation logic.
 *
 * Pure function (no Spring dependencies, no database calls).
 * Calculates commission, quick pay fees, and final payout amounts per US-501.
 *
 * Settlement Formula:
 *   Commission = Gross × CommissionRate ÷ 100
 *   BasePayout = Gross − Commission
 *   QuickPayFee = BasePayout × TierFeePercent ÷ 100
 *   FinalPayout = BasePayout − QuickPayFee
 *
 * Reconciliation Invariant:
 *   Commission + QuickPayFee + FinalPayout = Gross (balance check)
 *
 * Traceability: US-501 AC-1, AC-2, AC-3, AC-5; REQ-5.1 through REQ-5.4
 *
 * No-Lombok Rule: Standard Java patterns only (no Lombok annotations).
 * Domain Purity: Zero dependencies on infrastructure/Spring/JPA.
 * Complexity: Single method under cyclomatic complexity limit.
 */
public class SettlementCalculator {

    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);
    private static final int PERCENT_SCALE = 0;
    private static final RoundingMode ROUNDING_MODE = RoundingMode.HALF_UP;

    /**
     * Calculate settlement breakdown for a delivered load.
     *
     * Validates all inputs and computes commission, quick pay fees, and final payout
     * using the settlement formula. Returns an immutable breakdown that satisfies
     * the reconciliation invariant: Commission + Fee + Payout = Gross.
     *
     * @param grossAmountCents Gross load amount in cents (non-negative)
     * @param commissionRatePercent Commission rate as percentage (e.g., 2.0 for 2%)
     * @param tier Payout tier determining acceleration fee and timeline
     * @return SettlementBreakdown with all calculated amounts and payout timeline
     * @throws IllegalArgumentException if inputs violate domain rules
     */
    public SettlementBreakdown calculate(
        long grossAmountCents,
        BigDecimal commissionRatePercent,
        PayoutTier tier
    ) {
        validateInputs(grossAmountCents, commissionRatePercent, tier);

        long commissionCents = calculateCommission(grossAmountCents, commissionRatePercent);
        long basePayoutCents = grossAmountCents - commissionCents;
        long quickPayFeeCents = calculateQuickPayFee(basePayoutCents, tier);
        long finalPayoutCents = basePayoutCents - quickPayFeeCents;

        return new SettlementBreakdown(
            grossAmountCents,
            commissionCents,
            quickPayFeeCents,
            finalPayoutCents,
            commissionRatePercent,
            tier.getPayoutDays()
        );
    }

    /**
     * Validate all inputs to ensure domain invariants.
     *
     * @throws IllegalArgumentException if any input violates domain rules
     */
    private void validateInputs(
        long grossAmountCents,
        BigDecimal commissionRatePercent,
        PayoutTier tier
    ) {
        if (grossAmountCents < 0) {
            throw new IllegalArgumentException(
                "Gross amount must be non-negative, got: " + grossAmountCents + " cents"
            );
        }
        if (commissionRatePercent == null) {
            throw new IllegalArgumentException("Commission rate cannot be null");
        }
        if (commissionRatePercent.signum() < 0) {
            throw new IllegalArgumentException(
                "Commission rate must be non-negative, got: " + commissionRatePercent + "%"
            );
        }
        if (tier == null) {
            throw new IllegalArgumentException("Payout tier cannot be null");
        }
    }

    /**
     * Calculate platform commission as percentage of gross amount.
     *
     * Commission = Gross × Rate ÷ 100, rounded to nearest cent.
     *
     * @param grossAmountCents Gross amount in cents
     * @param commissionRatePercent Commission rate as percentage
     * @return Commission in cents
     */
    private long calculateCommission(long grossAmountCents, BigDecimal commissionRatePercent) {
        BigDecimal gross = BigDecimal.valueOf(grossAmountCents);
        BigDecimal commission = gross
            .multiply(commissionRatePercent)
            .divide(HUNDRED, PERCENT_SCALE, ROUNDING_MODE);
        return commission.longValue();
    }

    /**
     * Calculate quick pay acceleration fee as percentage of base payout.
     *
     * Base Payout is amount after commission. Quick Pay Fee is then deducted from
     * this base to determine final payout to trucker.
     *
     * Fee = BasePayout × TierFeePercent ÷ 100, rounded to nearest cent.
     *
     * @param basePayoutCents Payout amount after commission deduction
     * @param tier Payout tier (determines fee percentage: 0%, 1%, or 2%)
     * @return Quick pay fee in cents
     */
    private long calculateQuickPayFee(long basePayoutCents, PayoutTier tier) {
        int feePercent = tier.getFeePercent();

        if (feePercent == 0) {
            return 0;
        }

        BigDecimal basePayout = BigDecimal.valueOf(basePayoutCents);
        BigDecimal feePercentBD = BigDecimal.valueOf(feePercent);
        BigDecimal fee = basePayout
            .multiply(feePercentBD)
            .divide(HUNDRED, PERCENT_SCALE, ROUNDING_MODE);

        return fee.longValue();
    }
}
