package com.freightclub.infrastructure.persistence;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import static org.junit.jupiter.api.Assertions.*;

/**
 * SEC-002: PostgreSQL RLS Policies verify that migration V20260522_2100
 * correctly enables RLS and creates policies on 5 tables.
 *
 * These tests verify the database-level RLS setup (policies exist and
 * are correctly configured), not enforcement (which requires non-superuser role).
 *
 * Actual RLS enforcement is verified by:
 * 1. Application code setting app.current_tenant via TenantAwareDataSource (US-858 —
 *    replaces the previous RlsStatementInspector, which was never wired into Hibernate and
 *    whose technique was independently broken for parameterized statements)
 * 2. Production deployments using freightclub_runtime role (not superuser)
 * 3. TenantIsolationEnforcementTest (real cross-tenant enforcement, not just policy existence)
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class RLSPoliciesTest {

    @Autowired
    private DataSource dataSource;

    private static final String[] PROTECTED_TABLES = {
        "message_outbox",
        "shipper_profiles",
        "payment_accounts",
        "load_recommendations",
        "carrier_cost_profiles"
    };

    // ═════════════════════════════════════════════════════════════════════════════
    // SEC-002-AC-001: RLS enabled on all 5 tables
    // ═════════════════════════════════════════════════════════════════════════════
    @Test
    void testRLSEnabledOnAllProtectedTables() throws SQLException {
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {

            for (String table : PROTECTED_TABLES) {
                String query = "SELECT relrowsecurity FROM pg_class WHERE relname = '" + table + "' AND relnamespace = " +
                    "(SELECT oid FROM pg_namespace WHERE nspname = 'freightclub')";
                ResultSet rs = stmt.executeQuery(query);

                assertTrue(rs.next(), "Table " + table + " should exist");
                boolean isRlsEnabled = rs.getBoolean(1);
                assertTrue(isRlsEnabled, "RLS should be enabled on table " + table);
            }
        }
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // SEC-002-AC-002: Policies exist on all 5 tables and use tenant_id
    // ═════════════════════════════════════════════════════════════════════════════
    @Test
    void testPoliciesExistOnAllProtectedTables() throws SQLException {
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {

            for (String table : PROTECTED_TABLES) {
                String query = "SELECT COUNT(*) FROM pg_policies WHERE tablename = '" + table + "' " +
                    "AND qual LIKE '%tenant_id%'";
                ResultSet rs = stmt.executeQuery(query);

                assertTrue(rs.next(), "Should be able to query policies for table " + table);
                int count = rs.getInt(1);
                assertTrue(count >= 1, "At least 1 policy with tenant_id check should exist on " + table +
                    "; found " + count);
            }
        }
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // SEC-002-AC-003: Policies use app.current_tenant for tenant isolation
    // ═════════════════════════════════════════════════════════════════════════════
    @Test
    void testPoliciesUseAppCurrentTenant() throws SQLException {
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {

            for (String table : PROTECTED_TABLES) {
                String query = "SELECT COUNT(*) FROM pg_policies WHERE tablename = '" + table +
                    "' AND qual LIKE '%app.current_tenant%'";
                ResultSet rs = stmt.executeQuery(query);

                assertTrue(rs.next(), "Should be able to query policies for table " + table);
                int count = rs.getInt(1);
                assertTrue(count >= 1, "At least 1 policy using app.current_tenant should exist on " + table +
                    "; found " + count);
            }
        }
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // SEC-002-AC-004: All policies use tenant_id = app.current_tenant
    // ═════════════════════════════════════════════════════════════════════════════
    @Test
    void testAllPoliciesUseTenantIsolationExpression() throws SQLException {
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {

            for (String table : PROTECTED_TABLES) {
                String query = "SELECT COUNT(*) FROM pg_policies WHERE tablename = '" + table +
                    "' AND qual LIKE '%tenant_id%' AND qual LIKE '%app.current_tenant%'";
                ResultSet rs = stmt.executeQuery(query);

                assertTrue(rs.next(), "Should be able to query policies for table " + table);
                int count = rs.getInt(1);
                assertTrue(count >= 1, "At least one policy with tenant_id = app.current_tenant should exist on " +
                    table + "; found " + count);
            }
        }
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // SEC-002-AC-002: Verify TenantAwareDataSource is wired as the primary DataSource
    // ═════════════════════════════════════════════════════════════════════════════
    @Test
    void testTenantAwareDataSourceConfigured() {
        // Confirms the DataSource Hibernate/JPA actually uses is the tenant-aware wrapper
        // (US-858) — real per-transaction SET LOCAL enforcement is verified by
        // TenantIsolationEnforcementTest, not here.
        assertInstanceOf(com.freightclub.config.TenantAwareDataSource.class, dataSource,
                "Primary DataSource must be TenantAwareDataSource for RLS context to apply");
    }
}
