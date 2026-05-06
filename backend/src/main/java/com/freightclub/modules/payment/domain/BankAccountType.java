package com.freightclub.modules.payment.domain;

public enum BankAccountType {
    CHECKING("Checking Account"),
    SAVINGS("Savings Account");

    private final String displayName;

    BankAccountType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
