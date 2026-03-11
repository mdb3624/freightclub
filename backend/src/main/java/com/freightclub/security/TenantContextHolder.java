package com.freightclub.security;

public final class TenantContextHolder {

    private static final ThreadLocal<String> TENANT_ID = new ThreadLocal<>();

    private TenantContextHolder() {}

    public static void setTenantId(String tenantId) {
        TENANT_ID.set(tenantId);
    }

    public static String getTenantId() {
        return TENANT_ID.get();
    }

    public static void clear() {
        TENANT_ID.remove();
    }
}
