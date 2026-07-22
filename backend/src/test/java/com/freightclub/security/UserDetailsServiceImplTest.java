package com.freightclub.security;

import com.freightclub.domain.UserRole;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

/**
 * Traceability: US-857 AC-2/AC-3 — the only cross-tenant read in the login path goes
 * through LoginLookupRepository (freightclub_login_lookup), not UserRepository/JPA.
 */
@ExtendWith(MockitoExtension.class)
class UserDetailsServiceImplTest {

    @Mock private LoginLookupRepository loginLookupRepository;

    @InjectMocks
    private UserDetailsServiceImpl userDetailsService;

    @Test
    void loadUserByUsername_returnsPrincipalCarryingTenantId_whenFound() {
        when(loginLookupRepository.findUserByEmail("shipper@example.com"))
                .thenReturn(Optional.of(new LoginLookupCredentials(
                        "user-1", "tenant-1", "shipper@example.com", "hashed-password", UserRole.SHIPPER)));

        UserDetails result = userDetailsService.loadUserByUsername("shipper@example.com");

        assertThat(result).isInstanceOf(AuthenticatedUserPrincipal.class);
        AuthenticatedUserPrincipal principal = (AuthenticatedUserPrincipal) result;
        assertThat(principal.getUserId()).isEqualTo("user-1");
        assertThat(principal.getTenantId()).isEqualTo("tenant-1");
        assertThat(principal.getUsername()).isEqualTo("shipper@example.com");
        assertThat(principal.getPassword()).isEqualTo("hashed-password");
        assertThat(principal.getAuthorities())
                .extracting(Object::toString)
                .containsExactly("ROLE_SHIPPER");
    }

    @Test
    void loadUserByUsername_throws_whenNotFound() {
        when(loginLookupRepository.findUserByEmail("nobody@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userDetailsService.loadUserByUsername("nobody@example.com"))
                .isInstanceOf(UsernameNotFoundException.class);
    }
}
