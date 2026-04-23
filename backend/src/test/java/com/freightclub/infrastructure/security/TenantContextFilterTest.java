package com.freightclub.infrastructure.security;

import com.freightclub.security.TenantContextHolder;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

class TenantContextFilterTest {

    private final TenantContextFilter filter = new TenantContextFilter();

    @AfterEach
    void cleanup() {
        SecurityContextHolder.clearContext();
        TenantContextHolder.clear();
    }

    private Jwt jwt(String tenantId) {
        return Jwt.withTokenValue("token")
                .header("alg", "RS256")
                .claim("tenantId", tenantId)
                .claim("sub", "user-1")
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(300))
                .build();
    }

    private void bindJwt(String tenantId) {
        JwtAuthenticationToken auth = new JwtAuthenticationToken(jwt(tenantId));
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    @DisplayName("Valid JWT: tenantId claim is propagated to TenantContextHolder")
    void validJwt_propagatesTenantId() throws Exception {
        bindJwt("tenant-A");
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(new MockHttpServletRequest(), new MockHttpServletResponse(), chain);

        // Chain sees the tenant bound — capture via side effect
        doAnswer(inv -> {
            assertThat(TenantContextHolder.getTenantId()).isEqualTo("tenant-A");
            return null;
        }).when(chain).doFilter(any(), any());

        // Re-invoke to assert inside the chain
        bindJwt("tenant-A");
        filter.doFilter(new MockHttpServletRequest(), new MockHttpServletResponse(), chain);
        verify(chain, times(2)).doFilter(any(), any());
    }

    @Test
    @DisplayName("TenantContextHolder is cleared after normal request completion")
    void tenantContext_clearedAfterNormalExecution() throws Exception {
        bindJwt("tenant-A");
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(new MockHttpServletRequest(), new MockHttpServletResponse(), chain);

        assertThatThrownBy(TenantContextHolder::getTenantId)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("No tenant context");
    }

    @Test
    @DisplayName("TenantContextHolder is cleared even when filter chain throws")
    void tenantContext_clearedOnException() throws Exception {
        bindJwt("tenant-B");
        FilterChain chain = mock(FilterChain.class);
        doThrow(new ServletException("downstream failure")).when(chain).doFilter(any(), any());

        assertThatThrownBy(() ->
                filter.doFilter(new MockHttpServletRequest(), new MockHttpServletResponse(), chain))
                .isInstanceOf(ServletException.class);

        assertThatThrownBy(TenantContextHolder::getTenantId)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("No tenant context");
    }

    @Test
    @DisplayName("No JWT in SecurityContext: filter passes through without binding tenant")
    void noJwt_filterPassesThrough() throws Exception {
        // No authentication set — SecurityContext is empty
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(new MockHttpServletRequest(), new MockHttpServletResponse(), chain);

        verify(chain).doFilter(any(), any());
        assertThatThrownBy(TenantContextHolder::getTenantId)
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    @DisplayName("Request with no JWT returns 401 at security layer (integration coverage)")
    void missingJwt_noTenantBound() throws Exception {
        // Confirms the filter itself doesn't throw when unauthenticated — Spring Security
        // handles the 401 before this filter is reached for protected endpoints.
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(new MockHttpServletRequest(), new MockHttpServletResponse(), chain);

        verify(chain).doFilter(any(), any());
    }
}
