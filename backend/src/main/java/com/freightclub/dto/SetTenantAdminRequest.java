package com.freightclub.dto;

// US-875/877 BR-5: grant/revoke is_tenant_admin — never changes the target's persona role.
public record SetTenantAdminRequest(boolean isTenantAdmin) {}
