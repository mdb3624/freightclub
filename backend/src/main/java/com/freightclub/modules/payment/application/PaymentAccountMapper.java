package com.freightclub.modules.payment.application;

import com.freightclub.modules.payment.domain.PaymentAccount;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PaymentAccountMapper {
    PaymentAccountDTO toDto(PaymentAccount domain);
}
