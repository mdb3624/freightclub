package com.freightclub.service;

import com.freightclub.dto.PlatformHealthResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;

// US-883: bolts a webhook onto US-752's existing PlatformHealthService metrics rather than
// building a custom incident-log UI (council's Contrarian recommendation — Slack/PagerDuty
// already do this better). BR-5/AC-5: fail-open, matching PlatformHealthService's own design —
// a webhook failure must never affect the health-check response itself.
@Service
public class PlatformHealthAlertService {

    private static final Logger log = LoggerFactory.getLogger(PlatformHealthAlertService.class);

    @Value("${app.health-alerting.webhook-url:}")
    private String webhookUrl;

    @Value("${app.health-alerting.debounce-minutes:15}")
    private int debounceMinutes;

    @Value("${app.health-alerting.error-rate-threshold:0.5}")
    private double errorRateThreshold;

    private final RestTemplate restTemplate;

    private volatile boolean lastKnownHealthy = true;
    private volatile Instant lastAlertSentAt;

    public PlatformHealthAlertService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout((int) Duration.ofSeconds(5).toMillis());
        factory.setReadTimeout((int) Duration.ofSeconds(5).toMillis());
        this.restTemplate = new RestTemplate(factory);
    }

    // AC-1/AC-2/AC-3: called with each freshly-computed health result (PlatformHealthService's
    // 10s cache TTL already throttles how often this runs — no separate scheduler needed).
    public void evaluate(PlatformHealthResponse health) {
        if (webhookUrl == null || webhookUrl.isBlank()) {
            return; // AC-4: alerting is optional — health checking must not depend on it.
        }

        boolean isUnhealthy = !health.backendHealthy() || errorRateExceedsThreshold(health);

        if (isUnhealthy) {
            if (lastKnownHealthy) {
                sendAlert(buildPayload("UNHEALTHY", health));
                lastAlertSentAt = Instant.now();
            } else if (lastAlertSentAt == null
                    || Duration.between(lastAlertSentAt, Instant.now()).toMinutes() >= debounceMinutes) {
                // BR-3/AC-2: re-notify only after the debounce window elapses while still unhealthy.
                sendAlert(buildPayload("UNHEALTHY", health));
                lastAlertSentAt = Instant.now();
            }
        } else if (!lastKnownHealthy) {
            sendAlert(buildPayload("RECOVERED", health)); // AC-3
        }

        lastKnownHealthy = !isUnhealthy;
    }

    private boolean errorRateExceedsThreshold(PlatformHealthResponse health) {
        if (health.totalRequests() == 0) {
            return false;
        }
        double rate = (double) health.errorResponses() / health.totalRequests();
        return rate >= errorRateThreshold;
    }

    private Map<String, Object> buildPayload(String status, PlatformHealthResponse health) {
        return Map.of(
                "status", status,
                "backendHealthy", health.backendHealthy(),
                "totalRequests", health.totalRequests(),
                "errorResponses", health.errorResponses(),
                "timestamp", Instant.now().toString()
        );
    }

    private void sendAlert(Map<String, Object> payload) {
        try {
            restTemplate.postForEntity(webhookUrl, payload, String.class);
        } catch (Exception ex) {
            log.warn("Health alert webhook call failed", ex);
        }
    }
}
