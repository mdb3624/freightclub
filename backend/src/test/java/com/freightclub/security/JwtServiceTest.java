package com.freightclub.security;

import com.freightclub.domain.User;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;

import static org.assertj.core.api.Assertions.assertThat;

// US-874: JWT must carry is_tenant_admin as an independent claim from role/tenantId.
class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        JwtProperties props = new JwtProperties();
        props.setSecret("test-secret-key-at-least-256-bits-long-for-hs256-signing");
        props.setIssuer("freightclub-test");
        props.setAudience("freightclub-test-aud");
        props.setAccessTokenExpiryMs(900_000L);
        jwtService = new JwtService(props);
    }

    private User makeUser(boolean isTenantAdmin) {
        User user = new User();
        setField(user, "id", "user-1");
        user.setTenantId("tenant-1");
        user.setEmail("shipper@example.com");
        user.setRole(com.freightclub.domain.UserRole.SHIPPER);
        user.setTenantAdmin(isTenantAdmin);
        return user;
    }

    private static void setField(Object target, String name, Object value) {
        try {
            Field f = target.getClass().getDeclaredField(name);
            f.setAccessible(true);
            f.set(target, value);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    void includesIsTenantAdminClaim_whenTrue() {
        String token = jwtService.generateAccessToken(makeUser(true));

        Claims claims = jwtService.validateAndGetClaims(token);

        assertThat(claims.get("isTenantAdmin", Boolean.class)).isTrue();
        // Independent of role/tenantId — both still present and unaffected.
        assertThat(claims.get("role", String.class)).isEqualTo("SHIPPER");
        assertThat(claims.get("tenantId", String.class)).isEqualTo("tenant-1");
    }

    @Test
    void includesIsTenantAdminClaim_whenFalse() {
        String token = jwtService.generateAccessToken(makeUser(false));

        Claims claims = jwtService.validateAndGetClaims(token);

        assertThat(claims.get("isTenantAdmin", Boolean.class)).isFalse();
    }
}
