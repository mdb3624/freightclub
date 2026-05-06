package com.freightclub.modules.payment.domain;

public enum PaymentAccountStatus {
    PENDING_VERIFICATION("Pending Verification", "Account added, awaiting micro-deposit initiation"),
    AWAITING_MICRO_DEPOSIT_CONFIRMATION("Awaiting Confirmation", "Micro-deposits sent, awaiting trucker confirmation"),
    VERIFIED("Verified", "Account verified and active for payouts"),
    VERIFICATION_FAILED("Verification Failed", "Verification failed after 3 attempts");

    private final String displayName;
    private final String description;

    PaymentAccountStatus(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }
}
