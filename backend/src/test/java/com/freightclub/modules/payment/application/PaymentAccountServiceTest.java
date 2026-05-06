package com.freightclub.modules.payment.application;

import com.freightclub.modules.payment.domain.*;
import com.freightclub.modules.payment.infrastructure.PaymentAccountEntity;
import com.freightclub.modules.payment.infrastructure.PaymentAccountRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PaymentAccountService (Application Layer) Tests")
class PaymentAccountServiceTest {

    @Mock
    private PaymentAccountRepository paymentAccountRepository;

    private PaymentAccountService paymentAccountService;

    private String testTenantId = "tenant-123";
    private String testTruckerId = "trucker-456";

    @BeforeEach
    void setUp() {
        paymentAccountService = new PaymentAccountService(paymentAccountRepository);
    }

    @Test
    @DisplayName("AC-1: Should create payment account and return DTO")
    void testCreatePaymentAccount() {
        // Arrange
        CreatePaymentAccountCommand cmd = CreatePaymentAccountCommand.builder()
            .tenantId(testTenantId)
            .truckerId(testTruckerId)
            .accountHolderName("John Doe")
            .routingNumber("021000021")
            .accountNumber("1234567890")
            .accountType(BankAccountType.CHECKING)
            .accountNickname("Main Account")
            .build();

        ArgumentCaptor<PaymentAccountEntity> captor = ArgumentCaptor.forClass(PaymentAccountEntity.class);
        when(paymentAccountRepository.save(any(PaymentAccountEntity.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        PaymentAccountDTO result = paymentAccountService.createPaymentAccount(cmd);

        // Assert
        assertNotNull(result);
        assertEquals("John Doe", result.accountHolderName());
        assertEquals("021000021", result.routingNumber());
        assertEquals("7890", result.lastFourDigits());
        assertEquals(PaymentAccountStatus.PENDING_VERIFICATION, result.status());
        assertFalse(result.isPrimary());

        verify(paymentAccountRepository).save(captor.capture());
        PaymentAccountEntity saved = captor.getValue();
        assertEquals(testTenantId, saved.getTenantId());
        assertEquals(testTruckerId, saved.getTruckerId());
    }

    @Test
    @DisplayName("AC-2 & AC-3: Should verify micro-deposits on amount match")
    void testVerifyMicroDeposits_Success() {
        // Arrange
        PaymentAccount domain = PaymentAccount.createNew(
            "John Doe",
            "021000021",
            "1234567890",
            BankAccountType.CHECKING,
            null,
            testTenantId,
            testTruckerId
        );
        int deposit1 = 15;
        int deposit2 = 25;
        domain.initiateVerification("code-123", deposit1, deposit2);

        PaymentAccountEntity entity = PaymentAccountEntity.fromDomain(domain);
        String accountId = "account-123";
        entity.setId(accountId);

        when(paymentAccountRepository.findById(accountId))
            .thenReturn(Optional.of(entity));
        when(paymentAccountRepository.save(any(PaymentAccountEntity.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        VerifyMicroDepositsCommand cmd = VerifyMicroDepositsCommand.builder()
            .accountId(accountId)
            .tenantId(testTenantId)
            .truckerId(testTruckerId)
            .deposit1Cents(deposit1)
            .deposit2Cents(deposit2)
            .build();

        // Act
        PaymentAccountDTO result = paymentAccountService.verifyMicroDeposits(cmd);

        // Assert
        assertEquals(PaymentAccountStatus.VERIFIED, result.status());
        assertTrue(result.isPrimary(), "First account should be marked as primary");

        verify(paymentAccountRepository).save(any(PaymentAccountEntity.class));
    }

    @Test
    @DisplayName("AC-3: Should reject verification on amount mismatch")
    void testVerifyMicroDeposits_Mismatch() {
        // Arrange
        PaymentAccount domain = PaymentAccount.createNew(
            "John Doe",
            "021000021",
            "1234567890",
            BankAccountType.CHECKING,
            null,
            testTenantId,
            testTruckerId
        );
        domain.initiateVerification("code-123", 1, 2);

        PaymentAccountEntity entity = PaymentAccountEntity.fromDomain(domain);
        String accountId = "account-123";
        entity.setId(accountId);

        when(paymentAccountRepository.findById(accountId))
            .thenReturn(Optional.of(entity));

        VerifyMicroDepositsCommand cmd = VerifyMicroDepositsCommand.builder()
            .accountId(accountId)
            .tenantId(testTenantId)
            .truckerId(testTruckerId)
            .deposit1Cents(5)
            .deposit2Cents(10)
            .build();

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () ->
            paymentAccountService.verifyMicroDeposits(cmd),
            "Should reject non-matching amounts"
        );

        verify(paymentAccountRepository, never()).save(any());
    }

    @Test
    @DisplayName("AC-4: Should set account as primary")
    void testSetAsPrimary() {
        // Arrange
        PaymentAccount domain = PaymentAccount.createNew(
            "John Doe",
            "021000021",
            "1234567890",
            BankAccountType.CHECKING,
            null,
            testTenantId,
            testTruckerId
        );
        domain.initiateVerification("code-123", 1, 2);
        domain.confirmVerification(1, 2);
        domain.setAsPrimary(true);

        PaymentAccountEntity entity = PaymentAccountEntity.fromDomain(domain);
        String accountId = "account-123";
        entity.setId(accountId);

        when(paymentAccountRepository.findById(accountId))
            .thenReturn(Optional.of(entity));
        when(paymentAccountRepository.save(any(PaymentAccountEntity.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        SetPrimaryAccountCommand cmd = SetPrimaryAccountCommand.builder()
            .accountId(accountId)
            .tenantId(testTenantId)
            .truckerId(testTruckerId)
            .build();

        // Act
        PaymentAccountDTO result = paymentAccountService.setPrimaryAccount(cmd);

        // Assert
        assertTrue(result.isPrimary());
        verify(paymentAccountRepository).save(any(PaymentAccountEntity.class));
    }

    @Test
    @DisplayName("AC-4: Should retrieve all active accounts for trucker")
    void testGetPaymentAccounts() {
        // Arrange
        PaymentAccount domain1 = PaymentAccount.createNew(
            "John Doe",
            "021000021",
            "1111111111",
            BankAccountType.CHECKING,
            "Account 1",
            testTenantId,
            testTruckerId
        );

        PaymentAccount domain2 = PaymentAccount.createNew(
            "John Doe",
            "111000025",
            "2222222222",
            BankAccountType.SAVINGS,
            "Account 2",
            testTenantId,
            testTruckerId
        );

        List<PaymentAccountEntity> entities = List.of(
            PaymentAccountEntity.fromDomain(domain1),
            PaymentAccountEntity.fromDomain(domain2)
        );

        when(paymentAccountRepository.findByTenantIdAndTruckerIdAndDeletedAtIsNull(testTenantId, testTruckerId))
            .thenReturn(entities);

        // Act
        List<PaymentAccountDTO> results = paymentAccountService.getPaymentAccounts(testTenantId, testTruckerId);

        // Assert
        assertEquals(2, results.size());
        assertEquals("Account 1", results.get(0).accountNickname());
        assertEquals("Account 2", results.get(1).accountNickname());
        assertEquals("1111", results.get(0).lastFourDigits());
        assertEquals("2222", results.get(1).lastFourDigits());

        verify(paymentAccountRepository).findByTenantIdAndTruckerIdAndDeletedAtIsNull(testTenantId, testTruckerId);
    }
}
