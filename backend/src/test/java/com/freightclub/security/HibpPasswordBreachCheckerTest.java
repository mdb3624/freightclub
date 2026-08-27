package com.freightclub.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import java.lang.reflect.Field;
import java.security.MessageDigest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

// US-866 AC-1/AC-3/AC-4: the k-anonymity range client itself. AuthServiceTest covers how
// AuthService reacts to each BreachCheckResult; this covers how HibpPasswordBreachChecker
// derives that result from the range API's response shape.
class HibpPasswordBreachCheckerTest {

    private static final String BASE_URL = "https://api.pwnedpasswords.test";
    private static final String PASSWORD = "password123";

    private RestTemplate restTemplate;
    private MockRestServiceServer mockServer;
    private HibpPasswordBreachChecker checker;

    @BeforeEach
    void setup() {
        restTemplate = new RestTemplate();
        mockServer = MockRestServiceServer.createServer(restTemplate);
        checker = new HibpPasswordBreachChecker(restTemplate);
        setField(checker, "enabled", true);
        setField(checker, "baseUrl", BASE_URL);
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

    private static String sha1Hex(String value) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-1");
        byte[] hash = digest.digest(value.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : hash) {
            sb.append(String.format("%02X", b));
        }
        return sb.toString();
    }

    @Test
    // AC-1: the exact suffix appears in the range response -> BREACHED.
    void returnsBreached_whenSuffixMatchesRangeResponse() throws Exception {
        String hash = sha1Hex(PASSWORD);
        String prefix = hash.substring(0, 5);
        String suffix = hash.substring(5);

        mockServer.expect(requestTo(BASE_URL + "/range/" + prefix))
                .andRespond(withSuccess(suffix + ":37\r\nAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA:1", MediaType.TEXT_PLAIN));

        BreachCheckResult result = checker.isBreached(PASSWORD);

        assertThat(result).isEqualTo(BreachCheckResult.BREACHED);
    }

    @Test
    // AC-3: no line in the range response matches the suffix -> CLEAN.
    void returnsClean_whenNoSuffixMatchesRangeResponse() throws Exception {
        String hash = sha1Hex(PASSWORD);
        String prefix = hash.substring(0, 5);

        mockServer.expect(requestTo(BASE_URL + "/range/" + prefix))
                .andRespond(withSuccess("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB:9\r\nCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC:2", MediaType.TEXT_PLAIN));

        BreachCheckResult result = checker.isBreached(PASSWORD);

        assertThat(result).isEqualTo(BreachCheckResult.CLEAN);
    }

    @Test
    // AC-4/BR-4: the range API errors -> CHECK_UNAVAILABLE, never an exception the caller
    // has to handle, and never BREACHED (fail open, not fail closed).
    void returnsCheckUnavailable_whenRangeApiErrors() throws Exception {
        String hash = sha1Hex(PASSWORD);
        String prefix = hash.substring(0, 5);

        mockServer.expect(requestTo(BASE_URL + "/range/" + prefix))
                .andRespond(withServerError());

        BreachCheckResult result = checker.isBreached(PASSWORD);

        assertThat(result).isEqualTo(BreachCheckResult.CHECK_UNAVAILABLE);
    }

    @Test
    // AC-4/BR-4: disabled via config (app.hibp.enabled=false) never calls the network at all,
    // and is treated the same as an outage — not blocking.
    void returnsCheckUnavailable_whenDisabled_andNeverCallsNetwork() {
        setField(checker, "enabled", false);

        BreachCheckResult result = checker.isBreached(PASSWORD);

        assertThat(result).isEqualTo(BreachCheckResult.CHECK_UNAVAILABLE);
        mockServer.verify(); // no expectations were set -> fails if any request was made
    }

    @Test
    // The full password must never be sent over the network — only the 5-char SHA-1 prefix
    // (k-anonymity). Confirms the request URL is exactly the prefix, nothing more.
    void sendsOnlyHashPrefix_neverFullPasswordOrFullHash() throws Exception {
        String hash = sha1Hex(PASSWORD);
        String prefix = hash.substring(0, 5);
        String suffix = hash.substring(5);

        mockServer.expect(requestTo(BASE_URL + "/range/" + prefix))
                .andRespond(withSuccess(suffix + ":1", MediaType.TEXT_PLAIN));

        checker.isBreached(PASSWORD);

        mockServer.verify();
    }
}
