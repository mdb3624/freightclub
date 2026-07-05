package com.freightclub.modules.payment.application;

import com.freightclub.modules.payment.domain.InvoiceStatus;
import com.freightclub.modules.payment.infrastructure.InvoiceEntity;
import com.freightclub.modules.payment.infrastructure.InvoiceRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PaymentService — fee calculation and invoice lifecycle")
class PaymentServiceTest {

    @Mock
    private InvoiceRepository invoiceRepository;

    /** Build a PaymentService in stub mode (stripe.enabled=false). */
    private PaymentService service() {
        return new PaymentService(invoiceRepository, 1.75, false, "");
    }

    // -------------------------------------------------------------------------
    // Fee calculation
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("1.75% of $2,000 = $35.00 (3500 cents); payout = $1,965 (196500 cents)")
    void shouldCalculatePlatformFeeCorrectly() {
        PaymentService svc = service();
        long fee    = svc.calculatePlatformFeeCents(200_000L);
        long payout = svc.calculateTruckerPayoutCents(200_000L);

        assertThat(fee).isEqualTo(3_500L);
        assertThat(payout).isEqualTo(196_500L);
        assertThat(fee + payout).isEqualTo(200_000L);
    }

    @Test
    @DisplayName("1.75% of $1 (100 cents) rounds to nearest cent")
    void shouldRoundFeeToNearestCent() {
        PaymentService svc = service();
        long fee = svc.calculatePlatformFeeCents(100L);
        // 1.75% of 100 = 1.75 → rounds to 2
        assertThat(fee).isEqualTo(2L);
    }

    @Test
    @DisplayName("calculatePlatformFeeCents(0) throws IllegalArgumentException")
    void shouldRejectZeroLoadAmount() {
        PaymentService svc = service();
        assertThatThrownBy(() -> svc.calculatePlatformFeeCents(0L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("must be positive");
    }

    @Test
    @DisplayName("calculatePlatformFeeCents(-100) throws IllegalArgumentException")
    void shouldRejectNegativeLoadAmount() {
        PaymentService svc = service();
        assertThatThrownBy(() -> svc.calculatePlatformFeeCents(-100L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("must be positive");
    }

    @Test
    @DisplayName("calculateTruckerPayoutCents(0) throws via fee calculation")
    void shouldRejectZeroAmountForPayout() {
        PaymentService svc = service();
        assertThatThrownBy(() -> svc.calculateTruckerPayoutCents(0L))
                .isInstanceOf(IllegalArgumentException.class);
    }

    // -------------------------------------------------------------------------
    // Invoice creation
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("createInvoice persists correct fee split and returns PENDING invoice")
    void shouldCreateInvoiceWithCorrectFeeSplit() {
        when(invoiceRepository.existsByLoadId("load-1")).thenReturn(false);
        when(invoiceRepository.save(any(InvoiceEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        PaymentService svc = service();
        InvoiceEntity result = svc.createInvoice(
                "tenant-1", "load-1", "trucker-1", "shipper-1", 200_000L);

        assertThat(result.getStatus()).isEqualTo(InvoiceStatus.PENDING);
        assertThat(result.getLoadAmountCents()).isEqualTo(200_000L);
        assertThat(result.getPlatformFeeCents()).isEqualTo(3_500L);
        assertThat(result.getTruckerPayoutCents()).isEqualTo(196_500L);
        assertThat(result.getTenantId()).isEqualTo("tenant-1");
        assertThat(result.getLoadId()).isEqualTo("load-1");
        assertThat(result.getTruckerUserId()).isEqualTo("trucker-1");
        assertThat(result.getShipperUserId()).isEqualTo("shipper-1");
        assertThat(result.getId()).isNotNull().isNotBlank();
        assertThat(result.getCreatedAt()).isNotNull();

        ArgumentCaptor<InvoiceEntity> captor = ArgumentCaptor.forClass(InvoiceEntity.class);
        verify(invoiceRepository).save(captor.capture());
        assertThat(captor.getValue().getPlatformFeeCents()).isEqualTo(3_500L);
    }

    @Test
    @DisplayName("createInvoice is idempotent — returns existing invoice if one exists for load")
    void shouldReturnExistingInvoiceIfAlreadyExists() {
        InvoiceEntity existing = new InvoiceEntity();
        existing.setId("existing-invoice-id");
        existing.setLoadId("load-1");
        existing.setStatus(InvoiceStatus.PENDING);

        when(invoiceRepository.existsByLoadId("load-1")).thenReturn(true);
        when(invoiceRepository.findByLoadId("load-1")).thenReturn(Optional.of(existing));

        PaymentService svc = service();
        InvoiceEntity result = svc.createInvoice(
                "tenant-1", "load-1", "trucker-1", "shipper-1", 200_000L);

        assertThat(result.getId()).isEqualTo("existing-invoice-id");
        verify(invoiceRepository, never()).save(any());
    }

    // -------------------------------------------------------------------------
    // Stripe stub mode
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("createPaymentIntent returns stub secret when Stripe disabled")
    void shouldReturnStubClientSecretWhenDisabled() throws Exception {
        PaymentService svc = service();
        String secret = svc.createPaymentIntent(200_000L, "shipper@example.com", "inv-123");

        assertThat(secret).startsWith("test_pi_secret_");
        assertThat(secret).contains("inv-123");
    }

    @Test
    @DisplayName("transferToTrucker is a no-op when Stripe disabled")
    void shouldSkipTransferWhenDisabled() {
        PaymentService svc = service();
        assertThatCode(() -> svc.transferToTrucker(196_500L, "acct_test_123", "inv-123"))
                .doesNotThrowAnyException();
    }

    // -------------------------------------------------------------------------
    // getPaymentStatus — authorization
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("getPaymentStatus returns populated status for the invoice's owning trucker")
    void shouldReturnPaymentStatusForOwningTrucker() {
        java.time.OffsetDateTime paidAt = java.time.OffsetDateTime.now();
        InvoiceEntity invoice = new InvoiceEntity();
        invoice.setLoadId("load-1");
        invoice.setTruckerUserId("trucker-1");
        invoice.setStatus(InvoiceStatus.PAID);
        invoice.setPaidAt(paidAt);
        invoice.setTruckerPayoutCents(196_500L);

        when(invoiceRepository.findByLoadId("load-1")).thenReturn(Optional.of(invoice));

        PaymentService svc = service();
        Optional<com.freightclub.dto.PaymentStatusResponse> result =
                svc.getPaymentStatus("load-1", "trucker-1");

        assertThat(result).isPresent();
        assertThat(result.get().status()).isEqualTo("PAID");
        assertThat(result.get().paidAt()).isEqualTo(paidAt);
        assertThat(result.get().truckerPayoutCents()).isEqualTo(196_500L);
    }

    @Test
    @DisplayName("getPaymentStatus returns empty when invoice belongs to a different trucker")
    void shouldNotLeakPaymentStatusToNonOwningTrucker() {
        InvoiceEntity invoice = new InvoiceEntity();
        invoice.setLoadId("load-1");
        invoice.setTruckerUserId("trucker-1");
        invoice.setStatus(InvoiceStatus.PAID);
        invoice.setPaidAt(java.time.OffsetDateTime.now());
        invoice.setTruckerPayoutCents(196_500L);

        when(invoiceRepository.findByLoadId("load-1")).thenReturn(Optional.of(invoice));

        PaymentService svc = service();
        Optional<com.freightclub.dto.PaymentStatusResponse> result =
                svc.getPaymentStatus("load-1", "trucker-2");

        assertThat(result).isEmpty();
    }
}
