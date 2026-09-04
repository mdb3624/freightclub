package com.freightclub.service;

import com.freightclub.dto.RegisterRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

// Security fix companion (2026-09-03): bootstraps exactly one ADMIN account on a fresh
// environment now that public self-registration can no longer create one.
@ExtendWith(MockitoExtension.class)
class DefaultSuperUserBootstrapRunnerTest {

    @Mock private AuthService authService;
    @Mock private JdbcTemplate superUserReadJdbcTemplate;

    private DefaultSuperUserBootstrapRunner newRunner(String email, String password) {
        DefaultSuperUserBootstrapRunner runner = new DefaultSuperUserBootstrapRunner(authService, superUserReadJdbcTemplate);
        ReflectionTestUtils.setField(runner, "email", email);
        ReflectionTestUtils.setField(runner, "password", password);
        ReflectionTestUtils.setField(runner, "companyName", "FreightClub Ops");
        return runner;
    }

    @Test
    void doesNothing_whenEmailNotConfigured() throws Exception {
        DefaultSuperUserBootstrapRunner runner = newRunner("", "SomePassword1!");

        runner.run(null);

        verify(authService, never()).register(any());
    }

    @Test
    void doesNothing_whenPasswordNotConfigured() throws Exception {
        DefaultSuperUserBootstrapRunner runner = newRunner("admin@example.com", "");

        runner.run(null);

        verify(authService, never()).register(any());
    }

    @Test
    void doesNothing_whenAnAdminAlreadyExists() throws Exception {
        when(superUserReadJdbcTemplate.queryForObject(anyString(), eq(Long.class))).thenReturn(1L);
        DefaultSuperUserBootstrapRunner runner = newRunner("admin@example.com", "SomePassword1!");

        runner.run(null);

        verify(authService, never()).register(any());
    }

    @Test
    void createsAdmin_whenConfiguredAndNoAdminExists() throws Exception {
        when(superUserReadJdbcTemplate.queryForObject(anyString(), eq(Long.class))).thenReturn(0L);
        DefaultSuperUserBootstrapRunner runner = newRunner("admin@example.com", "SomePassword1!");

        runner.run(null);

        verify(authService).register(argThatMatches());
    }

    private RegisterRequest argThatMatches() {
        return org.mockito.ArgumentMatchers.argThat(req ->
                req != null
                        && "admin@example.com".equals(req.email())
                        && "SomePassword1!".equals(req.password())
                        && req.role() == com.freightclub.domain.UserRole.ADMIN
                        && "FreightClub Ops".equals(req.companyName()));
    }
}
