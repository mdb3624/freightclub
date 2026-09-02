package com.freightclub.service;

import com.freightclub.domain.PasswordResetToken;
import com.freightclub.domain.User;
import com.freightclub.domain.UserRole;
import com.freightclub.exception.InvalidPasswordResetTokenException;
import com.freightclub.exception.PasswordBreachedException;
import com.freightclub.repository.PasswordResetTokenRepository;
import com.freightclub.repository.UserRepository;
import com.freightclub.security.BreachCheckResult;
import com.freightclub.security.LoginLookupCredentials;
import com.freightclub.security.LoginLookupRepository;
import com.freightclub.security.PasswordBreachChecker;
import com.freightclub.security.RefreshTokenService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

    @Mock private PasswordResetTokenRepository passwordResetTokenRepository;
    @Mock private LoginLookupRepository loginLookupRepository;
    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private PasswordBreachChecker passwordBreachChecker;
    @Mock private RefreshTokenService refreshTokenService;

    private PasswordResetService newService() {
        return new PasswordResetService(passwordResetTokenRepository, loginLookupRepository,
                userRepository, passwordEncoder, passwordBreachChecker, refreshTokenService);
    }

    @AfterEach
    void clearTenantContext() {
        com.freightclub.security.TenantContextHolder.clear();
    }

    private PasswordResetToken validToken() {
        PasswordResetToken token = new PasswordResetToken();
        token.setUserId("user-1");
        token.setTokenHash("anyhash");
        token.setExpiresAt(LocalDateTime.now().plusHours(1));
        return token;
    }

    @Test
    void redeem_rejectsUnknownToken() {
        when(passwordResetTokenRepository.findByTokenHashForUpdate(anyString())).thenReturn(Optional.empty());
        PasswordResetService service = newService();

        assertThatThrownBy(() -> service.redeem("raw-token", "NewPassword123!"))
                .isInstanceOf(InvalidPasswordResetTokenException.class);
    }

    @Test
    void redeem_rejectsExpiredToken() {
        PasswordResetToken token = validToken();
        token.setExpiresAt(LocalDateTime.now().minusMinutes(1));
        when(passwordResetTokenRepository.findByTokenHashForUpdate(anyString())).thenReturn(Optional.of(token));
        PasswordResetService service = newService();

        assertThatThrownBy(() -> service.redeem("raw-token", "NewPassword123!"))
                .isInstanceOf(InvalidPasswordResetTokenException.class);
    }

    @Test
    void redeem_rejectsAlreadyUsedToken() {
        PasswordResetToken token = validToken();
        token.setUsedAt(LocalDateTime.now().minusMinutes(1));
        when(passwordResetTokenRepository.findByTokenHashForUpdate(anyString())).thenReturn(Optional.of(token));
        PasswordResetService service = newService();

        assertThatThrownBy(() -> service.redeem("raw-token", "NewPassword123!"))
                .isInstanceOf(InvalidPasswordResetTokenException.class);
    }

    @Test
    void redeem_rejectsBreachedPassword() {
        when(passwordResetTokenRepository.findByTokenHashForUpdate(anyString())).thenReturn(Optional.of(validToken()));
        when(passwordBreachChecker.isBreached("password")).thenReturn(BreachCheckResult.BREACHED);
        PasswordResetService service = newService();

        assertThatThrownBy(() -> service.redeem("raw-token", "password"))
                .isInstanceOf(PasswordBreachedException.class);
        verifyNoInteractions(loginLookupRepository, userRepository, refreshTokenService);
    }

    @Test
    void redeem_setsNewPasswordMarksTokenUsedAndRevokesSessions() {
        when(passwordResetTokenRepository.findByTokenHashForUpdate(anyString())).thenReturn(Optional.of(validToken()));
        when(passwordBreachChecker.isBreached(anyString())).thenReturn(BreachCheckResult.CLEAN);
        when(loginLookupRepository.findUserById("user-1"))
                .thenReturn(Optional.of(new LoginLookupCredentials("user-1", "tenant-1", "u@x.com", "oldhash", UserRole.SHIPPER)));
        User user = new User("user-1");
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$newhash");

        PasswordResetService service = newService();
        service.redeem("raw-token", "NewPassword123!");

        verify(userRepository).save(argThat(u -> "$2a$newhash".equals(u.getPasswordHash())));
        verify(passwordResetTokenRepository).save(argThat(t -> t.getUsedAt() != null));
        verify(refreshTokenService).revokeAllForUser("user-1");
    }
}
