package com.freightclub.modules.payment.infrastructure;

import com.freightclub.domain.User;
import com.freightclub.domain.UserRole;
import com.freightclub.modules.payment.domain.*;
import com.freightclub.repository.UserRepository;
import com.freightclub.security.TenantContextHolder;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@DisplayName("PaymentAccountRepository Integration Tests")
class PaymentAccountRepositoryTest {

    @Autowired
    private PaymentAccountRepository paymentAccountRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Autowired
    private jakarta.persistence.EntityManager entityManager;

    private String testTenantId = "test-tenant-payment";
    private String testTruckerId = "trucker-payment-1";
    private PaymentAccountEntity testEntity;

    @BeforeEach
    void setUp() {
        TenantContextHolder.setTenantId(testTenantId);
        jdbcTemplate.update("DELETE FROM payment_accounts WHERE tenant_id = ?", testTenantId);
        ensureTenantsAndTruckersExist();
        PaymentAccount testDomain = PaymentAccount.createNew(
            "John Doe",
            "021000021",
            "1234567890",
            BankAccountType.CHECKING,
            "Test Account",
            testTenantId,
            testTruckerId
        );
        testEntity = PaymentAccountEntity.fromDomain(testDomain);
        testEntity.setStatus(PaymentAccountStatus.PENDING_VERIFICATION);
    }

    private void ensureTenantsAndTruckersExist() {
        // Create tenants
        createTenantIfMissing(testTenantId, "Payment Test Tenant");
        createTenantIfMissing("tenant-payment-1", "Payment Test Tenant 1");

        // Create truckers
        createUserIfMissing(testTruckerId, "trucker1@test.com", UserRole.TRUCKER, testTenantId);
        createUserIfMissing("trucker-a-test", "truckera@test.com", UserRole.TRUCKER, testTenantId);
        createUserIfMissing("trucker-b-test", "truckerb@test.com", UserRole.TRUCKER, "tenant-payment-1");
    }

    private void createTenantIfMissing(String tenantId, String name) {
        // US-858: ON CONFLICT DO NOTHING fails under RLS even for a brand-new id — Postgres's
        // conflict-check needs SELECT visibility that tenants_select (scoped to the caller's
        // own tenant) denies. Check-then-insert instead, matching createUserIfMissing below.
        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM tenants WHERE id = ?", Integer.class, tenantId);
        if (count == null || count == 0) {
            jdbcTemplate.update("INSERT INTO tenants (id, name) VALUES (?, ?)", tenantId, name);
        }
    }

    private void createUserIfMissing(String userId, String email, UserRole role, String tenantId) {
        if (!userRepository.findById(userId).isPresent()) {
            // US-858: this fixture creates users for tenants OTHER than testTenantId (e.g.
            // "tenant-payment-1") — the INSERT's WITH CHECK needs app.current_tenant to match
            // THIS user's own tenant_id, not whatever was bound when setUp() started. Switch,
            // flush, then restore so the rest of the test still runs as testTenantId.
            String callerTenantId = TenantContextHolder.getTenantId();
            TenantContextHolder.setTenantId(tenantId);
            User user = new User(userId);
            user.setTenantId(tenantId);
            user.setEmail(email);
            user.setPasswordHash("$2a$10$testpassword");
            user.setRole(role);
            user.setFirstName("Test");
            user.setLastName("Trucker");
            userRepository.save(user);
            entityManager.flush();
            TenantContextHolder.setTenantId(callerTenantId);
        }
    }

    @AfterEach
    void tearDown() {
        TenantContextHolder.clear();
    }

    @Test
    @DisplayName("AC-1: Should save and retrieve payment account")
    void testSaveAndRetrievePaymentAccount() {
        // Act
        PaymentAccountEntity saved = paymentAccountRepository.save(testEntity);

        // Assert
        assertNotNull(saved.getId());
        Optional<PaymentAccountEntity> retrieved = paymentAccountRepository.findById(saved.getId());
        assertTrue(retrieved.isPresent());
        assertEquals(testTenantId, retrieved.get().getTenantId());
        assertEquals(testTruckerId, retrieved.get().getTruckerId());
        assertEquals("7890", retrieved.get().getLastFourDigits());
    }

    @Test
    @DisplayName("AC-1: Should enforce soft delete (deleted_at IS NULL filter)")
    void testSoftDelete_EnforcedInQueries() {
        // Arrange
        PaymentAccountEntity saved = paymentAccountRepository.save(testEntity);
        PaymentAccount domain = saved.toDomain();
        domain.softDelete();
        PaymentAccountEntity updated = PaymentAccountEntity.fromDomain(domain);
        updated.setId(saved.getId());

        // Act
        paymentAccountRepository.save(updated);
        List<PaymentAccountEntity> activeAccounts = paymentAccountRepository
            .findByTenantIdAndTruckerIdAndDeletedAtIsNull(testTenantId, testTruckerId);

        // Assert
        assertEquals(0, activeAccounts.size(),
            "Soft-deleted accounts should not be returned");
    }

    @Test
    @DisplayName("AC-4: Should find all active accounts for trucker")
    void testFindByTenantAndTrucker_ReturnsActiveOnly() {
        // Arrange: Create 2 accounts for the same trucker (only one can be primary)
        String trucker1 = UUID.randomUUID().toString();
        jdbcTemplate.update(
            "INSERT INTO users (id, tenant_id, email, password_hash, role, first_name, last_name) " +
            "VALUES (?, ?, ?, '$2a$10$x', 'TRUCKER', 'T', 'R') ON CONFLICT (id) DO NOTHING",
            trucker1, testTenantId, trucker1 + "@test.com");

        PaymentAccount domain1 = PaymentAccount.createNew(
            "John Doe",
            "021000021",
            "1111111111",
            BankAccountType.CHECKING,
            "Account 1",
            testTenantId,
            trucker1
        );
        domain1.initiateVerification("code-1", 10, 20);
        domain1.confirmVerification(10, 20);
        domain1.setAsPrimary(true);

        PaymentAccount domain2 = PaymentAccount.createNew(
            "John Doe",
            "111000025",
            "2222222222",
            BankAccountType.SAVINGS,
            "Account 2",
            testTenantId,
            trucker1
        );

        PaymentAccountEntity entity1 = PaymentAccountEntity.fromDomain(domain1);
        PaymentAccountEntity entity2 = PaymentAccountEntity.fromDomain(domain2);
        entity2.setPrimary(false);

        paymentAccountRepository.save(entity1);
        paymentAccountRepository.save(entity2);

        // Act
        List<PaymentAccountEntity> accounts = paymentAccountRepository
            .findByTenantIdAndTruckerIdAndDeletedAtIsNull(testTenantId, trucker1);

        // Assert
        assertEquals(2, accounts.size());
    }

    @Test
    @DisplayName("AC-4: Should find primary account for trucker")
    void testFindPrimaryAccount() {
        // Arrange
        PaymentAccount domain = testEntity.toDomain();
        domain.initiateVerification("code-123", 1, 2);
        domain.confirmVerification(1, 2);
        domain.setAsPrimary(true);

        PaymentAccountEntity entity = PaymentAccountEntity.fromDomain(domain);
        paymentAccountRepository.save(entity);

        // Act
        Optional<PaymentAccountEntity> primary = paymentAccountRepository
            .findByTenantIdAndTruckerIdAndIsPrimaryTrueAndDeletedAtIsNull(testTenantId, testTruckerId);

        // Assert
        assertTrue(primary.isPresent());
        assertTrue(primary.get().isPrimary());
    }

    @Test
    @DisplayName("AC-6: Should enforce multi-tenancy (RLS equivalent)")
    void testMultiTenancyIsolation() {
        // Arrange
        // Distinctly-scoped ids (not the generic "test-tenant-123"/"tenant-1" used elsewhere in
        // the suite) — createTenantIfMissing's existence check is itself RLS-scoped, so a
        // same-named tenant created by another test class under a different tenant context is
        // invisible to this check and would collide on INSERT (US-858).
        String tenantA = "tenant-payment-mtx-a";
        String tenantB = "tenant-payment-mtx-b";
        String truckerA = UUID.randomUUID().toString();
        String truckerB = UUID.randomUUID().toString();
        // US-858: raw ON CONFLICT DO NOTHING fails under RLS (conflict-check needs SELECT
        // visibility a scoped policy denies), and each user INSERT is RLS-checked against its
        // own tenant_id. Reuse the class's check-then-insert, context-switching helpers instead
        // of inlining raw SQL here.
        createTenantIfMissing(tenantA, "Tenant A");
        createTenantIfMissing(tenantB, "Tenant B");
        createUserIfMissing(truckerA, truckerA + "@test.com", UserRole.TRUCKER, tenantA);
        createUserIfMissing(truckerB, truckerB + "@test.com", UserRole.TRUCKER, tenantB);

        PaymentAccount tenantADomain = PaymentAccount.createNew(
            "Trucker A",
            "021000021",
            "1111111111",
            BankAccountType.CHECKING,
            null,
            tenantA,
            truckerA
        );

        PaymentAccount tenantBDomain = PaymentAccount.createNew(
            "Trucker B",
            "111000025",
            "2222222222",
            BankAccountType.SAVINGS,
            null,
            tenantB,
            truckerB
        );

        // Save each account under its OWN tenant's context — the class's @BeforeEach left
        // context bound to testTenantId, and createUserIfMissing above restores it after each
        // switch, so a plain save() here would defer-write both rows under the wrong tenant
        // (US-858).
        TenantContextHolder.setTenantId(tenantA);
        paymentAccountRepository.save(PaymentAccountEntity.fromDomain(tenantADomain));
        entityManager.flush();

        TenantContextHolder.setTenantId(tenantB);
        paymentAccountRepository.save(PaymentAccountEntity.fromDomain(tenantBDomain));
        entityManager.flush();

        // Act — each query must run under its own tenant's context too; RLS scopes SELECT
        // visibility the same way it scopes INSERT (US-858).
        TenantContextHolder.setTenantId(tenantA);
        List<PaymentAccountEntity> tenantAAccounts = paymentAccountRepository
            .findByTenantIdAndTruckerIdAndDeletedAtIsNull(tenantA, truckerA);

        TenantContextHolder.setTenantId(tenantB);
        List<PaymentAccountEntity> tenantBAccounts = paymentAccountRepository
            .findByTenantIdAndTruckerIdAndDeletedAtIsNull(tenantB, truckerB);

        // Assert
        assertEquals(1, tenantAAccounts.size());
        assertEquals(1, tenantBAccounts.size());
        assertEquals(tenantA, tenantAAccounts.get(0).getTenantId());
        assertEquals(tenantB, tenantBAccounts.get(0).getTenantId());
    }

    @Test
    @DisplayName("Should find pending verification accounts (for background job)")
    void testFindByStatusAndCreatedBefore() {
        // Arrange
        PaymentAccount domain = PaymentAccount.createNew(
            "John Doe",
            "021000021",
            "1111111111",
            BankAccountType.CHECKING,
            null,
            testTenantId,
            testTruckerId
        );
        paymentAccountRepository.save(PaymentAccountEntity.fromDomain(domain));

        // Act
        List<PaymentAccountEntity> pendingAccounts = paymentAccountRepository
            .findByStatusAndDeletedAtIsNull(PaymentAccountStatus.PENDING_VERIFICATION);

        // Assert
        assertTrue(pendingAccounts.size() >= 1);
        assertTrue(pendingAccounts.stream()
            .anyMatch(acc -> acc.getId().equals(domain.getId())));
    }
}
