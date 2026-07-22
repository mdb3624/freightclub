package com.freightclub.security;

import org.hibernate.Session;
import org.springframework.orm.jpa.EntityManagerHolder;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.sql.SQLException;
import java.sql.Statement;

/**
 * Thread-safe holder for the current tenant context.
 * Uses ThreadLocal to ensure each request thread has its own isolated tenant_id.
 * AC-1: TenantContextHolder Thread-Safety - ThreadLocal provides inherent isolation.
 *
 * US-858: TenantAwareDataSource applies SET LOCAL app.current_tenant only at connection
 * acquisition (transaction start), which reads whatever tenant is bound at that moment. That's
 * correct for the common case (JwtAuthenticationFilter binds tenant before any @Transactional
 * method runs), but wrong whenever setTenantId is called AFTER a transaction's connection is
 * already open — AuthService's register/login/refresh (tenant only known mid-transaction) and
 * every @Transactional test class that binds tenant in @BeforeEach (which runs inside the
 * transaction Spring opens for the test). Rather than requiring every such call site to
 * remember a separate "re-apply to the current connection" step, setTenantId does it itself:
 * if a Spring-managed transaction is already active, it re-issues SET LOCAL immediately on
 * whatever connection is already bound to it.
 *
 * Deliberately does NOT hold a static DataSource reference (an earlier version did, wired
 * once via a startup @Component) — Spring's test suite caches multiple distinct
 * ApplicationContexts across test classes, each with its own DataSource bean instance, and a
 * single static field goes stale whenever Spring switches back to a differently-configured
 * cached context. Reading TransactionSynchronizationManager's bound resources directly finds
 * whatever connection the CURRENT transaction is actually using, regardless of which
 * DataSource bean/context created it.
 *
 * Targets the EntityManagerHolder specifically, not "any bound ConnectionHolder" — an earlier
 * version searched for any ConnectionHolder in the resource map and used whichever it found
 * first, but Hibernate/HikariCP bind TWO distinct ConnectionHolders per transaction (one keyed
 * by the TenantAwareDataSource bean, one keyed by the raw unwrapped HikariDataSource) — which
 * one a HashMap's iteration order surfaces first is not stable across JVM runs, so that
 * approach intermittently applied SET LOCAL to a connection Hibernate wasn't actually using.
 * There's exactly one EntityManagerHolder per transaction, so keying off that instead is
 * unambiguous.
 */
public final class TenantContextHolder {

    private static final ThreadLocal<String> TENANT_ID = new ThreadLocal<>();
    private static final ThreadLocal<String> USER_ID = new ThreadLocal<>();

    private TenantContextHolder() {}

    /**
     * Sets the tenant_id for the current request thread.
     * ThreadLocal ensures isolation across concurrent requests from different tenants.
     *
     * @param tenantId the tenant identifier (non-null, non-blank)
     * @throws IllegalArgumentException if tenantId is null or blank
     */
    public static void setTenantId(String tenantId) {
        if (tenantId == null || tenantId.isBlank()) {
            throw new IllegalArgumentException("tenant_id cannot be null or blank");
        }
        TENANT_ID.set(tenantId);
        runOnActiveTransactionConnection(
                "SET LOCAL app.current_tenant = '" + tenantId.replace("'", "''") + "'");
    }

    /**
     * SET LOCAL is transaction-scoped, not thread-scoped — clearing the ThreadLocal alone
     * leaves a previously-applied app.current_tenant in effect on an already-open transaction's
     * connection until COMMIT/ROLLBACK. RESET puts it back to unset so
     * current_setting(..., true) correctly returns NULL again (fail-closed AC-4).
     *
     * Flushes the Hibernate session FIRST, before changing app.current_tenant — Hibernate's
     * write-behind queues repository.save() until the next flush point rather than executing it
     * immediately. Without this, any pending INSERT/UPDATE made under the tenant that's about to
     * be switched away from (including a plain setTenantId(A); save(...); finally { clear(); }
     * sequence, which is a common pattern in AuthService and elsewhere) would flush LATER under
     * the new/cleared context and get rejected by RLS's WITH CHECK (US-858).
     */
    private static void runOnActiveTransactionConnection(String sql) {
        if (!TransactionSynchronizationManager.isActualTransactionActive()) {
            // No transaction open yet — TenantAwareDataSource's connection-acquisition-time
            // SET LOCAL will correctly pick this value up when one starts.
            return;
        }
        for (Object resource : TransactionSynchronizationManager.getResourceMap().values()) {
            if (resource instanceof EntityManagerHolder holder) {
                Session session = holder.getEntityManager().unwrap(Session.class);
                if (session.isOpen()) {
                    session.flush();
                }
                session.doWork(connection -> {
                    try (Statement statement = connection.createStatement()) {
                        statement.execute(sql);
                    } catch (SQLException e) {
                        throw new IllegalStateException("Failed to apply tenant context to the active transaction", e);
                    }
                });
                return;
            }
        }
    }

    /**
     * Gets the tenant_id for the current request thread.
     *
     * @return the tenant_id bound to this thread
     * @throws IllegalStateException if no tenant context is bound (request was not authenticated)
     */
    public static String getTenantId() {
        String tenantId = TENANT_ID.get();
        if (tenantId == null) {
            throw new IllegalStateException("No tenant context bound to this request");
        }
        return tenantId;
    }

    /**
     * Sets the user_id (subject from JWT) for the current request thread.
     *
     * @param userId the user identifier (non-null, non-blank)
     * @throws IllegalArgumentException if userId is null or blank
     */
    public static void setUserId(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("user_id cannot be null or blank");
        }
        USER_ID.set(userId);
    }

    /**
     * Gets the user_id (subject from JWT) for the current request thread.
     *
     * @return the user_id bound to this thread
     * @throws IllegalStateException if no user context is bound (request was not authenticated)
     */
    public static String getCurrentUserId() {
        String userId = USER_ID.get();
        if (userId == null) {
            throw new IllegalStateException("No user context bound to this request");
        }
        return userId;
    }

    /**
     * Clears the tenant and user context for the current thread.
     * MANDATORY: Must be called in a finally block to prevent ThreadLocal memory leaks.
     * Failure to clear will cause subsequent requests on the same thread to inherit stale context,
     * violating AC-3 (Context Cleanup) and potentially exposing data across tenants.
     */
    public static void clear() {
        TENANT_ID.remove();
        USER_ID.remove();
        try {
            runOnActiveTransactionConnection("RESET app.current_tenant");
        } catch (RuntimeException e) {
            // clear() is documented as safe to call unconditionally in a finally block — if the
            // transaction is already broken (e.g. a prior statement failed and Postgres put it
            // in an aborted state), there is nothing left to reset; swallow rather than mask
            // whatever real exception is already propagating.
        }
    }
}
