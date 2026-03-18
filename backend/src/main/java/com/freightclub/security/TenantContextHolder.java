package com.freightclub.security;

public final class TenantContextHolder {

    private static final ThreadLocal<String> TENANT_ID = new ThreadLocal<>();

    private TenantContextHolder() {}

    public static void setTenantId(String tenantId) {
        TENANT_ID.set(tenantId);
    }

    public static String getTenantId() {
        String tenantId = TENANT_ID.get();
        if (tenantId == null) {
            throw new IllegalStateException("No tenant context bound to this request");
        }
        return tenantId;
    }

    public static void clear() {
        TENANT_ID.remove();
    }
}
