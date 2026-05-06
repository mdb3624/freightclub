package com.freightclub.modules.payment.infrastructure;

import com.freightclub.modules.payment.domain.PaymentAccountStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentAccountRepository extends JpaRepository<PaymentAccountEntity, String> {

    // AC-1: Find active accounts by tenant and trucker
    List<PaymentAccountEntity> findByTenantIdAndTruckerIdAndDeletedAtIsNull(
        String tenantId,
        String truckerId
    );

    // AC-4: Find primary account for trucker
    Optional<PaymentAccountEntity> findByTenantIdAndTruckerIdAndIsPrimaryTrueAndDeletedAtIsNull(
        String tenantId,
        String truckerId
    );

    // AC-2 & AC-3: Find pending verification accounts (for background job)
    List<PaymentAccountEntity> findByStatusAndDeletedAtIsNull(PaymentAccountStatus status);

    // AC-6: RLS-aware query (application layer enforces tenant context)
    @Query("SELECT p FROM PaymentAccountEntity p WHERE p.tenantId = :tenantId AND p.truckerId = :truckerId AND p.deletedAt IS NULL")
    List<PaymentAccountEntity> findActiveBytenant(String tenantId, String truckerId);

    // AC-7: Find all accounts for audit purposes (immutable)
    List<PaymentAccountEntity> findByTenantIdOrderByCreatedAtDesc(String tenantId);
}
