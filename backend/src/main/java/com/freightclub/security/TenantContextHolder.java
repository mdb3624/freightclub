package com.freightclub.security;

/**
 * Thread-safe holder for the current tenant context.
 * Uses ThreadLocal to ensure each request thread has its own isolated tenant_id.
 * AC-1: TenantContextHolder Thread-Safety - ThreadLocal provides inherent isolation.
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
    }
}
