package com.freightclub.service;

import com.freightclub.domain.User;
import com.freightclub.repository.UserRepository;
import com.freightclub.security.TenantContextHolder;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

// Council-review-driven fix (2026-09-02): TeamService.removeMember/setTenantAdminStatus already
// block reaching zero active admins through the live UI (LastTenantAdminException) — this job
// exists for the paths that check can't cover: legacy data (the 13-tenant backfill this same
// change fixes) and any future user-deletion path that bypasses TeamService. Reads the
// cross-tenant detection query through superUserReadJdbcTemplate (BYPASSRLS, same pattern as
// SuperUserDashboardService) since freightclub_runtime's RLS can't see other tenants; the actual
// per-tenant promotion goes through the normal tenant-scoped JPA path via TenantContextHolder,
// exactly like AuthService's register/login (see TenantContextHolder's own doc comment).
@ExtendWith(MockitoExtension.class)
class TenantAdminReconciliationServiceTest {

    @Mock private JdbcTemplate superUserReadJdbcTemplate;
    @Mock private UserRepository userRepository;
    @Mock private EmailService emailService;

    @AfterEach
    void clearTenantContext() {
        TenantContextHolder.clear();
    }

    private User activeMember(String id, String tenantId, String email, boolean isTenantAdmin) {
        User u = new User(id);
        u.setTenantId(tenantId);
        u.setEmail(email);
        u.setFirstName("Test");
        u.setLastName("User");
        u.setTenantAdmin(isTenantAdmin);
        return u;
    }

    @Test
    void promotesEarliestActiveMember_forEachZeroAdminTenant() {
        when(superUserReadJdbcTemplate.queryForList(anyString(), eq(String.class)))
                .thenReturn(List.of("tenant-1"));

        User earliest = activeMember("user-1", "tenant-1", "earliest@acme.test", false);
        User later = activeMember("user-2", "tenant-1", "later@acme.test", false);
        when(userRepository.findAllByTenantIdAndDeletedAtIsNullOrderByCreatedAtAsc("tenant-1"))
                .thenReturn(List.of(earliest, later));

        TenantAdminReconciliationService service =
                new TenantAdminReconciliationService(superUserReadJdbcTemplate, userRepository, emailService);
        service.reconcileZeroAdminTenants();

        assertThat(earliest.isTenantAdmin()).isTrue();
        verify(userRepository).save(earliest);
        verify(userRepository, never()).save(later);
        verify(emailService).send(eq("earliest@acme.test"), anyString(), anyString());
    }

    @Test
    void clearsTenantContext_afterEachTenant_evenOnFailure() {
        when(superUserReadJdbcTemplate.queryForList(anyString(), eq(String.class)))
                .thenReturn(List.of("tenant-1"));
        when(userRepository.findAllByTenantIdAndDeletedAtIsNullOrderByCreatedAtAsc("tenant-1"))
                .thenThrow(new RuntimeException("boom"));

        TenantAdminReconciliationService service =
                new TenantAdminReconciliationService(superUserReadJdbcTemplate, userRepository, emailService);
        service.reconcileZeroAdminTenants();

        assertThatThrownBy(TenantContextHolder::getTenantId).isInstanceOf(IllegalStateException.class);
        verify(emailService, never()).send(anyString(), anyString(), anyString());
    }

    @Test
    void skipsTenant_withNoActiveMembers_withoutError() {
        when(superUserReadJdbcTemplate.queryForList(anyString(), eq(String.class)))
                .thenReturn(List.of("tenant-empty"));
        when(userRepository.findAllByTenantIdAndDeletedAtIsNullOrderByCreatedAtAsc("tenant-empty"))
                .thenReturn(List.of());

        TenantAdminReconciliationService service =
                new TenantAdminReconciliationService(superUserReadJdbcTemplate, userRepository, emailService);
        service.reconcileZeroAdminTenants();

        verify(userRepository, never()).save(any());
        verify(emailService, never()).send(anyString(), anyString(), anyString());
    }

    @Test
    void isIdempotent_doesNotRePromoteOrRenotify_ifAlreadyResolvedByTheTimeItRuns() {
        // Detection query race: tenant showed zero-admin at query time but the earliest member
        // is already an admin by the time this runs (e.g. a concurrent grant). Defensive check,
        // not the primary path.
        when(superUserReadJdbcTemplate.queryForList(anyString(), eq(String.class)))
                .thenReturn(List.of("tenant-1"));
        User alreadyAdmin = activeMember("user-1", "tenant-1", "boss@acme.test", true);
        when(userRepository.findAllByTenantIdAndDeletedAtIsNullOrderByCreatedAtAsc("tenant-1"))
                .thenReturn(List.of(alreadyAdmin));

        TenantAdminReconciliationService service =
                new TenantAdminReconciliationService(superUserReadJdbcTemplate, userRepository, emailService);
        service.reconcileZeroAdminTenants();

        verify(userRepository, never()).save(any());
        verify(emailService, never()).send(anyString(), anyString(), anyString());
    }
}
