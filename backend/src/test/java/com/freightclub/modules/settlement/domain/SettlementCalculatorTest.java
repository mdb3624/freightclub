package com.freightclub.modules.settlement.domain;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

/**
 * RED PHASE: JUnit test for SettlementCalculator (US-501)
 * Tests Quick Pay settlement calculation logic per AC-1, AC-2, AC-3, AC-5.
 * This test FAILS because SettlementCalculator doesn't exist yet.
 *
 * Domain Service: Pure function (no Spring dependencies, no DB calls)
 * Traceability: US-501 AC-1, AC-2, AC-3, AC-5; REQ-5.1, REQ-5.2, REQ-5.3, REQ-5.4
 */
@DisplayName("SettlementCalculator: Quick Pay Settlement Domain Service")
class SettlementCalculatorTest {

    private SettlementCalculator calculator;

    @BeforeEach
    void setup() {
        calculator = new SettlementCalculator();
    }

    // ========================================================================
    // AC-1: Standard Settlement (2-3 Business Days) — Zero Fee
    // ========================================================================

    @Test
    @DisplayName("AC-1: Standard settlement calculates 2% commission, zero quick pay fee")
    void testStandardSettlement_ZeroFee() {
        // Given: $1,000 load with standard 2% commission
        long grossCents = 100000; // $1,000.00
        BigDecimal commissionRate = BigDecimal.valueOf(2.0);
        PayoutTier tier = PayoutTier.STANDARD;

        // When: calculating settlement breakdown
        SettlementBreakdown breakdown = calculator.calculate(
            grossCents,
            commissionRate,
            tier
        );

        // Then: commission = $20, no quick pay fee, payout = $980
        assertEquals(100000, breakdown.grossAmountCents(), "Gross should be $1,000.00");
        assertEquals(2000, breakdown.commissionCents(), "Commission should be $20.00 (2%)");
        assertEquals(0, breakdown.quickPayFeeCents(), "Standard tier has 0% fee");
        assertEquals(98000, breakdown.finalPayoutCents(), "Payout should be $980.00");
        assertEquals(commissionRate, breakdown.commissionRatePercent(), "Commission rate captured");
    }

    @Test
    @DisplayName("AC-1: Standard settlement payout date is 2-3 business days")
    void testStandardSettlement_PayoutTiming() {
        // When: calculating payout date for standard tier
        SettlementBreakdown breakdown = calculator.calculate(100000, BigDecimal.valueOf(2.0), PayoutTier.STANDARD);

        // Then: payout date is 2-3 business days from now
        assertTrue(breakdown.payoutDateDays() >= 2 && breakdown.payoutDateDays() <= 3,
            "Standard payout should be 2-3 business days");
    }

    // ========================================================================
    // AC-2: Quick Pay Settlement (Next Business Day) — 1% Fee
    // ========================================================================

    @Test
    @DisplayName("AC-2: Quick Pay settlement deducts 1% fee from base payout")
    void testQuickPaySettlement_1PercentFee() {
        // Given: $1,000 load with Quick Pay tier
        long grossCents = 100000; // $1,000.00
        BigDecimal commissionRate = BigDecimal.valueOf(2.0);
        PayoutTier tier = PayoutTier.QUICK_PAY;

        // When: calculating settlement breakdown
        SettlementBreakdown breakdown = calculator.calculate(
            grossCents,
            commissionRate,
            tier
        );

        // Then: commission = $20, quick pay fee = 1% of $980 = $9.80, payout = $970.20
        assertEquals(100000, breakdown.grossAmountCents(), "Gross should be $1,000.00");
        assertEquals(2000, breakdown.commissionCents(), "Commission should be $20.00 (2%)");
        assertEquals(980, breakdown.quickPayFeeCents(), "Quick Pay fee should be $9.80 (1% of base)");
        assertEquals(97020, breakdown.finalPayoutCents(), "Payout should be $970.20");
    }

    @Test
    @DisplayName("AC-2: Quick Pay fee is 1% of base payout (after commission)")
    void testQuickPaySettlement_FeeCalculation() {
        // Given: arbitrary load amount
        long grossCents = 500000; // $5,000.00
        BigDecimal commissionRate = BigDecimal.valueOf(2.0);
        PayoutTier tier = PayoutTier.QUICK_PAY;

        // When: calculating settlement
        SettlementBreakdown breakdown = calculator.calculate(
            grossCents,
            commissionRate,
            tier
        );

        // Then: verify fee is 1% of (gross - commission)
        long basePayoutCents = 500000 - 10000; // $4,900.00 after 2% commission
        long expectedFee = 4900; // 1% of $4,900
        assertEquals(expectedFee, breakdown.quickPayFeeCents(), "Fee must be 1% of base payout");
    }

    @Test
    @DisplayName("AC-2: Quick Pay payout date is next business day (1 day)")
    void testQuickPaySettlement_PayoutTiming() {
        // When: calculating payout date for quick pay tier
        SettlementBreakdown breakdown = calculator.calculate(100000, BigDecimal.valueOf(2.0), PayoutTier.QUICK_PAY);

        // Then: payout date is 1 business day
        assertEquals(1, breakdown.payoutDateDays(), "Quick Pay payout should be 1 business day");
    }

    // ========================================================================
    // AC-3: Ultra-Fast Settlement (Same Day) — 2% Fee
    // ========================================================================

    @Test
    @DisplayName("AC-3: Ultra-Fast settlement deducts 2% fee from base payout")
    void testUltraFastSettlement_2PercentFee() {
        // Given: $1,000 load with Ultra-Fast tier
        long grossCents = 100000; // $1,000.00
        BigDecimal commissionRate = BigDecimal.valueOf(2.0);
        PayoutTier tier = PayoutTier.ULTRA_FAST;

        // When: calculating settlement breakdown
        SettlementBreakdown breakdown = calculator.calculate(
            grossCents,
            commissionRate,
            tier
        );

        // Then: commission = $20, ultra-fast fee = 2% of $980 = $19.60, payout = $960.40
        assertEquals(100000, breakdown.grossAmountCents(), "Gross should be $1,000.00");
        assertEquals(2000, breakdown.commissionCents(), "Commission should be $20.00 (2%)");
        assertEquals(1960, breakdown.quickPayFeeCents(), "Ultra-Fast fee should be $19.60 (2% of base)");
        assertEquals(96040, breakdown.finalPayoutCents(), "Payout should be $960.40");
    }

    @Test
    @DisplayName("AC-3: Ultra-Fast fee is 2% of base payout (after commission)")
    void testUltraFastSettlement_FeeCalculation() {
        // Given: arbitrary load amount
        long grossCents = 750000; // $7,500.00
        BigDecimal commissionRate = BigDecimal.valueOf(2.0);
        PayoutTier tier = PayoutTier.ULTRA_FAST;

        // When: calculating settlement
        SettlementBreakdown breakdown = calculator.calculate(
            grossCents,
            commissionRate,
            tier
        );

        // Then: verify fee is 2% of (gross - commission)
        long basePayoutCents = 750000 - 15000; // $7,350.00 after 2% commission
        long expectedFee = 14700; // 2% of $7,350
        assertEquals(expectedFee, breakdown.quickPayFeeCents(), "Fee must be 2% of base payout");
    }

    @Test
    @DisplayName("AC-3: Ultra-Fast payout date is same day (0 days)")
    void testUltraFastSettlement_PayoutTiming() {
        // When: calculating payout date for ultra-fast tier
        SettlementBreakdown breakdown = calculator.calculate(100000, BigDecimal.valueOf(2.0), PayoutTier.ULTRA_FAST);

        // Then: payout date is same day
        assertEquals(0, breakdown.payoutDateDays(), "Ultra-Fast payout should be same day");
    }

    // ========================================================================
    // AC-5: Tenant Commission Override Support
    // ========================================================================

    @Test
    @DisplayName("AC-5: Tenant override applies custom commission rate (1.75%)")
    void testTenantOverride_1Percent75() {
        // Given: $1,000 load with tenant override of 1.75% (volume discount)
        long grossCents = 100000; // $1,000.00
        BigDecimal customCommissionRate = BigDecimal.valueOf(1.75);
        PayoutTier tier = PayoutTier.STANDARD;

        // When: calculating settlement with custom rate
        SettlementBreakdown breakdown = calculator.calculate(
            grossCents,
            customCommissionRate,
            tier
        );

        // Then: commission = $17.50 (1.75%), payout = $982.50
        assertEquals(100000, breakdown.grossAmountCents(), "Gross should be $1,000.00");
        assertEquals(1750, breakdown.commissionCents(), "Commission should be $17.50 (1.75%)");
        assertEquals(0, breakdown.quickPayFeeCents(), "Standard tier has 0% fee");
        assertEquals(98250, breakdown.finalPayoutCents(), "Payout should be $982.50");
        assertEquals(customCommissionRate, breakdown.commissionRatePercent(), "Custom rate captured");
    }

    @Test
    @DisplayName("AC-5: Tenant override + Quick Pay tier compounds correctly")
    void testTenantOverride_WithQuickPayTier() {
        // Given: $1,000 load with 1.75% commission override + Quick Pay
        long grossCents = 100000; // $1,000.00
        BigDecimal customCommissionRate = BigDecimal.valueOf(1.75);
        PayoutTier tier = PayoutTier.QUICK_PAY;

        // When: calculating settlement
        SettlementBreakdown breakdown = calculator.calculate(
            grossCents,
            customCommissionRate,
            tier
        );

        // Then: commission = $17.50, base = $982.50, fee = 1% of base = $9.83, payout = $972.67
        long expectedCommission = 1750;
        long expectedBase = 100000 - expectedCommission; // $982.50
        long expectedFee = 983; // 1% of $982.50 (rounded)
        long expectedPayout = expectedBase - expectedFee;

        assertEquals(expectedCommission, breakdown.commissionCents(), "Commission with override");
        assertEquals(expectedFee, breakdown.quickPayFeeCents(), "Fee based on custom commission");
        assertEquals(expectedPayout, breakdown.finalPayoutCents(), "Final payout with override and fee");
    }

    @Test
    @DisplayName("AC-5: Tenant override at minimum boundary (1.5%)")
    void testTenantOverride_MinimumRate() {
        // Given: minimum allowed override rate (1.5%)
        long grossCents = 100000;
        BigDecimal minRate = BigDecimal.valueOf(1.5);
        PayoutTier tier = PayoutTier.STANDARD;

        // When: calculating settlement
        SettlementBreakdown breakdown = calculator.calculate(grossCents, minRate, tier);

        // Then: commission = $15, payout = $985
        assertEquals(1500, breakdown.commissionCents(), "Minimum rate is 1.5%");
        assertEquals(98500, breakdown.finalPayoutCents(), "Payout = $1,000 - $15");
    }

    @Test
    @DisplayName("AC-5: Tenant override at maximum boundary (5.0%)")
    void testTenantOverride_MaximumRate() {
        // Given: maximum allowed override rate (5.0%)
        long grossCents = 100000;
        BigDecimal maxRate = BigDecimal.valueOf(5.0);
        PayoutTier tier = PayoutTier.STANDARD;

        // When: calculating settlement
        SettlementBreakdown breakdown = calculator.calculate(grossCents, maxRate, tier);

        // Then: commission = $50, payout = $950
        assertEquals(5000, breakdown.commissionCents(), "Maximum rate is 5.0%");
        assertEquals(95000, breakdown.finalPayoutCents(), "Payout = $1,000 - $50");
    }

    // ========================================================================
    // Reconciliation & Atomicity
    // ========================================================================

    @Test
    @DisplayName("Reconciliation: gross = commission + quick_pay_fee + final_payout")
    void testReconciliation_StandardTier() {
        // Given: any settlement
        long grossCents = 250000;
        BigDecimal commissionRate = BigDecimal.valueOf(2.0);
        SettlementBreakdown breakdown = calculator.calculate(grossCents, commissionRate, PayoutTier.STANDARD);

        // Then: gross = commission + fee + payout (balance check)
        long reconstructed = breakdown.commissionCents() + breakdown.quickPayFeeCents() + breakdown.finalPayoutCents();
        assertEquals(grossCents, reconstructed, "Reconciliation failed: amounts don't add up");
    }

    @Test
    @DisplayName("Reconciliation: gross = commission + quick_pay_fee + final_payout (Quick Pay)")
    void testReconciliation_QuickPayTier() {
        // Given: Quick Pay settlement
        long grossCents = 500000;
        BigDecimal commissionRate = BigDecimal.valueOf(2.0);
        SettlementBreakdown breakdown = calculator.calculate(grossCents, commissionRate, PayoutTier.QUICK_PAY);

        // Then: reconciliation check passes
        long reconstructed = breakdown.commissionCents() + breakdown.quickPayFeeCents() + breakdown.finalPayoutCents();
        assertEquals(grossCents, reconstructed, "Quick Pay reconciliation failed");
    }

    @Test
    @DisplayName("Reconciliation: gross = commission + quick_pay_fee + final_payout (Ultra-Fast)")
    void testReconciliation_UltraFastTier() {
        // Given: Ultra-Fast settlement
        long grossCents = 1000000;
        BigDecimal commissionRate = BigDecimal.valueOf(2.0);
        SettlementBreakdown breakdown = calculator.calculate(grossCents, commissionRate, PayoutTier.ULTRA_FAST);

        // Then: reconciliation check passes
        long reconstructed = breakdown.commissionCents() + breakdown.quickPayFeeCents() + breakdown.finalPayoutCents();
        assertEquals(grossCents, reconstructed, "Ultra-Fast reconciliation failed");
    }

    // ========================================================================
    // Edge Cases
    // ========================================================================

    @Test
    @DisplayName("Edge case: Minimum load amount ($0.01)")
    void testEdgeCase_MinimalAmount() {
        // Given: minimum load amount
        long grossCents = 1; // $0.01
        BigDecimal commissionRate = BigDecimal.valueOf(2.0);
        PayoutTier tier = PayoutTier.STANDARD;

        // When: calculating settlement (should not throw)
        SettlementBreakdown breakdown = calculator.calculate(grossCents, commissionRate, tier);

        // Then: calculation succeeds
        assertNotNull(breakdown, "Calculation should not fail for minimum amount");
        assertTrue(breakdown.finalPayoutCents() >= 0, "Final payout should be non-negative");
    }

    @Test
    @DisplayName("Edge case: Large load amount ($100,000)")
    void testEdgeCase_LargeAmount() {
        // Given: large load amount
        long grossCents = 10000000; // $100,000.00
        BigDecimal commissionRate = BigDecimal.valueOf(2.0);
        PayoutTier tier = PayoutTier.QUICK_PAY;

        // When: calculating settlement
        SettlementBreakdown breakdown = calculator.calculate(grossCents, commissionRate, tier);

        // Then: no overflow, reconciliation passes
        long reconstructed = breakdown.commissionCents() + breakdown.quickPayFeeCents() + breakdown.finalPayoutCents();
        assertEquals(grossCents, reconstructed, "Large amount reconciliation failed");
    }

    @Test
    @DisplayName("Edge case: Zero commission rate (should not occur, but handled gracefully)")
    void testEdgeCase_ZeroCommission() {
        // Given: zero commission (edge case, unlikely in practice)
        long grossCents = 100000;
        BigDecimal zeroCommission = BigDecimal.ZERO;
        PayoutTier tier = PayoutTier.STANDARD;

        // When: calculating settlement
        SettlementBreakdown breakdown = calculator.calculate(grossCents, zeroCommission, tier);

        // Then: commission = $0, payout = $100,000
        assertEquals(0, breakdown.commissionCents(), "Zero commission = $0");
        assertEquals(grossCents, breakdown.finalPayoutCents(), "Full amount paid out");
    }
}
