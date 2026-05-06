package com.freightclub.modules.payment.application;

import com.freightclub.modules.payment.domain.BankAccountType;
import com.freightclub.modules.payment.domain.PaymentAccountStatus;
import java.time.OffsetDateTime;

public record PaymentAccountDTO(
    String id,
    String accountHolderName,
    String routingNumber,
    String lastFourDigits,
    BankAccountType accountType,
    String accountNickname,
    PaymentAccountStatus status,
    boolean isPrimary,
    OffsetDateTime createdAt,
    OffsetDateTime verifiedAt
) {
}
