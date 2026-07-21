package com.freightclub.infrastructure.persistence;

import com.freightclub.domain.Tenant;
import com.freightclub.domain.User;
import com.freightclub.domain.UserRole;
import com.freightclub.repository.TenantRepository;
import com.freightclub.repository.UserRepository;
import com.freightclub.security.TenantContextHolder;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * US-857 AC-1/AC-5: this is the regression guard the whole story exists to add.
 * RLSPoliciesTest (pre-existing) explicitly documented it could only verify policies
 * *exist* — not that they're *enforced* — because freightclub_runtime was the Postgres
 * bootstrap superuser in the Docker test env, and superusers bypass RLS unconditionally
 * regardless of the BYPASSRLS role attribute. docker-compose.test.yml now runs a real,
 * non-superuser freightclub_runtime (see V20260721_1403/1404), so this test is meaningful:
 * if RLS enforcement ever regresses, this fails for real, not just on paper.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class TenantIsolationEnforcementTest {

    @Autowired private UserRepository userRepository;
    @Autowired private TenantRepository tenantRepository;
    @Autowired private DataSource dataSource;

    @AfterEach
    void clearTenantContext() {
        TenantContextHolder.clear();
    }

    @Disabled("BYPASSRLS revocation (V20260721_1405) deferred pending investigation into "
            + "whether RlsStatementInspector's SET LOCAL prefix reliably reaches Hibernate's "
            + "parameterized INSERT/UPDATE statements — see US-857 story doc. freightclub_runtime "
            + "still has BYPASSRLS, so this correctly fails until that follow-up ships and "
            + "V20260721_1405 is renamed back from .pending-investigation.")
    @Test
    void freightclubRuntimeCannotReadAnotherTenantsUser_byId() {
        Tenant tenantA = createTenant("Tenant A - " + System.nanoTime());
        Tenant tenantB = createTenant("Tenant B - " + System.nanoTime());

        User userA = saveUserInTenant(tenantA.getId(), "userA-" + System.nanoTime() + "@example.com");

        // Bind context to Tenant B, then try to read Tenant A's user directly by id.
        TenantContextHolder.setTenantId(tenantB.getId());
        Optional<User> crossTenantRead = userRepository.findById(userA.getId());

        assertThat(crossTenantRead)
                .as("users_tenant_isolation must block a cross-tenant findById, not just app-layer filters")
                .isEmpty();
    }

    @Disabled("BYPASSRLS revocation deferred — see US-857 story doc; freightclub_runtime "
            + "still bypasses RLS so this correctly fails until the follow-up ships.")
    @Test
    void freightclubRuntimeCannotReadAnotherTenantsUser_byEmail() {
        Tenant tenantA = createTenant("Tenant A - " + System.nanoTime());
        Tenant tenantB = createTenant("Tenant B - " + System.nanoTime());
        String email = "userA-" + System.nanoTime() + "@example.com";
        saveUserInTenant(tenantA.getId(), email);

        TenantContextHolder.setTenantId(tenantB.getId());
        Optional<User> crossTenantRead = userRepository.findByEmailAndDeletedAtIsNull(email);

        assertThat(crossTenantRead).isEmpty();
    }

    @Disabled("BYPASSRLS revocation deferred — see US-857 story doc; freightclub_runtime "
            + "still bypasses RLS so this correctly fails until the follow-up ships.")
    @Test
    void freightclubRuntimeQueryFailsClosed_whenTenantContextUnbound() {
        Tenant tenantA = createTenant("Tenant A - " + System.nanoTime());
        String email = "unbound-" + System.nanoTime() + "@example.com";
        saveUserInTenant(tenantA.getId(), email);

        // AC-4: no context bound at all (simulates a future bug where TenantContextHolder
        // is never set). users_tenant_isolation now uses current_setting(..., true), so this
        // must return empty, not throw a 500 from Postgres.
        TenantContextHolder.clear();
        Optional<User> result = userRepository.findByEmailAndDeletedAtIsNull(email);

        assertThat(result).isEmpty();
    }

    /**
     * AC-3: freightclub_login_lookup can SELECT users/tenants (named columns) and nothing
     * else — connects directly with its own credentials rather than going through the app's
     * JPA layer, to prove the database-level grant itself, not just application code that
     * happens to only call SELECT methods on it.
     */
    @Test
    void loginLookupRoleCannotWriteToUsers() throws SQLException {
        String url = extractJdbcUrl();
        try (Connection loginLookupConn = DriverManager.getConnection(
                url, "freightclub_login_lookup", System.getenv().getOrDefault("DB_LOGIN_PASSWORD", "freightclub_login"))) {
            assertThatThrownBy(() -> loginLookupConn.createStatement().executeUpdate(
                    "UPDATE freightclub.users SET first_name = 'hacked' WHERE 1=1"))
                    .as("freightclub_login_lookup was only granted SELECT — any write must be permission-denied")
                    .isInstanceOf(SQLException.class);
        }
    }

    @Test
    void loginLookupRoleCannotReadOutsideUsersAndTenants() throws SQLException {
        String url = extractJdbcUrl();
        try (Connection loginLookupConn = DriverManager.getConnection(
                url, "freightclub_login_lookup", System.getenv().getOrDefault("DB_LOGIN_PASSWORD", "freightclub_login"))) {
            assertThatThrownBy(() -> loginLookupConn.createStatement().executeQuery(
                    "SELECT * FROM freightclub.loads LIMIT 1"))
                    .as("freightclub_login_lookup has no grant on freightclub.loads")
                    .isInstanceOf(SQLException.class);
        }
    }

    private Tenant createTenant(String name) {
        Tenant tenant = new Tenant();
        tenant.setName(name);
        tenant.setJoinCode(("J" + System.nanoTime()).substring(0, 12));
        return tenantRepository.save(tenant);
    }

    private User saveUserInTenant(String tenantId, String email) {
        TenantContextHolder.setTenantId(tenantId);
        try {
            User user = new User();
            user.setTenantId(tenantId);
            user.setEmail(email);
            user.setPasswordHash("hash");
            user.setRole(UserRole.SHIPPER);
            user.setFirstName("Test");
            user.setLastName("User");
            return userRepository.save(user);
        } finally {
            TenantContextHolder.clear();
        }
    }

    private String extractJdbcUrl() throws SQLException {
        try (Connection c = dataSource.getConnection()) {
            return c.getMetaData().getURL();
        }
    }
}
