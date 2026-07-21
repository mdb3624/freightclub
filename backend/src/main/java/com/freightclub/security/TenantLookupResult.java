package com.freightclub.security;

/**
 * Result of a pre-authentication tenant lookup by join code, fetched via
 * {@link LoginLookupRepository} (freightclub_login_lookup role). Used by registration,
 * which needs to resolve an existing tenant before any tenant context can be bound.
 */
public record TenantLookupResult(
        String tenantId,
        String joinCode,
        String name,
        String plan
) {
}
