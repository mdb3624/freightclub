package com.freightclub.modules.payment.infrastructure;

import com.freightclub.modules.payment.application.PaymentService;
import com.stripe.exception.SignatureVerificationException;

import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.PaymentIntent;
import com.stripe.model.StripeObject;
import com.stripe.net.Webhook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

/**
 * Receives Stripe webhook events.
 *
 * <p>IMPORTANT: Never throw an exception that results in a 5xx response — Stripe
 * will retry indefinitely. Instead, log the error and return 200 so Stripe stops
 * retrying, or 400 for events we genuinely cannot process.
 */
@RestController
@RequestMapping("/api/v1/webhooks")
public class StripeWebhookController {

    private static final Logger log = LoggerFactory.getLogger(StripeWebhookController.class);

    private final PaymentService paymentService;
    private final String webhookSecret;
    private final boolean stripeEnabled;

    public StripeWebhookController(
            PaymentService paymentService,
            @Value("${stripe.webhook-secret:}") String webhookSecret,
            @Value("${stripe.enabled:false}") boolean stripeEnabled) {
        this.paymentService  = paymentService;
        this.webhookSecret   = webhookSecret;
        this.stripeEnabled   = stripeEnabled;
    }

    /**
     * POST /api/v1/webhooks/stripe
     *
     * <p>Handles:
     * <ul>
     *   <li>{@code payment_intent.succeeded} — marks invoice PAID, triggers trucker transfer</li>
     *   <li>{@code payment_intent.payment_failed} — marks invoice FAILED</li>
     * </ul>
     */
    @PostMapping("/stripe")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {

        if (!stripeEnabled) {
            log.debug("Stripe disabled — ignoring webhook event");
            return ResponseEntity.ok("stripe disabled");
        }

        // Verify Stripe signature
        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            log.warn("Stripe webhook signature verification failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body("invalid signature");
        } catch (Exception e) {
            log.error("Failed to parse Stripe webhook payload", e);
            return ResponseEntity.badRequest().body("invalid payload");
        }

        log.info("Received Stripe event: type={} id={}", event.getType(), event.getId());

        switch (event.getType()) {
            case "payment_intent.succeeded" -> handlePaymentIntentSucceeded(event);
            case "payment_intent.payment_failed" -> handlePaymentIntentFailed(event);
            default -> log.debug("Unhandled Stripe event type: {}", event.getType());
        }

        // Always return 200 — Stripe retries on non-2xx
        return ResponseEntity.ok("received");
    }

    // -------------------------------------------------------------------------
    // Private event handlers — never throw; log and continue
    // -------------------------------------------------------------------------

    private void handlePaymentIntentSucceeded(Event event) {
        try {
            PaymentIntent pi = deserializePaymentIntent(event).orElse(null);
            if (pi == null) {
                log.error("Could not deserialize PaymentIntent for event {}", event.getId());
                return;
            }
            String invoiceId = pi.getMetadata().get("invoiceId");
            if (invoiceId == null || invoiceId.isBlank()) {
                log.warn("payment_intent.succeeded missing invoiceId metadata — piId={}", pi.getId());
                return;
            }
            paymentService.markInvoicePaid(invoiceId, pi.getId(), null);
            log.info("Invoice {} paid via Stripe piId={}", invoiceId, pi.getId());
        } catch (Exception e) {
            log.error("Unexpected error in handlePaymentIntentSucceeded for event {}", event.getId(), e);
        }
    }

    private void handlePaymentIntentFailed(Event event) {
        try {
            PaymentIntent pi = deserializePaymentIntent(event).orElse(null);
            if (pi == null) {
                log.error("Could not deserialize PaymentIntent for failed event {}", event.getId());
                return;
            }
            String invoiceId = pi.getMetadata().get("invoiceId");
            if (invoiceId == null || invoiceId.isBlank()) {
                log.warn("payment_intent.payment_failed missing invoiceId metadata — piId={}", pi.getId());
                return;
            }
            paymentService.markInvoiceFailed(invoiceId, pi.getId());
            log.warn("Invoice {} failed via Stripe piId={}", invoiceId, pi.getId());
        } catch (Exception e) {
            log.error("Unexpected error in handlePaymentIntentFailed for event {}", event.getId(), e);
        }
    }

    @SuppressWarnings("unchecked")
    private Optional<PaymentIntent> deserializePaymentIntent(Event event) {
        EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
        if (deserializer.getObject().isPresent()) {
            StripeObject obj = deserializer.getObject().get();
            if (obj instanceof PaymentIntent pi) {
                return Optional.of(pi);
            }
        }
        return Optional.empty();
    }
}
