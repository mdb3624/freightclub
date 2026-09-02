package com.freightclub.service;

import com.freightclub.dto.PlatformHealthResponse;
import com.freightclub.security.RequestMetricsFilter;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

// US-752 AC-1/AC-4: healthy path reports both signals; a failing DB ping must report
// backendHealthy=false, never throw.
@ExtendWith(MockitoExtension.class)
class PlatformHealthServiceTest {

    @Mock private JdbcTemplate jdbcTemplate;
    @Mock private RequestMetricsFilter requestMetricsFilter;

    @Test
    void reportsHealthy_whenDbPingSucceeds() {
        when(jdbcTemplate.queryForObject("SELECT 1", Integer.class)).thenReturn(1);
        when(requestMetricsFilter.getTotalRequests()).thenReturn(100L);
        when(requestMetricsFilter.getErrorResponses()).thenReturn(2L);

        PlatformHealthService service = new PlatformHealthService(jdbcTemplate, requestMetricsFilter);
        PlatformHealthResponse result = service.getHealth();

        assertThat(result.backendHealthy()).isTrue();
        assertThat(result.totalRequests()).isEqualTo(100L);
        assertThat(result.errorResponses()).isEqualTo(2L);
    }

    @Test
    void reportsUnhealthy_notThrows_whenDbPingFails() {
        when(jdbcTemplate.queryForObject("SELECT 1", Integer.class)).thenThrow(new RuntimeException("connection refused"));
        when(requestMetricsFilter.getTotalRequests()).thenReturn(50L);
        when(requestMetricsFilter.getErrorResponses()).thenReturn(50L);

        PlatformHealthService service = new PlatformHealthService(jdbcTemplate, requestMetricsFilter);
        PlatformHealthResponse result = service.getHealth();

        assertThat(result.backendHealthy()).isFalse();
    }
}
