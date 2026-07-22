package com.freightclub.security;

import com.freightclub.domain.UserRole;

/**
 * Result of the pre-authentication email lookup on {@code users}, fetched via
 * {@link LoginLookupRepository} (freightclub_login_lookup role — no tenant context exists yet).
 * Carries only what's needed to verify a password and mint a JWT; the full profile is fetched
 * separately once tenant context is bound (see AuthService#login).
 */
public record LoginLookupCredentials(
        String userId,
        String tenantId,
        String email,
        String passwordHash,
        UserRole role
) {
}
