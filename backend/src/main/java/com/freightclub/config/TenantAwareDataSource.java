package com.freightclub.config;

import com.freightclub.security.TenantContextHolder;
import org.springframework.jdbc.datasource.DelegatingDataSource;

import javax.sql.DataSource;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Proxy;
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
 * before handing the connection back.
 *
 * US-874/875 follow-up fix: the original version only reapplied SET LOCAL at physical
 * connection acquisition, on the assumption that HikariCP/JpaTransactionManager acquires a
 * fresh connection per transaction. That assumption breaks under Open-Session-In-View
 * (Spring Boot's spring.jpa.open-in-view default, never explicitly disabled here): OSIV holds
 * ONE physical connection for the entire HTTP request, and issues multiple independent
 * @Transactional BEGIN/COMMIT pairs against it without ever calling getConnection() again.
 * PostgreSQL's SET LOCAL is scoped to exactly one transaction and is reset automatically at
 * COMMIT/ROLLBACK — so only the *first* transaction on that connection ever saw the tenant
 * context; every later one in the same request silently ran with none, and RLS failed closed.
 * This was invisible until US-875 enabled @EnableMethodSecurity for the first time: a
 * @PreAuthorize("@xService.isOwner(...))") check now runs its own transaction *before* the
 * controller method's, and became the request's "first" transaction, so the request's real
 * work — the second transaction — lost tenant context. Reproduced live via
 * PUT /api/v1/profile returning "User not found" for the request's own authenticated user.
 * Fixed by wrapping the connection so commit()/rollback() immediately reapply SET LOCAL
 * afterward, using the same thread's still-valid TenantContextHolder value — proactively
 * covering whatever transaction comes next on this same physical connection, rather than
 * assuming there won't be one.
 */
public class TenantAwareDataSource extends DelegatingDataSource {

    public TenantAwareDataSource(DataSource targetDataSource) {
        super(targetDataSource);
    }

    @Override
    public Connection getConnection() throws SQLException {
        Connection connection = super.getConnection();
        applyTenantContext(connection);
        return wrapForReapplyOnTransactionBoundary(connection);
    }

    @Override
    public Connection getConnection(String username, String password) throws SQLException {
        Connection connection = super.getConnection(username, password);
        applyTenantContext(connection);
        return wrapForReapplyOnTransactionBoundary(connection);
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

    // Reissues SET LOCAL immediately after every commit()/rollback() on this physical
    // connection, so a second (or third...) @Transactional boundary reusing the same
    // OSIV-held connection within the same request still has tenant context bound for
    // whatever it does next. A no-op if TenantContextHolder is unbound or already cleared
    // (request has ended) — applyTenantContext() already handles that silently.
    private Connection wrapForReapplyOnTransactionBoundary(Connection real) {
        InvocationHandler handler = (proxy, method, args) -> {
            Object result = method.invoke(real, args);
            String name = method.getName();
            if (name.equals("commit") || name.equals("rollback")) {
                try {
                    applyTenantContext(real);
                } catch (SQLException ignored) {
                    // Connection may already be closed/invalid post-rollback in some paths —
                    // never let a best-effort reapply mask the real commit/rollback outcome.
                }
            }
            return result;
        };
        return (Connection) Proxy.newProxyInstance(
                Connection.class.getClassLoader(),
                new Class<?>[]{Connection.class},
                handler
        );
    }
}
