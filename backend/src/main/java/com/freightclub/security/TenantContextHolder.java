package com.freightclub.security;

/**
 * Thread-safe holder for the current tenant context.
 * Uses ThreadLocal to ensure each request thread has its own isolated tenant_id.
 * AC-1: TenantContextHolder Thread-Safety - ThreadLocal provides inherent isolation.
 */
public final class TenantContextHolder {

    private static final ThreadLocal<String> TENANT_ID = new ThreadLocal<>();

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
     * Clears the tenant context for the current thread.
     * MANDATORY: Must be called in a finally block to prevent ThreadLocal memory leaks.
     * Failure to clear will cause subsequent requests on the same thread to inherit stale context,
     * violating AC-3 (Context Cleanup) and potentially exposing data across tenants.
     */
    public static void clear() {
        TENANT_ID.remove();
    }
}
