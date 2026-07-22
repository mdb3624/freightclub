package com.freightclub.config;

import com.freightclub.security.TenantContextHolder;
import org.springframework.jdbc.datasource.DelegatingDataSource;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * US-858: replaces RlsStatementInspector, which never actually worked — it was never wired
 * into Hibernate (no HibernatePropertiesCustomizer ever registered it as
 * hibernate.session_factory.statement_inspector), and its technique (string-concatenating
 * "SET LOCAL ...; " onto the next SQL statement) is independently broken for any
 * parameterized statement: PostgreSQL's extended query protocol does not apply a SET LOCAL
 * prefix combined with bind parameters in one PreparedStatement — confirmed via a standalone
 * JDBC reproduction (see US-858 story doc), where the combined form silently inserted zero
 * rows instead of throwing.
 *
 * This wraps every connection Hibernate/JPA obtains: forces autocommit off, then issues
 * SET LOCAL as its own statement — a separate JDBC round-trip, not string concatenation —
 * before handing the connection back. Because HikariCP/Spring's JpaTransactionManager
 * acquires a fresh connection per transaction via DataSourceUtils.getConnection(dataSource),
 * this runs once per transaction, and SET LOCAL's transaction-scoped effect correctly
 * persists through every subsequent statement Hibernate issues on that connection.
 */
public class TenantAwareDataSource extends DelegatingDataSource {

    public TenantAwareDataSource(DataSource targetDataSource) {
        super(targetDataSource);
    }

    @Override
    public Connection getConnection() throws SQLException {
        Connection connection = super.getConnection();
        applyTenantContext(connection);
        return connection;
    }

    @Override
    public Connection getConnection(String username, String password) throws SQLException {
        Connection connection = super.getConnection(username, password);
        applyTenantContext(connection);
        return connection;
    }

    private void applyTenantContext(Connection connection) throws SQLException {
        String tenantId;
        try {
            tenantId = TenantContextHolder.getTenantId();
        } catch (IllegalStateException e) {
            // No tenant context bound (schema init, cleanup, pre-auth paths) — leave as-is.
            return;
        }

        // Must be non-autocommit for SET LOCAL's scope to extend past this one statement.
        // Idempotent: Spring's transaction manager calling setAutoCommit(false) again right
        // after this is a no-op, not a reset.
        connection.setAutoCommit(false);
        try (Statement statement = connection.createStatement()) {
            statement.execute("SET LOCAL app.current_tenant = '" + tenantId.replace("'", "''") + "'");
        }
    }
}
