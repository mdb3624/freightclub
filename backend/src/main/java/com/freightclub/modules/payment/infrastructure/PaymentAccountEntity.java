package com.freightclub.modules.payment.infrastructure;

import com.freightclub.modules.payment.domain.BankAccountType;
import com.freightclub.modules.payment.domain.PaymentAccount;
import com.freightclub.modules.payment.domain.PaymentAccountStatus;
import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(
    name = "payment_accounts",
    indexes = {
        @Index(name = "idx_tenant_trucker", columnList = "tenant_id, trucker_id, deleted_at"),
        @Index(name = "idx_primary_accounts", columnList = "tenant_id, is_primary, deleted_at"),
        @Index(name = "idx_status", columnList = "status, created_at")
    }
)
public class PaymentAccountEntity {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "tenant_id", nullable = false, length = 36)
    private String tenantId;

    @Column(name = "trucker_id", nullable = false, length = 36)
    private String truckerId;

    @Column(name = "account_holder_name", nullable = false, length = 255)
    private String accountHolderName;

    @Column(name = "routing_number", nullable = false, length = 9)
    private String routingNumber;

    @Column(name = "account_number", nullable = false)
    private String accountNumber;  // Will be encrypted by column-level encryption handler

    @Enumerated(EnumType.STRING)
    @Column(name = "account_type", nullable = false)
    private BankAccountType accountType;

    @Column(name = "account_nickname", length = 100)
    private String accountNickname;

    @Column(name = "last_four_digits", nullable = false, length = 4)
    private String lastFourDigits;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PaymentAccountStatus status;

    @Column(name = "is_primary", nullable = false)
    private boolean isPrimary;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "verified_at")
    private OffsetDateTime verifiedAt;

    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;

    @Column(name = "current_verification_code")
    private String currentVerificationCode;

    @Column(name = "expected_deposit_1_cents")
    private long expectedDeposit1Cents;

    @Column(name = "expected_deposit_2_cents")
    private long expectedDeposit2Cents;

    public PaymentAccountEntity() {
    }

    public PaymentAccountEntity(String id, String tenantId, String truckerId,
                                String accountHolderName, String routingNumber,
                                String accountNumber, BankAccountType accountType,
                                String accountNickname, String lastFourDigits,
                                PaymentAccountStatus status, boolean isPrimary,
                                OffsetDateTime createdAt, OffsetDateTime verifiedAt,
                                OffsetDateTime deletedAt) {
        this.id = id;
        this.tenantId = tenantId;
        this.truckerId = truckerId;
        this.accountHolderName = accountHolderName;
        this.routingNumber = routingNumber;
        this.accountNumber = accountNumber;
        this.accountType = accountType;
        this.accountNickname = accountNickname;
        this.lastFourDigits = lastFourDigits;
        this.status = status;
        this.isPrimary = isPrimary;
        this.createdAt = createdAt;
        this.verifiedAt = verifiedAt;
        this.deletedAt = deletedAt;
    }

    // Mapper: Entity → Domain
    public PaymentAccount toDomain() {
        return new PaymentAccount(
            id, tenantId, truckerId, accountHolderName, routingNumber,
            new String(accountNumber), accountType, accountNickname, lastFourDigits,
            status, isPrimary, createdAt, verifiedAt, deletedAt
        );
    }

    // Mapper: Domain → Entity
    public static PaymentAccountEntity fromDomain(PaymentAccount domain) {
        PaymentAccountEntity entity = new PaymentAccountEntity(
            domain.getId(),
            domain.getTenantId(),
            domain.getTruckerId(),
            domain.getAccountHolderName(),
            domain.getRoutingNumber(),
            domain.getAccountNumber(),  // Will be encrypted by column-level handler
            domain.getAccountType(),
            domain.getAccountNickname(),
            domain.getLastFourDigits(),
            domain.getStatus(),
            domain.isPrimary(),
            domain.getCreatedAt(),
            domain.getVerifiedAt(),
            domain.getDeletedAt()
        );
        entity.currentVerificationCode = domain.getCurrentVerificationCode();
        entity.expectedDeposit1Cents = domain.getExpectedDeposit1Cents();
        entity.expectedDeposit2Cents = domain.getExpectedDeposit2Cents();
        return entity;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTenantId() {
        return tenantId;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }

    public String getTruckerId() {
        return truckerId;
    }

    public void setTruckerId(String truckerId) {
        this.truckerId = truckerId;
    }

    public String getAccountHolderName() {
        return accountHolderName;
    }

    public void setAccountHolderName(String accountHolderName) {
        this.accountHolderName = accountHolderName;
    }

    public String getRoutingNumber() {
        return routingNumber;
    }

    public void setRoutingNumber(String routingNumber) {
        this.routingNumber = routingNumber;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public BankAccountType getAccountType() {
        return accountType;
    }

    public void setAccountType(BankAccountType accountType) {
        this.accountType = accountType;
    }

    public String getAccountNickname() {
        return accountNickname;
    }

    public void setAccountNickname(String accountNickname) {
        this.accountNickname = accountNickname;
    }

    public String getLastFourDigits() {
        return lastFourDigits;
    }

    public void setLastFourDigits(String lastFourDigits) {
        this.lastFourDigits = lastFourDigits;
    }

    public PaymentAccountStatus getStatus() {
        return status;
    }

    public void setStatus(PaymentAccountStatus status) {
        this.status = status;
    }

    public boolean isPrimary() {
        return isPrimary;
    }

    public void setPrimary(boolean primary) {
        isPrimary = primary;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(OffsetDateTime verifiedAt) {
        this.verifiedAt = verifiedAt;
    }

    public OffsetDateTime getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(OffsetDateTime deletedAt) {
        this.deletedAt = deletedAt;
    }
}
