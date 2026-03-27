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
import com.freightclub.security.JwtService;
import com.freightclub.security.RefreshTokenService;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.lang.reflect.Field;
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
    @Mock private JwtService jwtService;
    @Mock private RefreshTokenService refreshTokenService;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

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

    private Tenant makeTenant(String id, String name) {
        Tenant tenant = new Tenant();
        setField(tenant, "id", id);
        tenant.setName(name);
        tenant.setJoinCode("ABCD1234");
        return tenant;
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

    // -------------------------------------------------------------------------
    // register
    // -------------------------------------------------------------------------

    @Nested
    class Register {

        @Test
        void createsNewTenant_whenCompanyNameProvided() {
            when(userRepository.existsByEmail(anyString())).thenReturn(false);
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
            verify(tenantRepository).save(any());
            verify(userRepository).save(any());
        }

        @Test
        void joinsExistingTenant_whenJoinCodeProvided() {
            Tenant existing = makeTenant("tenant-existing", "Existing Corp");
            RegisterRequest joinRequest = new RegisterRequest(
                    "new@example.com", "password123",
                    "Charlie", "Brown",
                    UserRole.SHIPPER,
                    null, "ABCD1234",
                    null, null, null
            );

            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(tenantRepository.findByJoinCode("ABCD1234")).thenReturn(Optional.of(existing));
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
        }

        @Test
        void setsMcAndDotNumber_forTrucker() {
            when(userRepository.existsByEmail(anyString())).thenReturn(false);
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
            when(userRepository.existsByEmail("shipper@example.com")).thenReturn(true);

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

            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(tenantRepository.findByJoinCode("BADCODE")).thenReturn(Optional.empty());

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

            when(userRepository.existsByEmail(anyString())).thenReturn(false);

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
            when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
            when(jwtService.generateAccessToken(user)).thenReturn("new-access-token");

            AuthService.RefreshResult result = authService.refresh("old-refresh");

            assertThat(result.accessToken()).isEqualTo("new-access-token");
            assertThat(result.rawRefreshToken()).isEqualTo("new-refresh-token");
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
