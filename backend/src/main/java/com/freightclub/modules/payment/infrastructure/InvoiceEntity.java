package com.freightclub.modules.payment.infrastructure;

import com.freightclub.modules.payment.domain.InvoiceStatus;
import jakarta.persistence.*;
import java.time.OffsetDateTime;

/**
 * JPA entity for the freightclub.invoices table.
 * One invoice per delivered load; tracks Stripe PaymentIntent and Transfer IDs.
 */
@Entity
@Table(
    name = "invoices",
    indexes = {
        @Index(name = "idx_invoices_tenant_status", columnList = "tenant_id, status"),
        @Index(name = "idx_invoices_load",          columnList = "load_id"),
        @Index(name = "idx_invoices_trucker",        columnList = "trucker_user_id")
    }
)
public class InvoiceEntity {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "tenant_id", nullable = false, length = 36)
    private String tenantId;

    @Column(name = "load_id", nullable = false, length = 36, unique = true)
    private String loadId;

    @Column(name = "trucker_user_id", nullable = false, length = 36)
    private String truckerUserId;

    @Column(name = "shipper_user_id", nullable = false, length = 36)
    private String shipperUserId;

    @Column(name = "load_amount_cents", nullable = false)
    private long loadAmountCents;

    @Column(name = "platform_fee_cents", nullable = false)
    private long platformFeeCents;

    @Column(name = "trucker_payout_cents", nullable = false)
    private long truckerPayoutCents;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private InvoiceStatus status;

    @Column(name = "stripe_payment_intent_id", length = 255)
    private String stripePaymentIntentId;

    @Column(name = "stripe_transfer_id", length = 255)
    private String stripeTransferId;

    @Column(name = "trucker_stripe_account_id", length = 255)
    private String truckerStripeAccountId;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "paid_at")
    private OffsetDateTime paidAt;

    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;

    public InvoiceEntity() {}

    // --- Getters and Setters ---

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public String getLoadId() { return loadId; }
    public void setLoadId(String loadId) { this.loadId = loadId; }

    public String getTruckerUserId() { return truckerUserId; }
    public void setTruckerUserId(String truckerUserId) { this.truckerUserId = truckerUserId; }

    public String getShipperUserId() { return shipperUserId; }
    public void setShipperUserId(String shipperUserId) { this.shipperUserId = shipperUserId; }

    public long getLoadAmountCents() { return loadAmountCents; }
    public void setLoadAmountCents(long loadAmountCents) { this.loadAmountCents = loadAmountCents; }

    public long getPlatformFeeCents() { return platformFeeCents; }
    public void setPlatformFeeCents(long platformFeeCents) { this.platformFeeCents = platformFeeCents; }

    public long getTruckerPayoutCents() { return truckerPayoutCents; }
    public void setTruckerPayoutCents(long truckerPayoutCents) { this.truckerPayoutCents = truckerPayoutCents; }

    public InvoiceStatus getStatus() { return status; }
    public void setStatus(InvoiceStatus status) { this.status = status; }

    public String getStripePaymentIntentId() { return stripePaymentIntentId; }
    public void setStripePaymentIntentId(String stripePaymentIntentId) { this.stripePaymentIntentId = stripePaymentIntentId; }

    public String getStripeTransferId() { return stripeTransferId; }
    public void setStripeTransferId(String stripeTransferId) { this.stripeTransferId = stripeTransferId; }

    public String getTruckerStripeAccountId() { return truckerStripeAccountId; }
    public void setTruckerStripeAccountId(String truckerStripeAccountId) { this.truckerStripeAccountId = truckerStripeAccountId; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(OffsetDateTime paidAt) { this.paidAt = paidAt; }

    public OffsetDateTime getDeletedAt() { return deletedAt; }
    public void setDeletedAt(OffsetDateTime deletedAt) { this.deletedAt = deletedAt; }
}
