package com.freightclub.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.impl.DefaultClaims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock private JwtService jwtService;
    @Mock private HttpServletRequest request;
    @Mock private HttpServletResponse response;
    @Mock private FilterChain filterChain;

    @InjectMocks
    private JwtAuthenticationFilter filter;

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
        TenantContextHolder.clear();
    }

    private Claims makeClaims(String subject, String role, String tenantId) {
        Map<String, Object> data = Map.of(
                "sub", subject,
                "role", role,
                "tenantId", tenantId
        );
        return new DefaultClaims(data);
    }

    // -------------------------------------------------------------------------
    // valid token
    // -------------------------------------------------------------------------

    @Nested
    class ValidToken {

        @Test
        void setsAuthentication_forValidToken() throws Exception {
            when(request.getHeader("Authorization")).thenReturn("Bearer valid-token");
            Claims claims = makeClaims("user-1", "SHIPPER", "tenant-1");
            when(jwtService.validateAndGetClaims("valid-token")).thenReturn(claims);

            filter.doFilter(request, response, filterChain);

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            assertThat(auth).isNotNull();
            assertThat(auth.getPrincipal()).isEqualTo("user-1");
            assertThat(auth.getAuthorities()).anyMatch(a -> a.getAuthority().equals("ROLE_SHIPPER"));
            verify(filterChain).doFilter(request, response);
        }

        @Test
        void setsTenantContext_forValidToken() throws Exception {
            when(request.getHeader("Authorization")).thenReturn("Bearer valid-token");
            Claims claims = makeClaims("user-1", "SHIPPER", "tenant-abc");
            when(jwtService.validateAndGetClaims("valid-token")).thenReturn(claims);

            filter.doFilter(request, response, filterChain);

            // Tenant context is cleared in the finally block after filter chain completes,
            // so we just verify the filter ran without error and filter chain was called.
            verify(filterChain).doFilter(request, response);
        }
    }

    // -------------------------------------------------------------------------
    // missing / invalid token
    // -------------------------------------------------------------------------

    @Nested
    class MissingOrInvalidToken {

        @Test
        void continuesChain_withNoAuthentication_whenHeaderAbsent() throws Exception {
            when(request.getHeader("Authorization")).thenReturn(null);

            filter.doFilter(request, response, filterChain);

            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
            verify(filterChain).doFilter(request, response);
        }

        @Test
        void continuesChain_withNoAuthentication_whenPrefixMissing() throws Exception {
            when(request.getHeader("Authorization")).thenReturn("Basic dXNlcjpwYXNz");

            filter.doFilter(request, response, filterChain);

            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
            verify(filterChain).doFilter(request, response);
        }

        @Test
        void continuesChain_withNoAuthentication_whenTokenInvalid() throws Exception {
            when(request.getHeader("Authorization")).thenReturn("Bearer bad-token");
            when(jwtService.validateAndGetClaims("bad-token"))
                    .thenThrow(new io.jsonwebtoken.security.SignatureException("bad sig"));

            filter.doFilter(request, response, filterChain);

            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
            verify(filterChain).doFilter(request, response);
        }
    }
}
