package com.freightclub.infrastructure.rls;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.sql.*;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Verifies that PostgreSQL RLS policies enforce tenant isolation.
 * Uses a real Postgres 16 container — no mocks, no Spring context.
 * FORCE ROW LEVEL SECURITY means even the superuser connection is subject to policies.
 */
@Testcontainers(disabledWithoutDocker = true)
class RlsPolicyTest {

    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("freightclub_test");

    private Connection conn;

    private final String tenantA = UUID.randomUUID().toString();
    private final String tenantB = UUID.randomUUID().toString();

    @BeforeEach
    void setUp() throws Exception {
        conn = DriverManager.getConnection(
                POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
        conn.setAutoCommit(false);
        bootstrapSchema();
        seedData();
        conn.commit();
    }

    @AfterEach
    void tearDown() throws Exception {
        if (conn != null && !conn.isClosed()) conn.close();
    }

    // ── Red → Green tests ──────────────────────────────────────────────────────

    @Test
    @DisplayName("tenantA session sees only tenantA loads")
    void tenantA_sees_only_its_own_loads() throws Exception {
        setTenant(tenantA);

        try (Statement st = conn.createStatement();
             ResultSet rs = st.executeQuery("SELECT COUNT(*) FROM loads")) {
            rs.next();
            assertThat(rs.getInt(1)).isEqualTo(1);
        }
    }

    @Test
    @DisplayName("tenantB session cannot see tenantA loads")
    void tenantB_cannot_see_tenantA_loads() throws Exception {
        setTenant(tenantB);

        try (Statement st = conn.createStatement();
             ResultSet rs = st.executeQuery("SELECT id FROM loads WHERE tenant_id = '" + tenantA + "'")) {
            assertThat(rs.next()).isFalse();
        }
    }

    @Test
    @DisplayName("unset tenant variable returns zero rows — not an error")
    void unset_tenant_variable_returns_zero_rows() throws Exception {
        // Simulate a connection pool slot where SET was never called
        try (Statement st = conn.createStatement()) {
            st.execute("RESET app.current_tenant");
        }

        try (Statement st = conn.createStatement();
             ResultSet rs = st.executeQuery("SELECT COUNT(*) FROM loads")) {
            rs.next();
            assertThat(rs.getInt(1)).isZero();
        }
    }

    @Test
    @DisplayName("carriers table exists with RLS enabled")
    void carriers_table_has_rls_enabled() throws Exception {
        try (PreparedStatement ps = conn.prepareStatement(
                "SELECT rowsecurity FROM pg_tables WHERE tablename = 'carriers' AND schemaname = 'public'")) {
            ResultSet rs = ps.executeQuery();
            assertThat(rs.next()).isTrue();
            assertThat(rs.getBoolean("rowsecurity")).isTrue();
        }
    }

    @Test
    @DisplayName("tenant_isolation policy exists on loads table")
    void tenant_isolation_policy_exists_on_loads() throws Exception {
        try (PreparedStatement ps = conn.prepareStatement(
                "SELECT policyname FROM pg_policies WHERE tablename = 'loads' AND policyname = 'tenant_isolation'")) {
            ResultSet rs = ps.executeQuery();
            assertThat(rs.next()).isTrue();
        }
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private void setTenant(String tenantId) throws Exception {
        try (PreparedStatement ps = conn.prepareStatement("SELECT set_config('app.current_tenant', ?, false)")) {
            ps.setString(1, tenantId);
            ps.execute();
        }
    }

    private void bootstrapSchema() throws Exception {
        try (Statement st = conn.createStatement()) {
            st.execute("""
                CREATE TABLE IF NOT EXISTS tenants (
                  id VARCHAR(36) PRIMARY KEY,
                  name VARCHAR(255) NOT NULL
                )
                """);

            st.execute("""
                CREATE TABLE IF NOT EXISTS loads (
                  id         VARCHAR(36) PRIMARY KEY,
                  tenant_id  VARCHAR(36) NOT NULL REFERENCES tenants(id),
                  status     VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
                  deleted_at TIMESTAMPTZ
                )
                """);

            st.execute("""
                CREATE TABLE IF NOT EXISTS carriers (
                  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                  tenant_id    VARCHAR(36) NOT NULL REFERENCES tenants(id),
                  mc_number    VARCHAR(20) NOT NULL,
                  company_name VARCHAR(255) NOT NULL,
                  deleted_at   TIMESTAMPTZ
                )
                """);

            // Apply RLS — mirrors V20260421_001 migration
            st.execute("ALTER TABLE loads ENABLE ROW LEVEL SECURITY");
            st.execute("ALTER TABLE loads FORCE ROW LEVEL SECURITY");
            st.execute("""
                CREATE POLICY tenant_isolation ON loads
                  USING (tenant_id::text = current_setting('app.current_tenant', true))
                """);

            st.execute("ALTER TABLE carriers ENABLE ROW LEVEL SECURITY");
            st.execute("ALTER TABLE carriers FORCE ROW LEVEL SECURITY");
            st.execute("""
                CREATE POLICY tenant_isolation ON carriers
                  USING (tenant_id::text = current_setting('app.current_tenant', true))
                """);
        }
    }

    private void seedData() throws Exception {
        try (PreparedStatement ins = conn.prepareStatement(
                "INSERT INTO tenants (id, name) VALUES (?, ?)")) {
            ins.setString(1, tenantA); ins.setString(2, "Tenant Alpha"); ins.executeUpdate();
            ins.setString(1, tenantB); ins.setString(2, "Tenant Beta");  ins.executeUpdate();
        }
        try (PreparedStatement ins = conn.prepareStatement(
                "INSERT INTO loads (id, tenant_id, status) VALUES (?, ?, 'DRAFT')")) {
            ins.setString(1, UUID.randomUUID().toString()); ins.setString(2, tenantA); ins.executeUpdate();
            ins.setString(1, UUID.randomUUID().toString()); ins.setString(2, tenantB); ins.executeUpdate();
        }
    }
}
