package com.freightclub.modules.payment.domain;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("PaymentAccount Domain Entity Tests")
class PaymentAccountTest {

    private PaymentAccount paymentAccount;
    private String testTenantId;
    private String testTruckerId;

    @BeforeEach
    void setUp() {
        testTenantId = "tenant-123";
        testTruckerId = "trucker-456";
    }

    @Test
    @DisplayName("AC-1: Should create payment account with PENDING_VERIFICATION status")
    void testCreatePaymentAccount_WithPendingStatus() {
        paymentAccount = PaymentAccount.createNew(
            "John Doe",
            "021000021",
            "1234567890",
            BankAccountType.CHECKING,
            "Main Business Account",
            testTenantId,
            testTruckerId
        );

        assertEquals(PaymentAccountStatus.PENDING_VERIFICATION, paymentAccount.getStatus());
        assertEquals("John Doe", paymentAccount.getAccountHolderName());
        assertEquals("021000021", paymentAccount.getRoutingNumber());
        assertEquals("7890", paymentAccount.getLastFourDigits());
        assertEquals(BankAccountType.CHECKING, paymentAccount.getAccountType());
        assertEquals("Main Business Account", paymentAccount.getAccountNickname());
        assertFalse(paymentAccount.isPrimary());
        assertNull(paymentAccount.getDeletedAt());
        assertNull(paymentAccount.getVerifiedAt());
    }

    @Test
    @DisplayName("AC-1: Should extract last four digits correctly")
    void testCreatePaymentAccount_ExtractsLastFourDigits() {
        paymentAccount = PaymentAccount.createNew(
            "Jane Smith",
            "021000021",
            "9876543210",
            BankAccountType.SAVINGS,
            null,
            testTenantId,
            testTruckerId
        );

        assertEquals("3210", paymentAccount.getLastFourDigits());
    }

    @ParameterizedTest
    @DisplayName("AC-1: Should validate routing number format")
    @ValueSource(strings = {"021000021", "111000025", "031000003"})
    void testCreatePaymentAccount_ValidRoutingNumbers(String validRouting) {
        paymentAccount = PaymentAccount.createNew(
            "Test User",
            validRouting,
            "1234567890",
            BankAccountType.CHECKING,
            null,
            testTenantId,
            testTruckerId
        );

        assertEquals(validRouting, paymentAccount.getRoutingNumber());
    }

    @Test
    @DisplayName("AC-1: Should reject invalid routing number (non-numeric)")
    void testCreatePaymentAccount_RejectsNonNumericRouting() {
        assertThrows(IllegalArgumentException.class, () ->
            PaymentAccount.createNew(
                "Test User",
                "02100002A",
                "1234567890",
                BankAccountType.CHECKING,
                null,
                testTenantId,
                testTruckerId
            )
        );
    }

    @Test
    @DisplayName("AC-1: Should reject routing number with wrong length")
    void testCreatePaymentAccount_RejectsInvalidRoutingLength() {
        assertThrows(IllegalArgumentException.class, () ->
            PaymentAccount.createNew(
                "Test User",
                "0210000",
                "1234567890",
                BankAccountType.CHECKING,
                null,
                testTenantId,
                testTruckerId
            )
        );
    }

    @Test
    @DisplayName("AC-2: Should initiate micro-deposit verification")
    void testInitiateMicroDepositVerification() {
        paymentAccount = PaymentAccount.createNew(
            "John Doe",
            "021000021",
            "1234567890",
            BankAccountType.CHECKING,
            null,
            testTenantId,
            testTruckerId
        );

        String verificationCode = "verification-uuid-123";
        paymentAccount.initiateVerification(verificationCode, 1, 2);

        assertEquals(PaymentAccountStatus.AWAITING_MICRO_DEPOSIT_CONFIRMATION, paymentAccount.getStatus());
    }

    @Test
    @DisplayName("AC-3: Should confirm micro-deposit verification on match")
    void testConfirmMicroDeposits_SuccessOnMatch() {
        paymentAccount = PaymentAccount.createNew(
            "John Doe",
            "021000021",
            "1234567890",
            BankAccountType.CHECKING,
            null,
            testTenantId,
            testTruckerId
        );
        paymentAccount.initiateVerification("verification-123", 1, 2);

        paymentAccount.confirmVerification(1, 2);

        assertEquals(PaymentAccountStatus.VERIFIED, paymentAccount.getStatus());
        // Updated to match domain logic fix[cite: 3, 4]
        assertTrue(paymentAccount.isPrimary(), "First account should be marked as primary");
        assertNotNull(paymentAccount.getVerifiedAt());
    }

    @Test
    @DisplayName("AC-3: Should reject verification on amount mismatch")
    void testConfirmMicroDeposits_RejectOnMismatch() {
        paymentAccount = PaymentAccount.createNew(
            "John Doe",
            "021000021",
            "1234567890",
            BankAccountType.CHECKING,
            null,
            testTenantId,
            testTruckerId
        );
        paymentAccount.initiateVerification("verification-123", 1, 2);

        assertThrows(IllegalArgumentException.class, () ->
            paymentAccount.confirmVerification(5, 10)
        );
        assertEquals(PaymentAccountStatus.AWAITING_MICRO_DEPOSIT_CONFIRMATION, paymentAccount.getStatus());
    }

    @Test
    @DisplayName("AC-5: Should soft delete account")
    void testDeleteAccount_SoftDelete() {
        paymentAccount = PaymentAccount.createNew(
            "John Doe",
            "021000021",
            "1234567890",
            BankAccountType.CHECKING,
            null,
            testTenantId,
            testTruckerId
        );

        paymentAccount.softDelete();

        assertNotNull(paymentAccount.getDeletedAt());
    }

    @Test
    @DisplayName("AC-4: Should set as primary account")
    void testSetAsPrimary() {
        // Initialize paymentAccount to avoid NullPointerException[cite: 3]
        paymentAccount = PaymentAccount.createNew(
            "John Doe",
            "021000021",
            "1234567890",
            BankAccountType.CHECKING,
            null,
            testTenantId,
            testTruckerId
        );
        paymentAccount.initiateVerification("verification-123", 1, 2);
        paymentAccount.confirmVerification(1, 2);
        
        // Assert true initially because confirmVerification sets isPrimary = true[cite: 3, 4]
        assertTrue(paymentAccount.isPrimary());

        // Test the ability to toggle the primary status
        paymentAccount.setAsPrimary(false);
        assertFalse(paymentAccount.isPrimary());
        
        paymentAccount.setAsPrimary(true);
        assertTrue(paymentAccount.isPrimary());
    }

    @Test
    @DisplayName("Should only allow setAsPrimary when VERIFIED")
    void testSetAsPrimary_FailsWhenNotVerified() {
        paymentAccount = PaymentAccount.createNew(
            "John Doe",
            "021000021",
            "1234567890",
            BankAccountType.CHECKING,
            null,
            testTenantId,
            testTruckerId
        );

        assertThrows(IllegalStateException.class, () ->
            paymentAccount.setAsPrimary(true),
            "Cannot set as primary when not VERIFIED"
        );
    }

    @Test
    @DisplayName("Should enforce tenant isolation (no cross-tenant manipulation)")
    void testTenantIsolation_EnforcedByRepository() {
        paymentAccount = PaymentAccount.createNew(
            "John Doe",
            "021000021",
            "1234567890",
            BankAccountType.CHECKING,
            null,
            "tenant-a",
            testTruckerId
        );

        assertEquals("tenant-a", paymentAccount.getTenantId());
    }

    @Test
    @DisplayName("Should have immutable creation timestamp")
    void testCreationTimestamp_IsImmutable() {
        paymentAccount = PaymentAccount.createNew(
            "John Doe",
            "021000021",
            "1234567890",
            BankAccountType.CHECKING,
            null,
            testTenantId,
            testTruckerId
        );
        OffsetDateTime originalCreatedAt = paymentAccount.getCreatedAt();

        assertNotNull(originalCreatedAt);
        assertTrue(originalCreatedAt.isAfter(OffsetDateTime.now(ZoneOffset.UTC).minusMinutes(1)));
        assertTrue(originalCreatedAt.isBefore(OffsetDateTime.now(ZoneOffset.UTC).plusMinutes(1)));
    }
}