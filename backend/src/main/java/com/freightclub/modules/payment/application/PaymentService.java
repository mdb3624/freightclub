package com.freightclub.modules.payment.application;

import com.freightclub.modules.payment.domain.InvoiceStatus;
import com.freightclub.modules.payment.infrastructure.InvoiceEntity;
import com.freightclub.modules.payment.infrastructure.InvoiceRepository;
import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Transfer;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.TransferCreateParams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Stripe Connect payment service.
 *
 * <p>Platform fee: {@code platformFeePercent}% of load amount (default 1.75%).
 * Trucker payout: load amount minus platform fee.
 *
 * <p>When {@code stripe.enabled=false} (the default in dev/test), all Stripe API
 * calls are skipped and stub values are returned — no real money moves.
 */
@Service
@Transactional
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final InvoiceRepository invoiceRepository;
    private final double platformFeePercent;
    private final boolean enabled;

    public PaymentService(
            InvoiceRepository invoiceRepository,
            @Value("${stripe.platform-fee-percent:1.75}") double platformFeePercent,
            @Value("${stripe.enabled:false}") boolean enabled,
            @Value("${stripe.secret-key:}") String secretKey) {
        this.invoiceRepository = invoiceRepository;
        this.platformFeePercent = platformFeePercent;
        this.enabled = enabled;
        if (enabled && secretKey != null && !secretKey.isBlank()) {
            Stripe.apiKey = secretKey;
            log.info("Stripe Connect enabled (platform fee: {}%)", platformFeePercent);
        } else {
            log.info("Stripe disabled — stub mode active");
        }
    }

    // -------------------------------------------------------------------------
    // Fee calculation
    // -------------------------------------------------------------------------

    /**
     * Calculates the platform fee in cents (rounded to nearest cent).
     * 1.75% of $2,000 = $35.00 = 3500 cents.
     */
    public long calculatePlatformFeeCents(long loadAmountCents) {
        if (loadAmountCents <= 0) {
            throw new IllegalArgumentException("Load amount must be positive, got: " + loadAmountCents);
        }
        return Math.round(loadAmountCents * platformFeePercent / 100.0);
    }

    /**
     * Calculates the trucker payout in cents after deducting the platform fee.
     */
    public long calculateTruckerPayoutCents(long loadAmountCents) {
        return loadAmountCents - calculatePlatformFeeCents(loadAmountCents);
    }

    // -------------------------------------------------------------------------
    // Invoice lifecycle
    // -------------------------------------------------------------------------

    /**
     * Creates a PENDING invoice for a delivered load.
     * Idempotent: returns the existing invoice if one already exists for this load.
     */
    public InvoiceEntity createInvoice(String tenantId, String loadId,
                                       String truckerUserId, String shipperUserId,
                                       long loadAmountCents) {
        if (invoiceRepository.existsByLoadId(loadId)) {
            log.warn("Invoice already exists for loadId={}, returning existing", loadId);
            return invoiceRepository.findByLoadId(loadId).orElseThrow();
        }

        long feeCents    = calculatePlatformFeeCents(loadAmountCents);
        long payoutCents = calculateTruckerPayoutCents(loadAmountCents);

        InvoiceEntity invoice = new InvoiceEntity();
        invoice.setId(UUID.randomUUID().toString());
        invoice.setTenantId(tenantId);
        invoice.setLoadId(loadId);
        invoice.setTruckerUserId(truckerUserId);
        invoice.setShipperUserId(shipperUserId);
        invoice.setLoadAmountCents(loadAmountCents);
        invoice.setPlatformFeeCents(feeCents);
        invoice.setTruckerPayoutCents(payoutCents);
        invoice.setStatus(InvoiceStatus.PENDING);
        invoice.setCreatedAt(OffsetDateTime.now());

        InvoiceEntity saved = invoiceRepository.save(invoice);
        log.info("Invoice created: id={} load={} amount={}c fee={}c payout={}c",
                saved.getId(), loadId, loadAmountCents, feeCents, payoutCents);
        return saved;
    }

    // -------------------------------------------------------------------------
    // Stripe API calls (no-op when disabled)
    // -------------------------------------------------------------------------

    /**
     * Creates a Stripe PaymentIntent for the shipper to pay.
     * Returns a stub client secret when Stripe is disabled.
     */
    public String createPaymentIntent(long loadAmountCents, String shipperEmail,
                                      String invoiceId) throws Exception {
        if (!enabled) {
            log.warn("Stripe disabled — returning stub client secret for invoiceId={}", invoiceId);
            return "test_pi_secret_" + invoiceId;
        }
        long feeCents = calculatePlatformFeeCents(loadAmountCents);
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(loadAmountCents)
                .setCurrency("usd")
                .setApplicationFeeAmount(feeCents)
                .putMetadata("invoiceId", invoiceId)
                .setReceiptEmail(shipperEmail)
                .build();
        return PaymentIntent.create(params).getClientSecret();
    }

    /**
     * Transfers the trucker payout to their Stripe Connect account.
     * No-op when Stripe is disabled.
     */
    public void transferToTrucker(long truckerPayoutCents, String truckerStripeAccountId,
                                  String invoiceId) throws Exception {
        if (!enabled) {
            log.warn("Stripe disabled — skipping transfer for invoiceId={}", invoiceId);
            return;
        }
        TransferCreateParams params = TransferCreateParams.builder()
                .setAmount(truckerPayoutCents)
                .setCurrency("usd")
                .setDestination(truckerStripeAccountId)
                .putMetadata("invoiceId", invoiceId)
                .build();
        Transfer transfer = Transfer.create(params);
        log.info("Stripe transfer created: transferId={} invoiceId={} amount={}c account={}",
                transfer.getId(), invoiceId, truckerPayoutCents, truckerStripeAccountId);
    }

    /**
     * Marks the invoice as PAID and records Stripe IDs.
     * Called from the Stripe webhook handler on payment_intent.succeeded.
     */
    public void markInvoicePaid(String invoiceId, String stripePaymentIntentId,
                                String stripeTransferId) {
        InvoiceEntity invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found: " + invoiceId));
        invoice.setStatus(InvoiceStatus.PAID);
        invoice.setStripePaymentIntentId(stripePaymentIntentId);
        invoice.setStripeTransferId(stripeTransferId);
        invoice.setPaidAt(OffsetDateTime.now());
        invoiceRepository.save(invoice);
        log.info("Invoice {} marked PAID (pi={} transfer={})", invoiceId, stripePaymentIntentId, stripeTransferId);
    }

    /**
     * Returns the payment status for a load, scoped to the requesting trucker.
     * Returns empty if no invoice exists yet, or if the invoice belongs to a
     * different trucker (authorization check).
     */
    public java.util.Optional<com.freightclub.dto.PaymentStatusResponse> getPaymentStatus(String loadId, String truckerId) {
        return invoiceRepository.findByLoadId(loadId)
                .filter(invoice -> invoice.getTruckerUserId().equals(truckerId))
                .map(invoice -> new com.freightclub.dto.PaymentStatusResponse(
                        invoice.getStatus().name(),
                        invoice.getPaidAt(),
                        invoice.getTruckerPayoutCents()
                ));
    }

    /**
     * Marks the invoice as FAILED.
     */
    public void markInvoiceFailed(String invoiceId, String stripePaymentIntentId) {
        InvoiceEntity invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found: " + invoiceId));
        invoice.setStatus(InvoiceStatus.FAILED);
        invoice.setStripePaymentIntentId(stripePaymentIntentId);
        invoiceRepository.save(invoice);
        log.warn("Invoice {} marked FAILED (pi={})", invoiceId, stripePaymentIntentId);
    }
}
