package com.freightclub.security;

import com.freightclub.domain.UserRole;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * The only two reads in the system that legitimately need to cross tenant boundaries before
 * a tenant is known: resolving login credentials by email, and resolving a tenant by join
 * code during registration. Both run through freightclub_login_lookup (SELECT-only, named
 * columns only, two tables only — see V20260721_1400) rather than the shared JPA
 * EntityManager, which runs as freightclub_runtime and no longer bypasses RLS.
 */
@Repository
public class LoginLookupRepository {

    private final JdbcTemplate loginLookupJdbcTemplate;

    public LoginLookupRepository(@Qualifier("loginLookupJdbcTemplate") JdbcTemplate loginLookupJdbcTemplate) {
        this.loginLookupJdbcTemplate = loginLookupJdbcTemplate;
    }

    public Optional<LoginLookupCredentials> findUserByEmail(String email) {
        List<LoginLookupCredentials> results = loginLookupJdbcTemplate.query(
                "SELECT id, tenant_id, email, password_hash, role FROM freightclub.users "
                        + "WHERE email = ? AND deleted_at IS NULL",
                (rs, rowNum) -> new LoginLookupCredentials(
                        rs.getString("id"),
                        rs.getString("tenant_id"),
                        rs.getString("email"),
                        rs.getString("password_hash"),
                        UserRole.valueOf(rs.getString("role"))
                ),
                email
        );
        return results.stream().findFirst();
    }

    /**
     * Used by AuthService#refresh: /api/v1/auth/refresh is also skipped by
     * JwtAuthenticationFilter, so the raw refresh token only carries a userId — the tenant
     * it belongs to is unknown until this resolves it, same problem as login by email.
     */
    public Optional<LoginLookupCredentials> findUserById(String userId) {
        List<LoginLookupCredentials> results = loginLookupJdbcTemplate.query(
                "SELECT id, tenant_id, email, password_hash, role FROM freightclub.users "
                        + "WHERE id = ? AND deleted_at IS NULL",
                (rs, rowNum) -> new LoginLookupCredentials(
                        rs.getString("id"),
                        rs.getString("tenant_id"),
                        rs.getString("email"),
                        rs.getString("password_hash"),
                        UserRole.valueOf(rs.getString("role"))
                ),
                userId
        );
        return results.stream().findFirst();
    }

    public Optional<TenantLookupResult> findTenantByJoinCode(String joinCode) {
        List<TenantLookupResult> results = loginLookupJdbcTemplate.query(
                "SELECT id, join_code, name, plan FROM freightclub.tenants "
                        + "WHERE join_code = ? AND deleted_at IS NULL",
                (rs, rowNum) -> new TenantLookupResult(
                        rs.getString("id"),
                        rs.getString("join_code"),
                        rs.getString("name"),
                        rs.getString("plan")
                ),
                joinCode
        );
        return results.stream().findFirst();
    }
}
