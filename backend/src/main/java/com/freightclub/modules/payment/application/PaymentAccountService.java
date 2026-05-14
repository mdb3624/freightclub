package com.freightclub.modules.payment.application;

import com.freightclub.modules.payment.domain.PaymentAccount;
import com.freightclub.modules.payment.domain.PaymentAccountStatus;
import com.freightclub.modules.payment.infrastructure.PaymentAccountEntity;
import com.freightclub.modules.payment.infrastructure.PaymentAccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class PaymentAccountService {

    private final PaymentAccountRepository paymentAccountRepository;
    private final PaymentAccountMapper paymentAccountMapper;

    public PaymentAccountService(PaymentAccountRepository paymentAccountRepository,
                                 PaymentAccountMapper paymentAccountMapper) {
        this.paymentAccountRepository = paymentAccountRepository;
        this.paymentAccountMapper = paymentAccountMapper;
    }

    // AC-1: Create payment account
    public PaymentAccountDTO createPaymentAccount(CreatePaymentAccountCommand cmd) {
        PaymentAccount domain = PaymentAccount.createNew(
            cmd.accountHolderName(),
            cmd.routingNumber(),
            cmd.accountNumber(),
            cmd.accountType(),
            cmd.accountNickname(),
            cmd.tenantId(),
            cmd.truckerId()
        );

        PaymentAccountEntity entity = PaymentAccountEntity.fromDomain(domain);
        PaymentAccountEntity saved = paymentAccountRepository.save(entity);

        return paymentAccountMapper.toDto(saved.toDomain());
    }

    // AC-2 & AC-3: Verify micro-deposit amounts
    public PaymentAccountDTO verifyMicroDeposits(VerifyMicroDepositsCommand cmd) {
        Optional<PaymentAccountEntity> accountOpt = paymentAccountRepository.findById(cmd.accountId());
        if (accountOpt.isEmpty()) {
            throw new IllegalArgumentException("Payment account not found: " + cmd.accountId());
        }

        PaymentAccountEntity entity = accountOpt.get();
        PaymentAccount domain = entity.toDomain();

        // Verify account belongs to trucker
        if (!domain.getTruckerId().equals(cmd.truckerId()) || !domain.getTenantId().equals(cmd.tenantId())) {
            throw new IllegalStateException("Account does not belong to this trucker");
        }

        // Confirm verification (may throw if amounts don't match)
        domain.confirmVerification(cmd.deposit1Cents(), cmd.deposit2Cents());

        // If this is the first account, mark as primary
        List<PaymentAccountEntity> existingAccounts = paymentAccountRepository
            .findByTenantIdAndTruckerIdAndDeletedAtIsNull(cmd.tenantId(), cmd.truckerId());
        if (existingAccounts.size() == 1) {
            domain.setAsPrimary(true);
        }

        PaymentAccountEntity updated = PaymentAccountEntity.fromDomain(domain);
        updated.setId(cmd.accountId());
        PaymentAccountEntity saved = paymentAccountRepository.save(updated);

        return paymentAccountMapper.toDto(saved.toDomain());
    }

    // AC-4: Set account as primary
    public PaymentAccountDTO setPrimaryAccount(SetPrimaryAccountCommand cmd) {
        Optional<PaymentAccountEntity> accountOpt = paymentAccountRepository.findById(cmd.accountId());
        if (accountOpt.isEmpty()) {
            throw new IllegalArgumentException("Payment account not found");
        }

        PaymentAccountEntity entity = accountOpt.get();
        PaymentAccount domain = entity.toDomain();

        // Verify account belongs to trucker
        if (!domain.getTruckerId().equals(cmd.truckerId()) || !domain.getTenantId().equals(cmd.tenantId())) {
            throw new IllegalStateException("Account does not belong to this trucker");
        }

        // Unset previous primary (if any)
        Optional<PaymentAccountEntity> previousPrimary = paymentAccountRepository
            .findByTenantIdAndTruckerIdAndIsPrimaryTrueAndDeletedAtIsNull(cmd.tenantId(), cmd.truckerId());
        if (previousPrimary.isPresent()) {
            PaymentAccount prevDomain = previousPrimary.get().toDomain();
            prevDomain.setAsPrimary(false);
            paymentAccountRepository.save(PaymentAccountEntity.fromDomain(prevDomain));
        }

        // Set new primary
        domain.setAsPrimary(true);
        PaymentAccountEntity updated = PaymentAccountEntity.fromDomain(domain);
        updated.setId(cmd.accountId());
        PaymentAccountEntity saved = paymentAccountRepository.save(updated);

        return paymentAccountMapper.toDto(saved.toDomain());
    }

    // AC-4: Get all active payment accounts for trucker
    public List<PaymentAccountDTO> getPaymentAccounts(String tenantId, String truckerId) {
        List<PaymentAccountEntity> entities = paymentAccountRepository
            .findByTenantIdAndTruckerIdAndDeletedAtIsNull(tenantId, truckerId);

        return entities.stream()
            .map(entity -> paymentAccountMapper.toDto(entity.toDomain()))
            .collect(Collectors.toList());
    }

    // AC-5: Delete (soft-delete) payment account
    public void deletePaymentAccount(String accountId, String tenantId, String truckerId) {
        Optional<PaymentAccountEntity> accountOpt = paymentAccountRepository.findById(accountId);
        if (accountOpt.isEmpty()) {
            throw new IllegalArgumentException("Payment account not found");
        }

        PaymentAccountEntity entity = accountOpt.get();
        PaymentAccount domain = entity.toDomain();

        // Verify ownership
        if (!domain.getTruckerId().equals(truckerId) || !domain.getTenantId().equals(tenantId)) {
            throw new IllegalStateException("Account does not belong to this trucker");
        }

        // Soft delete
        domain.softDelete();
        PaymentAccountEntity updated = PaymentAccountEntity.fromDomain(domain);
        updated.setId(accountId);
        paymentAccountRepository.save(updated);
    }

}
