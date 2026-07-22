package com.freightclub.service;

import com.freightclub.domain.Tenant;
import com.freightclub.domain.User;
import com.freightclub.domain.UserRole;
import com.freightclub.dto.LoginRequest;
import com.freightclub.dto.RegisterRequest;
import com.freightclub.exception.EmailAlreadyExistsException;
import com.freightclub.exception.InvalidJoinCodeException;
import com.freightclub.repository.TenantRepository;
import com.freightclub.repository.UserRepository;
import com.freightclub.security.AuthenticatedUserPrincipal;
import com.freightclub.security.JwtService;
import com.freightclub.security.LoginLookupCredentials;
import com.freightclub.security.LoginLookupRepository;
import com.freightclub.security.RefreshTokenService;
import com.freightclub.security.TenantContextHolder;
import com.freightclub.security.TenantLookupResult;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private TenantRepository tenantRepository;
    @Mock private LoginLookupRepository loginLookupRepository;
    @Mock private JwtService jwtService;
    @Mock private RefreshTokenService refreshTokenService;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    @AfterEach
    void clearTenantContext() {
        // AuthService binds/clears TenantContextHolder itself, but a thrown exception mid-test
        // (e.g. the bad-credentials case) can still leave state if a future refactor removes
        // the finally block — belt and suspenders against leaking into the next test.
        TenantContextHolder.clear();
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private RegisterRequest shipperRegisterRequest() {
        return new RegisterRequest(
                "shipper@example.com", "password123",
                "Alice", "Smith",
                UserRole.SHIPPER,
                "Acme Freight", null,
                null, null, null
        );
    }

    private RegisterRequest truckerRegisterRequest() {
        return new RegisterRequest(
                "trucker@example.com", "password123",
                "Bob", "Jones",
                UserRole.TRUCKER,
                "Bob's Trucking", null,
                "MC-123456", "DOT-789", null
        );
    }

    private User makeUser(String id, String email, UserRole role) {
        User user = new User();
        setField(user, "id", id);
        user.setEmail(email);
        user.setFirstName("Test");
        user.setLastName("User");
        user.setRole(role);
        user.setTenantId("tenant-1");
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

    private AuthenticatedUserPrincipal makePrincipal(String userId, String tenantId, String email, UserRole role) {
        return new AuthenticatedUserPrincipal(
                userId, tenantId, email, "hashed-password",
                List.of(new SimpleGrantedAuthority("ROLE_" + role.name()))
        );
    }

    // -------------------------------------------------------------------------
    // register
    // -------------------------------------------------------------------------

    @Nested
    class Register {

        @Test
        void createsNewTenant_whenCompanyNameProvided() {
            when(loginLookupRepository.existsByEmail(anyString())).thenReturn(false);
            when(tenantRepository.save(any())).thenAnswer(inv -> {
                Tenant t = inv.getArgument(0);
                setField(t, "id", "tenant-new");
                return t;
            });
            when(userRepository.save(any())).thenAnswer(inv -> {
                User u = inv.getArgument(0);
                setField(u, "id", "user-new");
                return u;
            });
            when(jwtService.generateAccessToken(any())).thenReturn("access-token");
            when(refreshTokenService.createRefreshToken("user-new")).thenReturn("refresh-token");

            AuthService.AuthResult result = authService.register(shipperRegisterRequest());

            assertThat(result.accessToken()).isEqualTo("access-token");
            assertThat(result.rawRefreshToken()).isEqualTo("refresh-token");
            assertThat(result.user().getEmail()).isEqualTo("shipper@example.com");
            assertThat(result.user().getRole()).isEqualTo(UserRole.SHIPPER);
            assertThat(result.user().getTenantId()).isEqualTo("tenant-new");
            verify(tenantRepository).save(any());
            verify(userRepository).save(any());
            verify(loginLookupRepository, never()).findTenantByJoinCode(anyString());
        }

        @Test
        void joinsExistingTenant_viaLoginLookupRepository_whenJoinCodeProvided() {
            RegisterRequest joinRequest = new RegisterRequest(
                    "new@example.com", "password123",
                    "Charlie", "Brown",
                    UserRole.SHIPPER,
                    null, "ABCD1234",
                    null, null, null
            );

            when(loginLookupRepository.existsByEmail(anyString())).thenReturn(false);
            when(loginLookupRepository.findTenantByJoinCode("ABCD1234"))
                    .thenReturn(Optional.of(new TenantLookupResult("tenant-existing", "ABCD1234", "Existing Corp", "FREE")));
            when(userRepository.save(any())).thenAnswer(inv -> {
                User u = inv.getArgument(0);
                setField(u, "id", "user-joined");
                return u;
            });
            when(jwtService.generateAccessToken(any())).thenReturn("access-token");
            when(refreshTokenService.createRefreshToken("user-joined")).thenReturn("refresh-token");

            AuthService.AuthResult result = authService.register(joinRequest);

            assertThat(result.user().getTenantId()).isEqualTo("tenant-existing");
            verify(tenantRepository, never()).save(any());
            // Registration's tenant lookup by join code must go through the pre-auth path,
            // not the JPA repository (which has no tenant context to satisfy RLS with here).
            verify(tenantRepository, never()).findByJoinCode(anyString());
        }

        @Test
        void bindsAndClearsTenantContext_aroundUserSave() {
            when(loginLookupRepository.existsByEmail(anyString())).thenReturn(false);
            when(tenantRepository.save(any())).thenAnswer(inv -> {
                Tenant t = inv.getArgument(0);
                setField(t, "id", "tenant-ctx-check");
                return t;
            });
            when(userRepository.save(any())).thenAnswer(inv -> {
                // The whole point of AC-1's fix: this save must succeed under
                // users_tenant_isolation's WITH CHECK, which requires tenant context to be
                // bound at the moment of the write.
                assertThat(TenantContextHolder.getTenantId()).isEqualTo("tenant-ctx-check");
                User u = inv.getArgument(0);
                setField(u, "id", "user-ctx-check");
                return u;
            });
            when(jwtService.generateAccessToken(any())).thenReturn("token");
            when(refreshTokenService.createRefreshToken("user-ctx-check")).thenReturn("refresh");

            authService.register(shipperRegisterRequest());

            assertThatThrownBy(TenantContextHolder::getTenantId)
                    .as("context must be cleared after register() returns")
                    .isInstanceOf(IllegalStateException.class);
        }

        @Test
        void setsMcAndDotNumber_forTrucker() {
            when(loginLookupRepository.existsByEmail(anyString())).thenReturn(false);
            when(tenantRepository.save(any())).thenAnswer(inv -> {
                Tenant t = inv.getArgument(0);
                setField(t, "id", "tenant-new");
                return t;
            });
            when(userRepository.save(any())).thenAnswer(inv -> {
                User u = inv.getArgument(0);
                setField(u, "id", "user-trucker");
                return u;
            });
            when(jwtService.generateAccessToken(any())).thenReturn("token");
            when(refreshTokenService.createRefreshToken("user-trucker")).thenReturn("refresh");

            AuthService.AuthResult result = authService.register(truckerRegisterRequest());

            assertThat(result.user().getMcNumber()).isEqualTo("MC-123456");
            assertThat(result.user().getDotNumber()).isEqualTo("DOT-789");
        }

        @Test
        void throws_whenEmailAlreadyExists() {
            when(loginLookupRepository.existsByEmail("shipper@example.com")).thenReturn(true);

            assertThatThrownBy(() -> authService.register(shipperRegisterRequest()))
                    .isInstanceOf(EmailAlreadyExistsException.class);
        }

        @Test
        void throws_whenJoinCodeIsInvalid() {
            RegisterRequest joinRequest = new RegisterRequest(
                    "new@example.com", "password123",
                    "Dave", "Evans",
                    UserRole.SHIPPER,
                    null, "BADCODE",
                    null, null, null
            );

            when(loginLookupRepository.existsByEmail(anyString())).thenReturn(false);
            when(loginLookupRepository.findTenantByJoinCode("BADCODE")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.register(joinRequest))
                    .isInstanceOf(InvalidJoinCodeException.class);
        }

        @Test
        void throws_whenNeitherCompanyNameNorJoinCode() {
            RegisterRequest invalid = new RegisterRequest(
                    "new@example.com", "password123",
                    "Eve", "Fox",
                    UserRole.SHIPPER,
                    null, null,
                    null, null, null
            );

            when(loginLookupRepository.existsByEmail(anyString())).thenReturn(false);

            assertThatThrownBy(() -> authService.register(invalid))
                    .isInstanceOf(IllegalArgumentException.class);
        }
    }

    // -------------------------------------------------------------------------
    // login
    // -------------------------------------------------------------------------

    @Nested
    class Login {

        @Test
        void returnsTokens_onValidCredentials() {
            User user = makeUser("user-1", "shipper@example.com", UserRole.SHIPPER);
            LoginRequest request = new LoginRequest("shipper@example.com", "password123");
            AuthenticatedUserPrincipal principal = makePrincipal("user-1", "tenant-1", "shipper@example.com", UserRole.SHIPPER);

            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                    .thenReturn(new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities()));
            when(userRepository.findByEmailAndDeletedAtIsNull("shipper@example.com"))
                    .thenReturn(Optional.of(user));
            when(jwtService.generateAccessToken(user)).thenReturn("access-token");
            when(refreshTokenService.createRefreshToken("user-1")).thenReturn("refresh-token");

            AuthService.AuthResult result = authService.login(request);

            assertThat(result.accessToken()).isEqualTo("access-token");
            assertThat(result.rawRefreshToken()).isEqualTo("refresh-token");
            verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        }

        @Test
        void bindsTenantContext_fromAuthenticatedPrincipal_beforeProfileLookup() {
            User user = makeUser("user-1", "shipper@example.com", UserRole.SHIPPER);
            LoginRequest request = new LoginRequest("shipper@example.com", "password123");
            AuthenticatedUserPrincipal principal = makePrincipal("user-1", "tenant-from-login", "shipper@example.com", UserRole.SHIPPER);

            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                    .thenReturn(new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities()));
            when(userRepository.findByEmailAndDeletedAtIsNull("shipper@example.com")).thenAnswer(inv -> {
                assertThat(TenantContextHolder.getTenantId()).isEqualTo("tenant-from-login");
                return Optional.of(user);
            });
            when(jwtService.generateAccessToken(user)).thenReturn("token");
            when(refreshTokenService.createRefreshToken("user-1")).thenReturn("refresh");

            authService.login(request);

            assertThatThrownBy(TenantContextHolder::getTenantId)
                    .as("context must be cleared after login() returns")
                    .isInstanceOf(IllegalStateException.class);
        }

        @Test
        void throws_onBadCredentials() {
            LoginRequest request = new LoginRequest("bad@example.com", "wrongpass");

            doThrow(new BadCredentialsException("Bad credentials"))
                    .when(authenticationManager).authenticate(any());

            assertThatThrownBy(() -> authService.login(request))
                    .isInstanceOf(BadCredentialsException.class);
        }
    }

    // -------------------------------------------------------------------------
    // refresh
    // -------------------------------------------------------------------------

    @Nested
    class Refresh {

        @Test
        void returnsNewTokens_onValidRefreshToken() {
            User user = makeUser("user-1", "shipper@example.com", UserRole.SHIPPER);
            RefreshTokenService.RotationResult rotation =
                    new RefreshTokenService.RotationResult("new-refresh-token", "user-1");

            when(refreshTokenService.rotateRefreshToken("old-refresh")).thenReturn(rotation);
            when(loginLookupRepository.findUserById("user-1"))
                    .thenReturn(Optional.of(new LoginLookupCredentials("user-1", "tenant-1", "shipper@example.com", "hash", UserRole.SHIPPER)));
            when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
            when(jwtService.generateAccessToken(user)).thenReturn("new-access-token");

            AuthService.RefreshResult result = authService.refresh("old-refresh");

            assertThat(result.accessToken()).isEqualTo("new-access-token");
            assertThat(result.rawRefreshToken()).isEqualTo("new-refresh-token");
        }

        @Test
        void resolvesTenantViaLoginLookup_beforeProfileLookup() {
            User user = makeUser("user-1", "shipper@example.com", UserRole.SHIPPER);
            RefreshTokenService.RotationResult rotation =
                    new RefreshTokenService.RotationResult("new-refresh-token", "user-1");

            when(refreshTokenService.rotateRefreshToken("old-refresh")).thenReturn(rotation);
            when(loginLookupRepository.findUserById("user-1"))
                    .thenReturn(Optional.of(new LoginLookupCredentials("user-1", "tenant-refresh", "shipper@example.com", "hash", UserRole.SHIPPER)));
            when(userRepository.findById("user-1")).thenAnswer(inv -> {
                assertThat(TenantContextHolder.getTenantId()).isEqualTo("tenant-refresh");
                return Optional.of(user);
            });
            when(jwtService.generateAccessToken(user)).thenReturn("token");

            authService.refresh("old-refresh");

            assertThatThrownBy(TenantContextHolder::getTenantId)
                    .as("context must be cleared after refresh() returns")
                    .isInstanceOf(IllegalStateException.class);
        }

        @Test
        void throws_whenUserNotFoundViaLoginLookup() {
            RefreshTokenService.RotationResult rotation =
                    new RefreshTokenService.RotationResult("new-refresh-token", "user-gone");

            when(refreshTokenService.rotateRefreshToken("old-refresh")).thenReturn(rotation);
            when(loginLookupRepository.findUserById("user-gone")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.refresh("old-refresh"))
                    .isInstanceOf(IllegalStateException.class);
        }
    }

    // -------------------------------------------------------------------------
    // logout
    // -------------------------------------------------------------------------

    @Nested
    class Logout {

        @Test
        void revokesAllTokensForUser() {
            authService.logout("user-1");
            verify(refreshTokenService).revokeAllForUser("user-1");
        }
    }
}
