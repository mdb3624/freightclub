package com.freightclub.service;

import com.freightclub.dto.PlatformHealthResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

// US-883: threshold check bolted onto US-752's existing metrics — no new metrics collection.
@ExtendWith(MockitoExtension.class)
class PlatformHealthAlertServiceTest {

    @Mock private RestTemplate restTemplate;

    private PlatformHealthAlertService service;

    @BeforeEach
    void setUp() {
        service = new PlatformHealthAlertService();
        ReflectionTestUtils.setField(service, "restTemplate", restTemplate);
        ReflectionTestUtils.setField(service, "webhookUrl", "https://hooks.example.com/alert");
        ReflectionTestUtils.setField(service, "debounceMinutes", 15);
        ReflectionTestUtils.setField(service, "errorRateThreshold", 0.5);
    }

    private PlatformHealthResponse healthy() {
        return new PlatformHealthResponse(true, 100, 1);
    }

    private PlatformHealthResponse unhealthy() {
        return new PlatformHealthResponse(false, 100, 1);
    }

    private PlatformHealthResponse highErrorRate() {
        return new PlatformHealthResponse(true, 10, 8);
    }

    // AC-4: webhook URL unset — no HTTP call, no exception.
    @Test
    void doesNothing_whenWebhookUrlNotConfigured() {
        ReflectionTestUtils.setField(service, "webhookUrl", "");

        service.evaluate(unhealthy());

        verifyNoInteractions(restTemplate);
    }

    // AC-1: healthy -> unhealthy transition fires immediately.
    @Test
    void firesAlert_onHealthyToUnhealthyTransition() {
        service.evaluate(healthy());
        service.evaluate(unhealthy());

        verify(restTemplate, times(1)).postForEntity(eq("https://hooks.example.com/alert"), any(), eq(String.class));
    }

    // BR-2: error-rate threshold crossing also counts as unhealthy, even if backendHealthy=true.
    @Test
    void firesAlert_whenErrorRateCrossesThreshold() {
        service.evaluate(healthy());
        service.evaluate(highErrorRate());

        verify(restTemplate, times(1)).postForEntity(eq("https://hooks.example.com/alert"), any(), eq(String.class));
    }

    // AC-2/BR-3: unhealthy persists across cycles — must not re-fire inside the debounce window.
    @Test
    void doesNotRefire_whileUnhealthyPersistsWithinDebounceWindow() {
        service.evaluate(healthy());
        service.evaluate(unhealthy());
        service.evaluate(unhealthy());
        service.evaluate(unhealthy());

        verify(restTemplate, times(1)).postForEntity(anyString(), any(), eq(String.class));
    }

    // BR-3: once the debounce window elapses while still unhealthy, it re-fires.
    @Test
    void refires_afterDebounceWindowElapses() {
        service.evaluate(healthy());
        service.evaluate(unhealthy());
        ReflectionTestUtils.setField(service, "lastAlertSentAt", Instant.now().minusSeconds(16 * 60));

        service.evaluate(unhealthy());

        verify(restTemplate, times(2)).postForEntity(anyString(), any(), eq(String.class));
    }

    // AC-3: recovery notification fires once when health returns to normal.
    @Test
    void firesRecoveryAlert_whenHealthReturnsToNormal() {
        service.evaluate(healthy());
        service.evaluate(unhealthy());
        service.evaluate(healthy());

        verify(restTemplate, times(2)).postForEntity(anyString(), any(), eq(String.class));
    }

    // Recovery must not re-fire on every subsequent healthy cycle.
    @Test
    void doesNotRefireRecovery_onSubsequentHealthyCycles() {
        service.evaluate(healthy());
        service.evaluate(unhealthy());
        service.evaluate(healthy());
        service.evaluate(healthy());
        service.evaluate(healthy());

        verify(restTemplate, times(2)).postForEntity(anyString(), any(), eq(String.class));
    }

    // AC-5/BR-5: a failing webhook call must not throw out of evaluate().
    @Test
    void doesNotThrow_whenWebhookCallFails() {
        when(restTemplate.postForEntity(anyString(), any(), eq(String.class)))
                .thenThrow(new RuntimeException("network error"));

        service.evaluate(healthy());
        service.evaluate(unhealthy());

        verify(restTemplate).postForEntity(anyString(), any(), eq(String.class));
    }

    @Test
    void doesNotFire_whenAlreadyHealthy() {
        service.evaluate(healthy());
        service.evaluate(healthy());

        verifyNoInteractions(restTemplate);
    }
}
