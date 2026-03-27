package com.freightclub.security;

import com.freightclub.domain.RefreshToken;
import com.freightclub.exception.InvalidRefreshTokenException;
import com.freightclub.repository.RefreshTokenRepository;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private JwtProperties jwtProperties;

    @InjectMocks
    private RefreshTokenService refreshTokenService;

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private RefreshToken makeToken(String userId, boolean revoked, boolean expired) {
        RefreshToken token = new RefreshToken();
        setField(token, "id", "token-id-1");
        token.setUserId(userId);
        token.setTokenHash("hashed-token");
        token.setExpiresAt(expired
                ? LocalDateTime.now().minusHours(1)
                : LocalDateTime.now().plusDays(7));
        token.setRevoked(revoked);
        return token;
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
    // createRefreshToken
    // -------------------------------------------------------------------------

    @Nested
    class CreateRefreshToken {

        @Test
        void savesTokenAndReturnsRawToken() {
            when(jwtProperties.getRefreshTokenExpiryMs()).thenReturn(604_800_000L);
            when(refreshTokenRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            String raw = refreshTokenService.createRefreshToken("user-1");

            assertThat(raw).isNotBlank();
            verify(refreshTokenRepository).save(any(RefreshToken.class));
        }

        @Test
        void generatedRawTokensAreUnique() {
            when(jwtProperties.getRefreshTokenExpiryMs()).thenReturn(604_800_000L);
            when(refreshTokenRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            String first = refreshTokenService.createRefreshToken("user-1");
            String second = refreshTokenService.createRefreshToken("user-1");

            assertThat(first).isNotEqualTo(second);
        }
    }

    // -------------------------------------------------------------------------
    // rotateRefreshToken
    // -------------------------------------------------------------------------

    @Nested
    class RotateRefreshToken {

        @Test
        void revokesOldToken_andReturnsNewRawToken() {
            RefreshToken existing = makeToken("user-1", false, false);
            when(refreshTokenRepository.findByTokenHashForUpdate(anyString()))
                    .thenReturn(Optional.of(existing));
            when(jwtProperties.getRefreshTokenExpiryMs()).thenReturn(604_800_000L);
            when(refreshTokenRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            RefreshTokenService.RotationResult result =
                    refreshTokenService.rotateRefreshToken("some-raw-token");

            // Old token should be revoked with revokedAt set
            ArgumentCaptor<RefreshToken> captor = ArgumentCaptor.forClass(RefreshToken.class);
            verify(refreshTokenRepository, atLeastOnce()).save(captor.capture());
            RefreshToken revoked = captor.getAllValues().stream()
                    .filter(RefreshToken::isRevoked)
                    .findFirst()
                    .orElseThrow();
            assertThat(revoked.isRevoked()).isTrue();
            assertThat(revoked.getRevokedAt()).isNotNull();

            assertThat(result.newRawToken()).isNotBlank();
            assertThat(result.userId()).isEqualTo("user-1");
        }

        @Test
        void throws_whenTokenNotFound() {
            when(refreshTokenRepository.findByTokenHashForUpdate(anyString()))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> refreshTokenService.rotateRefreshToken("bad-token"))
                    .isInstanceOf(InvalidRefreshTokenException.class);
        }

        @Test
        void throws_whenTokenIsRevoked() {
            RefreshToken revoked = makeToken("user-1", true, false);
            when(refreshTokenRepository.findByTokenHashForUpdate(anyString()))
                    .thenReturn(Optional.of(revoked));

            assertThatThrownBy(() -> refreshTokenService.rotateRefreshToken("revoked-token"))
                    .isInstanceOf(InvalidRefreshTokenException.class);
        }

        @Test
        void throws_whenTokenIsExpired() {
            RefreshToken expired = makeToken("user-1", false, true);
            when(refreshTokenRepository.findByTokenHashForUpdate(anyString()))
                    .thenReturn(Optional.of(expired));

            assertThatThrownBy(() -> refreshTokenService.rotateRefreshToken("expired-token"))
                    .isInstanceOf(InvalidRefreshTokenException.class);
        }
    }

    // -------------------------------------------------------------------------
    // revokeAllForUser
    // -------------------------------------------------------------------------

    @Nested
    class RevokeAllForUser {

        @Test
        void deletesAllTokensForUser() {
            refreshTokenService.revokeAllForUser("user-1");
            verify(refreshTokenRepository).deleteAllByUserId("user-1");
        }
    }
}
