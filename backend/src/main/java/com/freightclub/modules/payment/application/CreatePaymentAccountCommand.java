package com.freightclub.modules.payment.application;

import com.freightclub.modules.payment.domain.BankAccountType;

public record CreatePaymentAccountCommand(
    String tenantId,
    String truckerId,
    String accountHolderName,
    String routingNumber,
    String accountNumber,
    BankAccountType accountType,
    String accountNickname
) {
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String tenantId;
        private String truckerId;
        private String accountHolderName;
        private String routingNumber;
        private String accountNumber;
        private BankAccountType accountType;
        private String accountNickname;

        public Builder tenantId(String tenantId) {
            this.tenantId = tenantId;
            return this;
        }

        public Builder truckerId(String truckerId) {
            this.truckerId = truckerId;
            return this;
        }

        public Builder accountHolderName(String accountHolderName) {
            this.accountHolderName = accountHolderName;
            return this;
        }

        public Builder routingNumber(String routingNumber) {
            this.routingNumber = routingNumber;
            return this;
        }

        public Builder accountNumber(String accountNumber) {
            this.accountNumber = accountNumber;
            return this;
        }

        public Builder accountType(BankAccountType accountType) {
            this.accountType = accountType;
            return this;
        }

        public Builder accountNickname(String accountNickname) {
            this.accountNickname = accountNickname;
            return this;
        }

        public CreatePaymentAccountCommand build() {
            return new CreatePaymentAccountCommand(
                tenantId, truckerId, accountHolderName, routingNumber, accountNumber, accountType, accountNickname
            );
        }
    }
}
