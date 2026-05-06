package com.freightclub.modules.payment.application;

public record VerifyMicroDepositsCommand(
    String accountId,
    String tenantId,
    String truckerId,
    long deposit1Cents,
    long deposit2Cents
) {
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String accountId;
        private String tenantId;
        private String truckerId;
        private long deposit1Cents;
        private long deposit2Cents;

        public Builder accountId(String accountId) {
            this.accountId = accountId;
            return this;
        }

        public Builder tenantId(String tenantId) {
            this.tenantId = tenantId;
            return this;
        }

        public Builder truckerId(String truckerId) {
            this.truckerId = truckerId;
            return this;
        }

        public Builder deposit1Cents(long deposit1Cents) {
            this.deposit1Cents = deposit1Cents;
            return this;
        }

        public Builder deposit2Cents(long deposit2Cents) {
            this.deposit2Cents = deposit2Cents;
            return this;
        }

        public VerifyMicroDepositsCommand build() {
            return new VerifyMicroDepositsCommand(accountId, tenantId, truckerId, deposit1Cents, deposit2Cents);
        }
    }
}
