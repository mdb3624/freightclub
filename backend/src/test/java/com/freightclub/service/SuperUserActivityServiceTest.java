package com.freightclub.service;

import com.freightclub.domain.RefreshToken;
import com.freightclub.dto.ActivityEventResponse;
import com.freightclub.dto.AuditLogEntryResponse;
import com.freightclub.repository.RefreshTokenRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

// US-882: merges login events (proxied by refresh-token issuance) with US-880 audit log
// entries targeting this user, most recent first. No new tracking infrastructure — both
// sources already exist.
@ExtendWith(MockitoExtension.class)
class SuperUserActivityServiceTest {

    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private AdminAuditLogService adminAuditLogService;

    private RefreshToken refreshTokenAt(LocalDateTime createdAt) throws Exception {
        RefreshToken token = new RefreshToken();
        token.setUserId("user-1");
        token.setTokenHash("hash-" + createdAt);
        token.setExpiresAt(createdAt.plusDays(7));
        Field field = RefreshToken.class.getDeclaredField("createdAt");
        field.setAccessible(true);
        field.set(token, createdAt);
        return token;
    }

    @Test
    void getActivity_mergesLoginEventsAndAuditEntries_mostRecentFirst() throws Exception {
        LocalDateTime older = LocalDateTime.of(2026, 9, 1, 10, 0);
        LocalDateTime newer = LocalDateTime.of(2026, 9, 2, 10, 0);

        when(refreshTokenRepository.findAllByUserIdOrderByCreatedAtDesc("user-1"))
                .thenReturn(List.of(refreshTokenAt(newer)));
        when(adminAuditLogService.list("user-1"))
                .thenReturn(List.of(new AuditLogEntryResponse("id-1", "admin-1", "USER_SUSPENDED", "user-1", "fraud", older)));

        SuperUserActivityService service = new SuperUserActivityService(refreshTokenRepository, adminAuditLogService);
        List<ActivityEventResponse> result = service.getActivity("user-1");

        assertThat(result).hasSize(2);
        assertThat(result.get(0).eventType()).isEqualTo("LOGIN");
        assertThat(result.get(0).occurredAt()).isEqualTo(newer);
        assertThat(result.get(1).eventType()).isEqualTo("USER_SUSPENDED");
        assertThat(result.get(1).occurredAt()).isEqualTo(older);
    }

    @Test
    void getActivity_returnsEmptyList_whenNoActivity() {
        when(refreshTokenRepository.findAllByUserIdOrderByCreatedAtDesc("user-1")).thenReturn(List.of());
        when(adminAuditLogService.list("user-1")).thenReturn(List.of());

        SuperUserActivityService service = new SuperUserActivityService(refreshTokenRepository, adminAuditLogService);
        List<ActivityEventResponse> result = service.getActivity("user-1");

        assertThat(result).isEmpty();
    }
}
