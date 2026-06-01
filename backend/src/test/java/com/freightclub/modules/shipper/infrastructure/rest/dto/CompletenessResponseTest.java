package com.freightclub.modules.shipper.infrastructure.rest.dto;

import com.freightclub.modules.shipper.domain.ShipperProfile;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("CompletenessResponse")
class CompletenessResponseTest {

    private ShipperProfile fullProfile() {
        ShipperProfile p = new ShipperProfile();
        p.setCompanyName("Acme Freight");
        p.setBillingEmail("billing@acme.com");
        p.setPhoneNumber("555-1234");
        p.setCity("Chicago");
        p.setState("IL");
        p.setZipCode("60601");
        p.setMcNumber("MC-123456");
        p.setLogoUrl("https://cdn.example.com/logo.png");
        return p;
    }

    private ShipperProfile emptyProfile() {
        return new ShipperProfile();
    }

    // ── isPublishReady branch ────────────────────────────────────────────────

    @Nested
    @DisplayName("isPublishReady")
    class PublishReady {

        @Test
        @DisplayName("true when completeness >= 80")
        void trueWhenCompletenessAtThreshold() {
            CompletenessResponse r = CompletenessResponse.from(fullProfile(), 80);
            assertThat(r.isPublishReady()).isTrue();
        }

        @Test
        @DisplayName("true when completeness above 80")
        void trueWhenCompletenessAboveThreshold() {
            CompletenessResponse r = CompletenessResponse.from(fullProfile(), 100);
            assertThat(r.isPublishReady()).isTrue();
        }

        @Test
        @DisplayName("false when completeness below 80")
        void falseWhenCompletenessBelowThreshold() {
            CompletenessResponse r = CompletenessResponse.from(emptyProfile(), 79);
            assertThat(r.isPublishReady()).isFalse();
        }
    }

    // ── remainingFields: skipped when completeness >= 80 ────────────────────

    @Nested
    @DisplayName("remainingFields suppressed above threshold")
    class RemainingFieldsSuppressed {

        @Test
        @DisplayName("empty list when completeness >= 80 even with blank profile")
        void emptyRemainingWhenAboveThreshold() {
            CompletenessResponse r = CompletenessResponse.from(emptyProfile(), 80);
            assertThat(r.remainingFields()).isEmpty();
        }
    }

    // ── Individual field null checks (completeness < 80) ─────────────────────

    @Nested
    @DisplayName("missing field detection below threshold")
    class MissingFields {

        @Test
        @DisplayName("companyName null adds 'companyName' to remaining")
        void nullCompanyNameFlagged() {
            ShipperProfile p = fullProfile();
            p.setCompanyName(null);
            CompletenessResponse r = CompletenessResponse.from(p, 50);
            assertThat(r.remainingFields()).contains("companyName");
        }

        @Test
        @DisplayName("companyName empty string adds 'companyName' to remaining")
        void emptyCompanyNameFlagged() {
            ShipperProfile p = fullProfile();
            p.setCompanyName("");
            CompletenessResponse r = CompletenessResponse.from(p, 50);
            assertThat(r.remainingFields()).contains("companyName");
        }

        @Test
        @DisplayName("billingEmail null adds 'billingEmail' to remaining")
        void nullBillingEmailFlagged() {
            ShipperProfile p = fullProfile();
            p.setBillingEmail(null);
            CompletenessResponse r = CompletenessResponse.from(p, 50);
            assertThat(r.remainingFields()).contains("billingEmail");
        }

        @Test
        @DisplayName("billingEmail empty adds 'billingEmail' to remaining")
        void emptyBillingEmailFlagged() {
            ShipperProfile p = fullProfile();
            p.setBillingEmail("");
            CompletenessResponse r = CompletenessResponse.from(p, 50);
            assertThat(r.remainingFields()).contains("billingEmail");
        }

        @Test
        @DisplayName("phoneNumber null adds 'phoneNumber' to remaining")
        void nullPhoneNumberFlagged() {
            ShipperProfile p = fullProfile();
            p.setPhoneNumber(null);
            CompletenessResponse r = CompletenessResponse.from(p, 50);
            assertThat(r.remainingFields()).contains("phoneNumber");
        }

        @Test
        @DisplayName("phoneNumber empty adds 'phoneNumber' to remaining")
        void emptyPhoneNumberFlagged() {
            ShipperProfile p = fullProfile();
            p.setPhoneNumber("");
            CompletenessResponse r = CompletenessResponse.from(p, 50);
            assertThat(r.remainingFields()).contains("phoneNumber");
        }

        @Test
        @DisplayName("city null adds 'city' to remaining")
        void nullCityFlagged() {
            ShipperProfile p = fullProfile();
            p.setCity(null);
            CompletenessResponse r = CompletenessResponse.from(p, 50);
            assertThat(r.remainingFields()).contains("city");
        }

        @Test
        @DisplayName("city empty adds 'city' to remaining")
        void emptyCityFlagged() {
            ShipperProfile p = fullProfile();
            p.setCity("");
            CompletenessResponse r = CompletenessResponse.from(p, 50);
            assertThat(r.remainingFields()).contains("city");
        }

        @Test
        @DisplayName("state null adds 'state' to remaining")
        void nullStateFlagged() {
            ShipperProfile p = fullProfile();
            p.setState(null);
            CompletenessResponse r = CompletenessResponse.from(p, 50);
            assertThat(r.remainingFields()).contains("state");
        }

        @Test
        @DisplayName("state empty adds 'state' to remaining")
        void emptyStateFlagged() {
            ShipperProfile p = fullProfile();
            p.setState("");
            CompletenessResponse r = CompletenessResponse.from(p, 50);
            assertThat(r.remainingFields()).contains("state");
        }

        @Test
        @DisplayName("zipCode null adds 'zipCode' to remaining")
        void nullZipCodeFlagged() {
            ShipperProfile p = fullProfile();
            p.setZipCode(null);
            CompletenessResponse r = CompletenessResponse.from(p, 50);
            assertThat(r.remainingFields()).contains("zipCode");
        }

        @Test
        @DisplayName("zipCode empty adds 'zipCode' to remaining")
        void emptyZipCodeFlagged() {
            ShipperProfile p = fullProfile();
            p.setZipCode("");
            CompletenessResponse r = CompletenessResponse.from(p, 50);
            assertThat(r.remainingFields()).contains("zipCode");
        }

        @Test
        @DisplayName("logoUrl null adds 'logoUrl' to remaining")
        void nullLogoUrlFlagged() {
            ShipperProfile p = fullProfile();
            p.setLogoUrl(null);
            CompletenessResponse r = CompletenessResponse.from(p, 50);
            assertThat(r.remainingFields()).contains("logoUrl");
        }

        @Test
        @DisplayName("logoUrl empty adds 'logoUrl' to remaining")
        void emptyLogoUrlFlagged() {
            ShipperProfile p = fullProfile();
            p.setLogoUrl("");
            CompletenessResponse r = CompletenessResponse.from(p, 50);
            assertThat(r.remainingFields()).contains("logoUrl");
        }
    }

    // ── mcNumber / usdotNumber compound branch ───────────────────────────────

    @Nested
    @DisplayName("mcNumber or usdotNumber compound check")
    class McUsdotBranch {

        @Test
        @DisplayName("both null adds 'mcNumber or usdotNumber'")
        void bothNullFlagged() {
            ShipperProfile p = fullProfile();
            p.setMcNumber(null);
            p.setUsdotNumber(null);
            CompletenessResponse r = CompletenessResponse.from(p, 50);
            assertThat(r.remainingFields()).contains("mcNumber or usdotNumber");
        }

        @Test
        @DisplayName("both empty adds 'mcNumber or usdotNumber'")
        void bothEmptyFlagged() {
            ShipperProfile p = fullProfile();
            p.setMcNumber("");
            p.setUsdotNumber("");
            CompletenessResponse r = CompletenessResponse.from(p, 50);
            assertThat(r.remainingFields()).contains("mcNumber or usdotNumber");
        }

        @Test
        @DisplayName("mcNumber present and usdotNumber null — not flagged")
        void mcNumberPresentUsdotNullNotFlagged() {
            ShipperProfile p = fullProfile();
            p.setMcNumber("MC-999");
            p.setUsdotNumber(null);
            CompletenessResponse r = CompletenessResponse.from(p, 50);
            assertThat(r.remainingFields()).doesNotContain("mcNumber or usdotNumber");
        }

        @Test
        @DisplayName("usdotNumber present and mcNumber null — not flagged")
        void usdotPresentMcNullNotFlagged() {
            ShipperProfile p = fullProfile();
            p.setMcNumber(null);
            p.setUsdotNumber("DOT-123");
            CompletenessResponse r = CompletenessResponse.from(p, 50);
            assertThat(r.remainingFields()).doesNotContain("mcNumber or usdotNumber");
        }

        @Test
        @DisplayName("mcNumber null, usdotNumber empty — still flagged")
        void mcNullUsdotEmptyFlagged() {
            ShipperProfile p = fullProfile();
            p.setMcNumber(null);
            p.setUsdotNumber("");
            CompletenessResponse r = CompletenessResponse.from(p, 50);
            assertThat(r.remainingFields()).contains("mcNumber or usdotNumber");
        }
    }

    // ── No false positives when profile is complete ──────────────────────────

    @Test
    @DisplayName("full profile below threshold produces empty remainingFields")
    void fullProfileBelowThresholdNoRemainingFields() {
        CompletenessResponse r = CompletenessResponse.from(fullProfile(), 50);
        assertThat(r.remainingFields()).isEmpty();
    }

    // ── Record accessor parity ───────────────────────────────────────────────

    @Test
    @DisplayName("completenessPercent reflects provided value")
    void completenessPercentReflectsInput() {
        CompletenessResponse r = CompletenessResponse.from(fullProfile(), 65);
        assertThat(r.completenessPercent()).isEqualTo(65);
    }

    @Test
    @DisplayName("all fields reported when completely empty profile at low completeness")
    void allFieldsReportedForEmptyProfile() {
        CompletenessResponse r = CompletenessResponse.from(emptyProfile(), 0);
        assertThat(r.remainingFields()).containsExactlyInAnyOrder(
                "companyName", "billingEmail", "phoneNumber",
                "city", "state", "zipCode", "mcNumber or usdotNumber", "logoUrl"
        );
    }
}
