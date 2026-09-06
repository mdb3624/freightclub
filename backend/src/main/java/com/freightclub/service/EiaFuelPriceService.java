package com.freightclub.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.freightclub.dto.DieselPriceResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * US-888: the live fetch (with retry/backoff) only ever runs on the {@link #refreshCache()}
 * schedule, off any request thread. {@link #getDieselPrices()} reads the cache unconditionally
 * once one exists, and only falls through to a single bounded-timeout attempt on true cold start
 * (no cache yet) — it never retries inline, so a slow EIA can no longer block a caller for the
 * ~63s worst case the old retry-loop-in-the-request-path design allowed.
 */
@Service
public class EiaFuelPriceService {

    private static final Logger log = LoggerFactory.getLogger(EiaFuelPriceService.class);
    private static final String EIA_URL = "https://api.eia.gov/v2/petroleum/pri/gnd/data/";
    private static final Duration STALE_THRESHOLD = Duration.ofHours(48);

    @Value("${app.eia.api-key:}")
    private String apiKey;

    @Value("${app.eia.enabled:false}")
    private boolean enabled;

    /** Used only by the scheduled background refresh — retries/backoff are free here since nothing waits on them. */
    private final RestTemplate restTemplate;

    /** Used only by the cold-start path in getDieselPrices() — single attempt, short timeout, never retried. */
    private final RestTemplate coldStartRestTemplate;

    private final ObjectMapper objectMapper;

    private volatile DieselPriceResponse cachedResponse;
    private volatile Instant cacheTime;

    public EiaFuelPriceService(ObjectMapper objectMapper) {
        this.restTemplate = buildRestTemplate(Duration.ofSeconds(5), Duration.ofSeconds(15));
        this.coldStartRestTemplate = buildRestTemplate(Duration.ofSeconds(2), Duration.ofSeconds(3));
        this.objectMapper = objectMapper;
    }

    private static RestTemplate buildRestTemplate(Duration connectTimeout, Duration readTimeout) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout((int) connectTimeout.toMillis());
        factory.setReadTimeout((int) readTimeout.toMillis());
        return new RestTemplate(factory);
    }

    /** Never blocks on a live fetch once a cache value exists — only a true cold start reaches the network here. */
    public DieselPriceResponse getDieselPrices() {
        if (!enabled || apiKey == null || apiKey.isBlank()) {
            return DieselPriceResponse.unavailable();
        }

        if (cachedResponse != null) {
            boolean stale = Duration.between(cacheTime, Instant.now()).compareTo(STALE_THRESHOLD) > 0;
            return cachedResponse.withStale(stale);
        }

        DieselPriceResponse fresh = fetchOnce(coldStartRestTemplate, "cold-start");
        if (fresh != null) {
            cachedResponse = fresh;
            cacheTime = Instant.now();
            return fresh;
        }
        return DieselPriceResponse.unavailable();
    }

    /** Runs off the request path — the 3-attempt retry/backoff here costs nothing since no caller is waiting. */
    @Scheduled(fixedRateString = "${app.eia.refresh-interval-ms:21600000}")
    public void refreshCache() {
        if (!enabled || apiKey == null || apiKey.isBlank()) {
            return;
        }
        DieselPriceResponse fresh = fetchWithRetry();
        if (fresh != null) {
            cachedResponse = fresh;
            cacheTime = Instant.now();
        }
    }

    private DieselPriceResponse fetchWithRetry() {
        long delayMs = 1000;
        for (int attempt = 1; attempt <= 3; attempt++) {
            try {
                return fetch(restTemplate);
            } catch (Exception e) {
                log.error("EIA API background refresh failed (attempt {}/3): {} {}", attempt, e.getClass().getSimpleName(), e.getMessage());
                if (attempt < 3) {
                    try {
                        Thread.sleep(delayMs);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                    delayMs *= 2;
                }
            }
        }
        return null;
    }

    private DieselPriceResponse fetchOnce(RestTemplate rt, String context) {
        try {
            return fetch(rt);
        } catch (Exception e) {
            log.error("EIA API {} fetch failed: {} {}", context, e.getClass().getSimpleName(), e.getMessage());
            return null;
        }
    }

    private DieselPriceResponse fetch(RestTemplate rt) throws Exception {
        String url = UriComponentsBuilder.fromHttpUrl(EIA_URL)
                .queryParam("api_key", apiKey)
                .queryParam("frequency", "weekly")
                .queryParam("data[0]", "value")
                .queryParam("facets[product][]", "EPD2D")
                .queryParam("facets[duoarea][]", "R10")
                .queryParam("facets[duoarea][]", "R20")
                .queryParam("facets[duoarea][]", "R30")
                .queryParam("facets[duoarea][]", "R40")
                .queryParam("facets[duoarea][]", "R50")
                .queryParam("sort[0][column]", "period")
                .queryParam("sort[0][direction]", "desc")
                .queryParam("length", "10")
                .build(false)
                .toUriString();

        String body = rt.getForObject(url, String.class);
        return parseResponse(body);
    }

    private DieselPriceResponse parseResponse(String json) throws Exception {
        JsonNode root = objectMapper.readTree(json);
        JsonNode data = root.path("response").path("data");
        if (!data.isArray() || data.isEmpty()) {
            throw new IllegalArgumentException("EIA response missing data array");
        }

        List<EiaDataPoint> points = new ArrayList<>();
        for (JsonNode node : data) {
            String duoarea = node.path("duoarea").asText("");
            String period = node.path("period").asText("");
            String value = node.path("value").asText("");
            if (!duoarea.isBlank() && !period.isBlank() && !value.isBlank()) {
                try {
                    points.add(new EiaDataPoint(duoarea, period, Double.parseDouble(value.trim())));
                } catch (NumberFormatException e) {
                    log.warn("Skipping EIA data point with unparseable value: {}", value);
                }
            }
        }

        List<EiaDataPoint> eastPoints   = sorted(points, "R10");
        List<EiaDataPoint> midwestPoints = sorted(points, "R20");
        List<EiaDataPoint> southPoints  = sorted(points, "R30");
        List<EiaDataPoint> rockyPoints  = sorted(points, "R40");
        List<EiaDataPoint> westPoints   = sorted(points, "R50");

        if (westPoints.isEmpty() || southPoints.isEmpty() || eastPoints.isEmpty()
                || midwestPoints.isEmpty() || rockyPoints.isEmpty()) {
            throw new IllegalArgumentException("Missing region data in EIA response");
        }

        String period = westPoints.get(0).period();
        return new DieselPriceResponse(
                current(eastPoints),   delta(eastPoints),
                current(midwestPoints), delta(midwestPoints),
                current(southPoints),  delta(southPoints),
                current(rockyPoints),  delta(rockyPoints),
                current(westPoints),   delta(westPoints),
                period, false, true
        );
    }

    private List<EiaDataPoint> sorted(List<EiaDataPoint> points, String duoarea) {
        return points.stream()
                .filter(p -> duoarea.equals(p.duoarea()))
                .sorted(Comparator.comparing(EiaDataPoint::period).reversed())
                .toList();
    }

    private double current(List<EiaDataPoint> pts) { return pts.get(0).value(); }
    private Double delta(List<EiaDataPoint> pts) { return pts.size() > 1 ? pts.get(0).value() - pts.get(1).value() : null; }

    private record EiaDataPoint(String duoarea, String period, double value) {}
}
