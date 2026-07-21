package com.freightclub.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;

/**
 * UserDetails carrying id + tenantId alongside the email/passwordHash Spring Security needs
 * for authentication. Lets AuthService bind TenantContextHolder from the already-authenticated
 * principal instead of re-querying the database a second time to find out which tenant the
 * user belongs to.
 */
public class AuthenticatedUserPrincipal extends User {

    private final String userId;
    private final String tenantId;

    public AuthenticatedUserPrincipal(String userId,
                                       String tenantId,
                                       String email,
                                       String passwordHash,
                                       Collection<? extends GrantedAuthority> authorities) {
        super(email, passwordHash, authorities);
        this.userId = userId;
        this.tenantId = tenantId;
    }

    public String getUserId() {
        return userId;
    }

    public String getTenantId() {
        return tenantId;
    }
}
