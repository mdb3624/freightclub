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
        // Replace both internally-constructed RestTemplates with the same mock — tests
        // distinguish "which path ran" by checking whether an interaction happened at all,
        // not by which field it came from.
        ReflectionTestUtils.setField(service, "restTemplate", restTemplate);
        ReflectionTestUtils.setField(service, "coldStartRestTemplate", restTemplate);
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

    // ── Cache warm / cold start (US-888: sync path never retries) ──────────────

    @Nested
    @DisplayName("getDieselPrices — never blocks on network once cache exists (US-888 AC1)")
    class Cache {

        @Test
        @DisplayName("returns cached response without hitting API when cache is fresh")
        void shouldReturnCachedPrice_whenCacheIsFresh() {
            enableService("test-key");

            DieselPriceResponse cached = new DieselPriceResponse(
                    4.1, 0.05, 3.9, 0.05, 3.75, 0.05, 3.6, 0.05, 4.5, 0.1,
                    "2026-05-25", false, true);
            ReflectionTestUtils.setField(service, "cachedResponse", cached);
            ReflectionTestUtils.setField(service, "cacheTime", Instant.now());

            DieselPriceResponse result = service.getDieselPrices();

            assertThat(result).isEqualTo(cached);
            verifyNoInteractions(restTemplate);
        }

        @Test
        @DisplayName("US-888 AC1: returns existing cache with NO network call even when cache is past the old 6h TTL")
        void shouldReturnCache_withNoHttpCall_whenCacheIsPastOldTtlButWithin48h() {
            // This is the core behavior change: the sync path used to re-fetch (with retries) once
            // cache passed 6h. It no longer does — only the @Scheduled refresh touches the network now.
            enableService("test-key");

            DieselPriceResponse existing = new DieselPriceResponse(
                    4.0, 0.0, 3.8, 0.0, 3.7, 0.0, 3.5, 0.0, 4.4, 0.0,
                    "2026-05-18", false, true);
            ReflectionTestUtils.setField(service, "cachedResponse", existing);
            ReflectionTestUtils.setField(service, "cacheTime", Instant.now().minusSeconds(10 * 3600)); // 10h old

            DieselPriceResponse result = service.getDieselPrices();

            assertThat(result.available()).isTrue();
            assertThat(result.stale()).isFalse(); // within 48h → stale=false
            verifyNoInteractions(restTemplate);
        }

        @Test
        @DisplayName("returns stale=true purely from cache age, still with no network call")
        void shouldReturnStaleTrue_fromCacheAgeAlone_withNoHttpCall() {
            enableService("test-key");

            DieselPriceResponse existing = new DieselPriceResponse(
                    4.0, 0.0, 3.8, 0.0, 3.7, 0.0, 3.5, 0.0, 4.4, 0.0,
                    "2026-05-15", false, true);
            ReflectionTestUtils.setField(service, "cachedResponse", existing);
            ReflectionTestUtils.setField(service, "cacheTime", Instant.now().minusSeconds(50 * 3600)); // 50h old

            DieselPriceResponse result = service.getDieselPrices();

            assertThat(result.available()).isTrue();
            assertThat(result.stale()).isTrue();
            verifyNoInteractions(restTemplate);
        }

        @Test
        @DisplayName("US-888 AC3: cold start makes exactly ONE fetch attempt, no retry loop")
        void shouldMakeExactlyOneAttempt_onColdStart_success() {
            enableService("test-key");

            when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(VALID_EIA_JSON);

            DieselPriceResponse result = service.getDieselPrices();

            assertThat(result.available()).isTrue();
            assertThat(result.eastPrice()).isEqualTo(4.1);
            verify(restTemplate, times(1)).getForObject(anyString(), eq(String.class));
        }

        @Test
        @DisplayName("US-888 AC3: cold start returns unavailable after exactly ONE failed attempt — no retry/backoff")
        void shouldMakeExactlyOneAttempt_onColdStart_failure() {
            enableService("test-key");

            when(restTemplate.getForObject(anyString(), eq(String.class)))
                    .thenThrow(new RuntimeException("EIA API down"));

            DieselPriceResponse result = service.getDieselPrices();

            assertThat(result.available()).isFalse();
            verify(restTemplate, times(1)).getForObject(anyString(), eq(String.class));
        }
    }

    // ── Scheduled background refresh (US-888 AC2/AC4) ──────────────────────────

    @Nested
    @DisplayName("refreshCache — scheduled, off the request path")
    class ScheduledRefresh {

        @Test
        @DisplayName("US-888 AC2: successful refresh populates the cache")
        void shouldPopulateCache_onSuccessfulRefresh() {
            enableService("test-key");
            when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(VALID_EIA_JSON);

            service.refreshCache();

            DieselPriceResponse cached = (DieselPriceResponse) ReflectionTestUtils.getField(service, "cachedResponse");
            assertThat(cached).isNotNull();
            assertThat(cached.available()).isTrue();
            assertThat(cached.eastPrice()).isEqualTo(4.1);
        }

        @Test
        @DisplayName("US-888 AC4: retries up to 3 times with backoff on failure, unchanged from prior behavior")
        void shouldRetry3Times_onNetworkFailure() {
            enableService("test-key");
            when(restTemplate.getForObject(anyString(), eq(String.class)))
                    .thenThrow(new RuntimeException("timeout"));

            service.refreshCache();

            verify(restTemplate, times(3)).getForObject(anyString(), eq(String.class));
        }

        @Test
        @DisplayName("succeeds on second attempt when first attempt throws")
        void shouldSucceed_onSecondAttemptAfterFirstFailure() {
            enableService("test-key");
            when(restTemplate.getForObject(anyString(), eq(String.class)))
                    .thenThrow(new RuntimeException("transient"))
                    .thenReturn(VALID_EIA_JSON);

            service.refreshCache();

            verify(restTemplate, times(2)).getForObject(anyString(), eq(String.class));
            DieselPriceResponse cached = (DieselPriceResponse) ReflectionTestUtils.getField(service, "cachedResponse");
            assertThat(cached.available()).isTrue();
        }

        @Test
        @DisplayName("leaves the existing cache untouched when all 3 attempts fail")
        void shouldLeaveCacheUntouched_whenAllAttemptsFail() {
            enableService("test-key");
            DieselPriceResponse existing = new DieselPriceResponse(
                    4.0, 0.0, 3.8, 0.0, 3.7, 0.0, 3.5, 0.0, 4.4, 0.0,
                    "2026-05-18", false, true);
            ReflectionTestUtils.setField(service, "cachedResponse", existing);
            Instant originalCacheTime = Instant.now().minusSeconds(3600);
            ReflectionTestUtils.setField(service, "cacheTime", originalCacheTime);

            when(restTemplate.getForObject(anyString(), eq(String.class)))
                    .thenThrow(new RuntimeException("EIA API down"));

            service.refreshCache();

            assertThat(ReflectionTestUtils.getField(service, "cachedResponse")).isEqualTo(existing);
            assertThat(ReflectionTestUtils.getField(service, "cacheTime")).isEqualTo(originalCacheTime);
        }

        @Test
        @DisplayName("no-ops (no HTTP call) when disabled")
        void shouldNoOp_whenDisabled() {
            ReflectionTestUtils.setField(service, "enabled", false);
            ReflectionTestUtils.setField(service, "apiKey", "some-key");

            service.refreshCache();

            verifyNoInteractions(restTemplate);
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
        @DisplayName("background refresh leaves prior cache untouched when response has missing region")
        void shouldLeaveCacheUntouched_whenRegionMissingInResponse() {
            // AC: missing region check — region list empty → IllegalArgumentException → all 3 retries fail → cache untouched
            enableService("test-key");

            DieselPriceResponse existing = new DieselPriceResponse(
                    4.0, 0.0, 3.8, 0.0, 3.7, 0.0, 3.5, 0.0, 4.4, 0.0,
                    "2026-05-18", false, true);
            ReflectionTestUtils.setField(service, "cachedResponse", existing);
            ReflectionTestUtils.setField(service, "cacheTime", Instant.now().minusSeconds(7 * 3600));

            when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(MISSING_REGION_JSON);

            service.refreshCache();

            assertThat(ReflectionTestUtils.getField(service, "cachedResponse")).isEqualTo(existing);
            verify(restTemplate, times(3)).getForObject(anyString(), eq(String.class));
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
    }
}
