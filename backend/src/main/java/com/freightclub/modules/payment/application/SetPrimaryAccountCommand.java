package com.freightclub.modules.payment.application;

public record SetPrimaryAccountCommand(
    String accountId,
    String tenantId,
    String truckerId
) {
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String accountId;
        private String tenantId;
        private String truckerId;

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

        public SetPrimaryAccountCommand build() {
            return new SetPrimaryAccountCommand(accountId, tenantId, truckerId);
        }
    }
}
