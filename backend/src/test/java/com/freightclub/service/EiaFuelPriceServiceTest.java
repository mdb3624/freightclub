package com.freightclub.service;

// EiaFuelPriceService coverage

import com.fasterxml.jackson.databind.ObjectMapper;
import com.freightclub.dto.DieselPriceResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("EiaFuelPriceService")
class EiaFuelPriceServiceTest {

    @Mock
    private RestTemplate restTemplate;

    // ObjectMapper is a real instance — no mocking needed for JSON parsing
    private final ObjectMapper objectMapper = new ObjectMapper();

    private EiaFuelPriceService service;

    /** Minimal valid EIA JSON with 5 regions, 2 periods each so delta is computable. */
    private static final String VALID_EIA_JSON = """
            {
              "response": {
                "data": [
                  {"duoarea":"R10","period":"2026-05-25","value":"4.100"},
                  {"duoarea":"R10","period":"2026-05-18","value":"4.050"},
                  {"duoarea":"R20","period":"2026-05-25","value":"3.900"},
                  {"duoarea":"R20","period":"2026-05-18","value":"3.850"},
                  {"duoarea":"R30","period":"2026-05-25","value":"3.750"},
                  {"duoarea":"R30","period":"2026-05-18","value":"3.700"},
                  {"duoarea":"R40","period":"2026-05-25","value":"3.600"},
                  {"duoarea":"R40","period":"2026-05-18","value":"3.550"},
                  {"duoarea":"R50","period":"2026-05-25","value":"4.500"},
                  {"duoarea":"R50","period":"2026-05-18","value":"4.400"}
                ]
              }
            }
            """;

    /** EIA JSON with single data point per region — delta should be null. */
    private static final String SINGLE_PERIOD_EIA_JSON = """
            {
              "response": {
                "data": [
                  {"duoarea":"R10","period":"2026-05-25","value":"4.100"},
                  {"duoarea":"R20","period":"2026-05-25","value":"3.900"},
                  {"duoarea":"R30","period":"2026-05-25","value":"3.750"},
                  {"duoarea":"R40","period":"2026-05-25","value":"3.600"},
                  {"duoarea":"R50","period":"2026-05-25","value":"4.500"}
                ]
              }
            }
            """;

    /** EIA JSON missing one region entirely. */
    private static final String MISSING_REGION_JSON = """
            {
              "response": {
                "data": [
                  {"duoarea":"R10","period":"2026-05-25","value":"4.100"},
                  {"duoarea":"R20","period":"2026-05-25","value":"3.900"},
                  {"duoarea":"R30","period":"2026-05-25","value":"3.750"},
                  {"duoarea":"R40","period":"2026-05-25","value":"3.600"}
                ]
              }
            }
            """;

    /** EIA JSON with an unparseable value in one entry. */
    private static final String UNPARSEABLE_VALUE_JSON = """
            {
              "response": {
                "data": [
                  {"duoarea":"R10","period":"2026-05-25","value":"N/A"},
                  {"duoarea":"R10","period":"2026-05-18","value":"4.050"},
                  {"duoarea":"R20","period":"2026-05-25","value":"3.900"},
                  {"duoarea":"R20","period":"2026-05-18","value":"3.850"},
                  {"duoarea":"R30","period":"2026-05-25","value":"3.750"},
                  {"duoarea":"R30","period":"2026-05-18","value":"3.700"},
                  {"duoarea":"R40","period":"2026-05-25","value":"3.600"},
                  {"duoarea":"R40","period":"2026-05-18","value":"3.550"},
                  {"duoarea":"R50","period":"2026-05-25","value":"4.500"},
                  {"duoarea":"R50","period":"2026-05-18","value":"4.400"}
                ]
              }
            }
            """;

    /** EIA JSON with empty data array. */
    private static final String EMPTY_DATA_JSON = """
            {
              "response": {
                "data": []
              }
            }
            """;

    @BeforeEach
    void setUp() {
        service = new EiaFuelPriceService(objectMapper);
        // Replace the internally-constructed RestTemplate with the mock
        ReflectionTestUtils.setField(service, "restTemplate", restTemplate);
    }

    private void enableService(String apiKey) {
        ReflectionTestUtils.setField(service, "enabled", true);
        ReflectionTestUtils.setField(service, "apiKey", apiKey);
    }

    // ── Disabled / unconfigured ───────────────────────────────────────────────

    @Nested
    @DisplayName("getDieselPrices — service disabled or unconfigured")
    class Disabled {

        @Test
        @DisplayName("returns unavailable when enabled=false")
        void shouldReturnUnavailable_whenDisabled() {
            // AC: enabled=false guard — first branch → DieselPriceResponse.unavailable()
            ReflectionTestUtils.setField(service, "enabled", false);
            ReflectionTestUtils.setField(service, "apiKey", "some-key");

            DieselPriceResponse result = service.getDieselPrices();

            assertThat(result.available()).isFalse();
            assertThat(result.eastPrice()).isNull();
            verifyNoInteractions(restTemplate);
        }

        @Test
        @DisplayName("returns unavailable when apiKey is null")
        void shouldReturnUnavailable_whenApiKeyIsNull() {
            // AC: apiKey null guard — null → DieselPriceResponse.unavailable()
            ReflectionTestUtils.setField(service, "enabled", true);
            ReflectionTestUtils.setField(service, "apiKey", null);

            DieselPriceResponse result = service.getDieselPrices();

            assertThat(result.available()).isFalse();
            verifyNoInteractions(restTemplate);
        }

        @Test
        @DisplayName("returns unavailable when apiKey is blank")
        void shouldReturnUnavailable_whenApiKeyIsBlank() {
            // AC: apiKey blank guard — blank → DieselPriceResponse.unavailable()
            ReflectionTestUtils.setField(service, "enabled", true);
            ReflectionTestUtils.setField(service, "apiKey", "   ");

            DieselPriceResponse result = service.getDieselPrices();

            assertThat(result.available()).isFalse();
            verifyNoInteractions(restTemplate);
        }
    }

    // ── Cache warm ────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("getDieselPrices — cache behaviour")
    class Cache {

        @Test
        @DisplayName("returns cached response without hitting API when cache is warm")
        void shouldReturnCachedPrice_whenCacheIsWarm() {
            // AC: cache TTL branch — cacheTime within 6h → cachedResponse returned, no HTTP call
            enableService("test-key");

            DieselPriceResponse cached = new DieselPriceResponse(
                    4.1, 0.05, 3.9, 0.05, 3.75, 0.05, 3.6, 0.05, 4.5, 0.1,
                    "2026-05-25", false, true);
            ReflectionTestUtils.setField(service, "cachedResponse", cached);
            ReflectionTestUtils.setField(service, "cacheTime", Instant.now());

            DieselPriceResponse result = service.getDieselPrices();

            assertThat(result).isSameAs(cached);
            verifyNoInteractions(restTemplate);
        }

        @Test
        @DisplayName("fetches fresh data and updates cache when cache is expired")
        void shouldFetchFreshData_whenCacheIsExpired() {
            // AC: cache TTL branch — cacheTime > 6h ago → fetch() called, cache updated
            enableService("test-key");

            // Seed with a stale cacheTime (7 hours ago)
            DieselPriceResponse stale = new DieselPriceResponse(
                    4.0, 0.0, 3.8, 0.0, 3.7, 0.0, 3.5, 0.0, 4.4, 0.0,
                    "2026-05-18", false, true);
            ReflectionTestUtils.setField(service, "cachedResponse", stale);
            ReflectionTestUtils.setField(service, "cacheTime", Instant.now().minusSeconds(7 * 3600));

            when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(VALID_EIA_JSON);

            DieselPriceResponse result = service.getDieselPrices();

            assertThat(result.available()).isTrue();
            assertThat(result.period()).isEqualTo("2026-05-25");
            verify(restTemplate, times(1)).getForObject(anyString(), eq(String.class));
        }

        @Test
        @DisplayName("fetches fresh data when no cache exists at all")
        void shouldFetchFreshData_whenCacheIsEmpty() {
            // AC: cold start — cachedResponse=null → fetch() called
            enableService("test-key");

            when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(VALID_EIA_JSON);

            DieselPriceResponse result = service.getDieselPrices();

            assertThat(result.available()).isTrue();
            assertThat(result.eastPrice()).isEqualTo(4.1);
            verify(restTemplate, times(1)).getForObject(anyString(), eq(String.class));
        }

        @Test
        @DisplayName("returns stale cached response when fetch fails and cache is within 48h")
        void shouldReturnStaleCache_whenFetchFailsAndCacheWithin48h() {
            // AC: stale fallback branch — fetch returns null, cache age < 48h → withStale(false)
            enableService("test-key");

            DieselPriceResponse existing = new DieselPriceResponse(
                    4.0, 0.0, 3.8, 0.0, 3.7, 0.0, 3.5, 0.0, 4.4, 0.0,
                    "2026-05-18", false, true);
            // Cache is 10 hours old — expired (> 6h) but within 48h stale threshold
            ReflectionTestUtils.setField(service, "cachedResponse", existing);
            ReflectionTestUtils.setField(service, "cacheTime", Instant.now().minusSeconds(10 * 3600));

            when(restTemplate.getForObject(anyString(), eq(String.class)))
                    .thenThrow(new RuntimeException("EIA API down"));

            DieselPriceResponse result = service.getDieselPrices();

            assertThat(result.available()).isTrue();
            assertThat(result.stale()).isFalse(); // within 48h → stale=false
        }

        @Test
        @DisplayName("returns stale=true when fetch fails and cache is older than 48h")
        void shouldReturnStaleTrue_whenFetchFailsAndCacheOlderThan48h() {
            // AC: stale threshold branch — cache age > 48h → withStale(true)
            enableService("test-key");

            DieselPriceResponse existing = new DieselPriceResponse(
                    4.0, 0.0, 3.8, 0.0, 3.7, 0.0, 3.5, 0.0, 4.4, 0.0,
                    "2026-05-15", false, true);
            ReflectionTestUtils.setField(service, "cachedResponse", existing);
            ReflectionTestUtils.setField(service, "cacheTime", Instant.now().minusSeconds(50 * 3600));

            when(restTemplate.getForObject(anyString(), eq(String.class)))
                    .thenThrow(new RuntimeException("EIA API down"));

            DieselPriceResponse result = service.getDieselPrices();

            assertThat(result.stale()).isTrue();
        }

        @Test
        @DisplayName("returns unavailable when fetch fails and no cache exists")
        void shouldReturnUnavailable_whenFetchFailsAndNoCacheExists() {
            // AC: no-cache fallback — fetch returns null, cachedResponse=null → unavailable()
            enableService("test-key");

            when(restTemplate.getForObject(anyString(), eq(String.class)))
                    .thenThrow(new RuntimeException("EIA API down"));

            DieselPriceResponse result = service.getDieselPrices();

            assertThat(result.available()).isFalse();
        }
    }

    // ── Parsing ───────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("parseResponse / fetch")
    class Parsing {

        @Test
        @DisplayName("parses all five regions and computes deltas correctly")
        void shouldParseAllRegionsAndDeltas_whenFullDataReturned() {
            // AC: parseResponse happy path — all regions present, delta = current - previous
            enableService("test-key");
            when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(VALID_EIA_JSON);

            DieselPriceResponse result = service.getDieselPrices();

            assertThat(result.available()).isTrue();
            assertThat(result.eastPrice()).isEqualTo(4.1);
            assertThat(result.eastDelta()).isCloseTo(0.05, org.assertj.core.data.Offset.offset(0.001));
            assertThat(result.midwestPrice()).isEqualTo(3.9);
            assertThat(result.southPrice()).isEqualTo(3.75);
            assertThat(result.rockyPrice()).isEqualTo(3.6);
            assertThat(result.westPrice()).isEqualTo(4.5);
            assertThat(result.stale()).isFalse();
            assertThat(result.period()).isEqualTo("2026-05-25");
        }

        @Test
        @DisplayName("returns null delta when only one data point per region")
        void shouldReturnNullDelta_whenOnlyOneDataPointPerRegion() {
            // AC: delta() helper — pts.size() == 1 → null returned
            enableService("test-key");
            when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(SINGLE_PERIOD_EIA_JSON);

            DieselPriceResponse result = service.getDieselPrices();

            assertThat(result.available()).isTrue();
            assertThat(result.eastDelta()).isNull();
            assertThat(result.westDelta()).isNull();
        }

        @Test
        @DisplayName("falls back to stale cache when response has missing region")
        void shouldFallToCache_whenRegionMissingInResponse() {
            // AC: missing region check — region list empty → IllegalArgumentException → retry → null fetch → stale cache
            enableService("test-key");

            // Prime cache so stale fallback can be exercised
            DieselPriceResponse existing = new DieselPriceResponse(
                    4.0, 0.0, 3.8, 0.0, 3.7, 0.0, 3.5, 0.0, 4.4, 0.0,
                    "2026-05-18", false, true);
            ReflectionTestUtils.setField(service, "cachedResponse", existing);
            ReflectionTestUtils.setField(service, "cacheTime", Instant.now().minusSeconds(7 * 3600));

            when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(MISSING_REGION_JSON);

            DieselPriceResponse result = service.getDieselPrices();

            // fetch fails after retries → stale cache returned
            assertThat(result.available()).isTrue();
        }

        @Test
        @DisplayName("skips data points with unparseable value and uses remaining points")
        void shouldSkipUnparseablePoints_andUseValidOnes() {
            // AC: NumberFormatException catch in parseResponse — bad value skipped, valid point used
            // R10 has only the second data point valid; with only 1 point delta becomes null.
            enableService("test-key");
            when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(UNPARSEABLE_VALUE_JSON);

            DieselPriceResponse result = service.getDieselPrices();

            assertThat(result.available()).isTrue();
            assertThat(result.eastPrice()).isEqualTo(4.05);  // only valid R10 point
            assertThat(result.eastDelta()).isNull();           // single point → no delta
        }

        @Test
        @DisplayName("falls back to unavailable when response data array is empty")
        void shouldReturnUnavailable_whenDataArrayIsEmpty() {
            // AC: empty data array check — no points → IllegalArgumentException → all retries fail → unavailable
            enableService("test-key");
            when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(EMPTY_DATA_JSON);

            DieselPriceResponse result = service.getDieselPrices();

            assertThat(result.available()).isFalse();
        }

        @Test
        @DisplayName("retries up to 3 times on network failure before giving up")
        void shouldRetry3Times_onNetworkFailure() {
            // AC: fetchWithRetry loop — 3 attempts made before returning null
            enableService("test-key");
            when(restTemplate.getForObject(anyString(), eq(String.class)))
                    .thenThrow(new RuntimeException("timeout"));

            DieselPriceResponse result = service.getDieselPrices();

            // 3 attempts total
            verify(restTemplate, times(3)).getForObject(anyString(), eq(String.class));
            assertThat(result.available()).isFalse();
        }

        @Test
        @DisplayName("succeeds on second attempt when first attempt throws")
        void shouldSucceed_onSecondAttemptAfterFirstFailure() {
            // AC: fetchWithRetry partial failure — attempt 1 throws, attempt 2 succeeds
            enableService("test-key");
            when(restTemplate.getForObject(anyString(), eq(String.class)))
                    .thenThrow(new RuntimeException("transient"))
                    .thenReturn(VALID_EIA_JSON);

            DieselPriceResponse result = service.getDieselPrices();

            assertThat(result.available()).isTrue();
            verify(restTemplate, times(2)).getForObject(anyString(), eq(String.class));
        }
    }
}
