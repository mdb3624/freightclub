package com.freightclub.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.freightclub.dto.DieselPriceResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class EiaFuelPriceService {

    private static final Logger log = LoggerFactory.getLogger(EiaFuelPriceService.class);
    private static final String EIA_URL = "https://api.eia.gov/v2/petroleum/pri/gnd/data/";
    private static final Duration CACHE_TTL = Duration.ofHours(6);
    private static final Duration STALE_THRESHOLD = Duration.ofHours(48);

    @Value("${app.eia.api-key:}")
    private String apiKey;

    @Value("${app.eia.enabled:false}")
    private boolean enabled;

    private final org.springframework.web.client.RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    private volatile DieselPriceResponse cachedResponse;
    private volatile Instant cacheTime;

    public EiaFuelPriceService(ObjectMapper objectMapper) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout((int) Duration.ofSeconds(5).toMillis());
        factory.setReadTimeout((int) Duration.ofSeconds(15).toMillis());
        this.restTemplate = new org.springframework.web.client.RestTemplate(factory);
        this.objectMapper = objectMapper;
    }

    public DieselPriceResponse getDieselPrices() {
        if (!enabled || apiKey == null || apiKey.isBlank()) {
            return DieselPriceResponse.unavailable();
        }

        if (cachedResponse != null && cacheTime != null) {
            if (Duration.between(cacheTime, Instant.now()).compareTo(CACHE_TTL) < 0) {
                return cachedResponse;
            }
        }

        DieselPriceResponse fresh = fetchWithRetry();
        if (fresh != null) {
            cachedResponse = fresh;
            cacheTime = Instant.now();
            return fresh;
        }

        if (cachedResponse != null) {
            boolean stale = Duration.between(cacheTime, Instant.now()).compareTo(STALE_THRESHOLD) > 0;
            return cachedResponse.withStale(stale);
        }
        return DieselPriceResponse.unavailable();
    }

    private DieselPriceResponse fetchWithRetry() {
        long delayMs = 1000;
        for (int attempt = 1; attempt <= 3; attempt++) {
            try {
                return fetch();
            } catch (Exception e) {
                log.error("EIA API fetch failed (attempt {}/3): {} {}", attempt, e.getClass().getSimpleName(), e.getMessage());
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

    private DieselPriceResponse fetch() throws Exception {
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

        String body = restTemplate.getForObject(url, String.class);
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
