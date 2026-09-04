package com.freightclub.service;

import com.freightclub.domain.UserRole;
import com.freightclub.dto.RegisterRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

// Security fix companion (2026-09-03): public self-registration can no longer create ADMIN
// accounts (AuthController), which closes the privilege-escalation hole but reopens a
// bootstrapping question — how does the very first Super User account get created in a fresh
// environment? This runs once at startup and creates exactly one, directly via
// AuthService.register() (bypassing the now-restricted public HTTP boundary, not the
// underlying business logic), only if both credentials are configured AND no ADMIN account
// exists yet. Idempotent and optional: most environments (CI, PR previews, local dev without
// the env vars set) simply skip this entirely.
@Component
public class DefaultSuperUserBootstrapRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DefaultSuperUserBootstrapRunner.class);

    private final AuthService authService;
    private final JdbcTemplate superUserReadJdbcTemplate;

    @Value("${app.default-super-user.email:}")
    private String email;

    @Value("${app.default-super-user.password:}")
    private String password;

    @Value("${app.default-super-user.company-name:FreightClub Ops}")
    private String companyName;

    public DefaultSuperUserBootstrapRunner(AuthService authService,
                                            @Qualifier("superUserReadJdbcTemplate") JdbcTemplate superUserReadJdbcTemplate) {
        this.authService = authService;
        this.superUserReadJdbcTemplate = superUserReadJdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            return;
        }
        if (adminAlreadyExists()) {
            return;
        }

        authService.register(new RegisterRequest(
                email, password, "Super", "Admin", UserRole.ADMIN,
                companyName, null, null, null, null));
        log.info("Default Super User bootstrapped: {}", email);
    }

    // freightclub_super_user_read (BYPASSRLS) — startup runs with no tenant context bound, so
    // the regular tenant-scoped JPA path can't see across all tenants to answer this.
    private boolean adminAlreadyExists() {
        Long count = superUserReadJdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM freightclub.users WHERE role = 'ADMIN' AND deleted_at IS NULL",
                Long.class);
        return count != null && count > 0;
    }
}
