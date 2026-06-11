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
 * Verifies migration V20260606_1740__ThemeStateSeparation creates the
 * user_preferences, carrier_telemetry and shipper_telemetry tables with
 * RLS enabled and tenant-isolation policies, per docs/plans/theme-state-separation.md.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ThemeStateSeparationMigrationTest {

    @Autowired
    private DataSource dataSource;

    private static final String[] NEW_TABLES = {
        "user_preferences",
        "carrier_telemetry",
        "shipper_telemetry"
    };

    @Test
    void testTablesExistWithSoftDeleteAndTenantColumns() throws SQLException {
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {

            for (String table : NEW_TABLES) {
                String query = "SELECT column_name FROM information_schema.columns " +
                    "WHERE table_schema = 'freightclub' AND table_name = '" + table + "'";
                ResultSet rs = stmt.executeQuery(query);

                boolean hasTenantId = false;
                boolean hasDeletedAt = false;
                boolean any = false;
                while (rs.next()) {
                    any = true;
                    String col = rs.getString(1);
                    if ("tenant_id".equals(col)) hasTenantId = true;
                    if ("deleted_at".equals(col)) hasDeletedAt = true;
                }

                assertTrue(any, "Table " + table + " should exist");
                assertTrue(hasTenantId, "Table " + table + " should have tenant_id column");
                assertTrue(hasDeletedAt, "Table " + table + " should have deleted_at column for soft deletes");
            }
        }
    }

    @Test
    void testRLSEnabledOnNewTables() throws SQLException {
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {

            for (String table : NEW_TABLES) {
                String query = "SELECT relrowsecurity FROM pg_class WHERE relname = '" + table + "' AND relnamespace = " +
                    "(SELECT oid FROM pg_namespace WHERE nspname = 'freightclub')";
                ResultSet rs = stmt.executeQuery(query);

                assertTrue(rs.next(), "Table " + table + " should exist");
                assertTrue(rs.getBoolean(1), "RLS should be enabled on table " + table);
            }
        }
    }

    @Test
    void testPoliciesUseAppCurrentTenantForIsolation() throws SQLException {
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {

            for (String table : NEW_TABLES) {
                String query = "SELECT COUNT(*) FROM pg_policies WHERE tablename = '" + table +
                    "' AND qual LIKE '%tenant_id%' AND qual LIKE '%app.current_tenant%'";
                ResultSet rs = stmt.executeQuery(query);

                assertTrue(rs.next(), "Should be able to query policies for table " + table);
                assertTrue(rs.getInt(1) >= 1,
                    "At least one tenant-isolation policy should exist on " + table);
            }
        }
    }

    @Test
    void testRuntimeRoleHasGrantsOnNewTables() throws SQLException {
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {

            for (String table : NEW_TABLES) {
                String query = "SELECT COUNT(*) FROM information_schema.role_table_grants " +
                    "WHERE table_schema = 'freightclub' AND table_name = '" + table +
                    "' AND grantee = 'freightclub_runtime' AND privilege_type IN ('SELECT', 'INSERT', 'UPDATE')";
                ResultSet rs = stmt.executeQuery(query);

                assertTrue(rs.next(), "Should be able to query grants for table " + table);
                assertTrue(rs.getInt(1) >= 3,
                    "freightclub_runtime should have SELECT/INSERT/UPDATE on " + table);
            }
        }
    }
}
