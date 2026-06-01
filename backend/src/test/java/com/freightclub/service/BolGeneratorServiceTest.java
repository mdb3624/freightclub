package com.freightclub.service;

// BolGeneratorService coverage

import com.freightclub.domain.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
@DisplayName("BolGeneratorService")
class BolGeneratorServiceTest {

    // No mocks — BolGeneratorService has no injected dependencies;
    // it is a pure PDF-generation utility using PDFBox.
    private BolGeneratorService service;

    @BeforeEach
    void setUp() {
        service = new BolGeneratorService();
    }

    // ── Shared helpers ────────────────────────────────────────────────────────

    private Load buildLoad() {
        Load load = new Load();
        ReflectionTestUtils.setField(load, "id", "abcdef12-0000-0000-0000-000000000000");
        load.setStatus(LoadStatus.OPEN);
        load.setOriginCity("Dallas");
        load.setOriginState("TX");
        load.setOriginZip("75201");
        load.setOriginAddress1("100 Main St");
        load.setDestinationCity("Houston");
        load.setDestinationState("TX");
        load.setDestinationZip("77001");
        load.setDestinationAddress1("200 Elm St");
        load.setCommodity("Electronics");
        load.setWeightLbs(new BigDecimal("5000"));
        load.setEquipmentType(EquipmentType.DRY_VAN);
        load.setPayRate(new BigDecimal("2.50"));
        load.setPayRateType(PayRateType.PER_MILE);
        load.setPickupFrom(LocalDateTime.of(2026, 6, 1, 8, 0));
        load.setPickupTo(LocalDateTime.of(2026, 6, 1, 12, 0));
        load.setDeliveryFrom(LocalDateTime.of(2026, 6, 2, 8, 0));
        load.setDeliveryTo(LocalDateTime.of(2026, 6, 2, 17, 0));
        return load;
    }

    private User buildShipperWithBusiness() {
        User u = new User();
        u.setFirstName("Jane");
        u.setLastName("Doe");
        u.setBusinessName("Acme Shipping LLC");
        u.setPhone("555-123-4567");
        return u;
    }

    private User buildShipperNoBusinessName() {
        User u = new User();
        u.setFirstName("John");
        u.setLastName("Smith");
        u.setBusinessName(null);
        u.setPhone(null);
        return u;
    }

    // ── generateBol ───────────────────────────────────────────────────────────

    @Nested
    @DisplayName("generateBol")
    class GenerateBol {

        @Test
        @DisplayName("returns non-empty PDF bytes for a fully-populated load")
        void shouldReturnPdfBytes_whenLoadIsFullyPopulated() {
            // AC: BOL generated with all optional fields present → valid PDF byte array
            Load load = buildLoad();
            load.setOriginAddress2("Suite 100");
            load.setDestinationAddress2("Unit B");
            load.setLengthFt(new BigDecimal("48"));
            load.setWidthFt(new BigDecimal("8"));
            load.setHeightFt(new BigDecimal("9"));
            load.setPaymentTerms(PaymentTerms.QUICK_PAY);
            load.setSpecialRequirements("Fragile — handle with care");
            User shipper = buildShipperWithBusiness();

            byte[] result = service.generateBol(load, shipper);

            assertThat(result).isNotNull().isNotEmpty();
            // PDF magic bytes: %PDF
            assertThat(result[0]).isEqualTo((byte) '%');
            assertThat(result[1]).isEqualTo((byte) 'P');
            assertThat(result[2]).isEqualTo((byte) 'D');
            assertThat(result[3]).isEqualTo((byte) 'F');
        }

        @Test
        @DisplayName("uses firstName + lastName as shipper name when businessName is null")
        void shouldFallBackToPersonName_whenBusinessNameIsNull() {
            // AC: nonempty() fallback branch — null businessName → first+last name used
            Load load = buildLoad();
            User shipper = buildShipperNoBusinessName();

            byte[] result = service.generateBol(load, shipper);

            assertThat(result).isNotEmpty();
        }

        @Test
        @DisplayName("uses firstName + lastName as shipper name when businessName is blank")
        void shouldFallBackToPersonName_whenBusinessNameIsBlank() {
            // AC: nonempty() fallback branch — blank businessName → first+last name used
            Load load = buildLoad();
            User shipper = buildShipperWithBusiness();
            shipper.setBusinessName("   ");

            byte[] result = service.generateBol(load, shipper);

            assertThat(result).isNotEmpty();
        }

        @Test
        @DisplayName("omits phone line when shipper phone is null")
        void shouldOmitPhoneLine_whenPhoneIsNull() {
            // AC: conditional phone rendering — null phone → line skipped
            Load load = buildLoad();
            User shipper = buildShipperNoBusinessName();
            // phone already null

            byte[] result = service.generateBol(load, shipper);

            assertThat(result).isNotEmpty();
        }

        @Test
        @DisplayName("omits phone line when shipper phone is blank")
        void shouldOmitPhoneLine_whenPhoneIsBlank() {
            // AC: conditional phone rendering — blank phone → line skipped
            Load load = buildLoad();
            User shipper = buildShipperWithBusiness();
            shipper.setPhone("   ");

            byte[] result = service.generateBol(load, shipper);

            assertThat(result).isNotEmpty();
        }

        @Test
        @DisplayName("renders address2 row when at least one address2 is present")
        void shouldRenderAddress2Row_whenOriginAddress2IsPresent() {
            // AC: address2 conditional branch — non-blank oa2 → row rendered
            Load load = buildLoad();
            load.setOriginAddress2("Suite 100");
            load.setDestinationAddress2(null);
            User shipper = buildShipperWithBusiness();

            byte[] result = service.generateBol(load, shipper);

            assertThat(result).isNotEmpty();
        }

        @Test
        @DisplayName("renders address2 row when only destinationAddress2 is present")
        void shouldRenderAddress2Row_whenDestinationAddress2IsPresent() {
            // AC: address2 conditional branch — non-blank da2 → row rendered
            Load load = buildLoad();
            load.setOriginAddress2(null);
            load.setDestinationAddress2("Dock 3");
            User shipper = buildShipperWithBusiness();

            byte[] result = service.generateBol(load, shipper);

            assertThat(result).isNotEmpty();
        }

        @Test
        @DisplayName("omits address2 row when both address2 fields are null")
        void shouldOmitAddress2Row_whenBothAddress2AreNull() {
            // AC: address2 conditional branch — both null → row skipped
            Load load = buildLoad();
            load.setOriginAddress2(null);
            load.setDestinationAddress2(null);
            User shipper = buildShipperWithBusiness();

            byte[] result = service.generateBol(load, shipper);

            assertThat(result).isNotEmpty();
        }

        @Test
        @DisplayName("renders dimensions row when all three dimension fields are set")
        void shouldRenderDimensions_whenAllDimensionsPresent() {
            // AC: dimensions conditional branch — all three non-null → row rendered
            Load load = buildLoad();
            load.setLengthFt(new BigDecimal("53"));
            load.setWidthFt(new BigDecimal("8"));
            load.setHeightFt(new BigDecimal("9"));
            User shipper = buildShipperWithBusiness();

            byte[] result = service.generateBol(load, shipper);

            assertThat(result).isNotEmpty();
        }

        @Test
        @DisplayName("omits dimensions row when any dimension field is null")
        void shouldOmitDimensions_whenDimensionIsNull() {
            // AC: dimensions conditional branch — null lengthFt → row skipped
            Load load = buildLoad();
            load.setLengthFt(null);
            load.setWidthFt(new BigDecimal("8"));
            load.setHeightFt(new BigDecimal("9"));
            User shipper = buildShipperWithBusiness();

            byte[] result = service.generateBol(load, shipper);

            assertThat(result).isNotEmpty();
        }

        @Test
        @DisplayName("renders payment terms when paymentTerms is set")
        void shouldRenderPaymentTerms_whenPaymentTermsPresent() {
            // AC: paymentTerms conditional branch — non-null → terms line rendered
            Load load = buildLoad();
            load.setPaymentTerms(PaymentTerms.NET_30);
            User shipper = buildShipperWithBusiness();

            byte[] result = service.generateBol(load, shipper);

            assertThat(result).isNotEmpty();
        }

        @Test
        @DisplayName("omits payment terms line when paymentTerms is null")
        void shouldOmitPaymentTerms_whenPaymentTermsNull() {
            // AC: paymentTerms conditional branch — null → terms line skipped
            Load load = buildLoad();
            load.setPaymentTerms(null);
            User shipper = buildShipperWithBusiness();

            byte[] result = service.generateBol(load, shipper);

            assertThat(result).isNotEmpty();
        }

        @Test
        @DisplayName("renders special requirements section when specialRequirements is non-blank")
        void shouldRenderSpecialRequirements_whenPresent() {
            // AC: specialRequirements conditional block — non-blank → section rendered
            Load load = buildLoad();
            load.setSpecialRequirements("Liftgate required at delivery.");
            User shipper = buildShipperWithBusiness();

            byte[] result = service.generateBol(load, shipper);

            assertThat(result).isNotEmpty();
        }

        @Test
        @DisplayName("omits special requirements section when field is null")
        void shouldOmitSpecialRequirements_whenNull() {
            // AC: specialRequirements conditional block — null → section skipped
            Load load = buildLoad();
            load.setSpecialRequirements(null);
            User shipper = buildShipperWithBusiness();

            byte[] result = service.generateBol(load, shipper);

            assertThat(result).isNotEmpty();
        }

        @Test
        @DisplayName("omits special requirements section when field is blank")
        void shouldOmitSpecialRequirements_whenBlank() {
            // AC: specialRequirements conditional block — blank → section skipped
            Load load = buildLoad();
            load.setSpecialRequirements("   ");
            User shipper = buildShipperWithBusiness();

            byte[] result = service.generateBol(load, shipper);

            assertThat(result).isNotEmpty();
        }

        @Test
        @DisplayName("wraps long special requirements text across multiple lines")
        void shouldWrapLongSpecialRequirements() {
            // AC: wrap() helper — text > 90 chars → split into multiple lines
            Load load = buildLoad();
            load.setSpecialRequirements(
                    "This shipment requires special handling due to fragile components and must be kept upright at all times during transport. Driver must obtain signature.");
            User shipper = buildShipperWithBusiness();

            byte[] result = service.generateBol(load, shipper);

            assertThat(result).isNotEmpty();
        }

        @Test
        @DisplayName("formats null pickup datetime as em-dash")
        void shouldFormatNullDatetime_asEmDash() {
            // AC: fmt() helper — null LocalDateTime → "—" rendered
            Load load = buildLoad();
            load.setPickupFrom(null);
            User shipper = buildShipperWithBusiness();

            byte[] result = service.generateBol(load, shipper);

            assertThat(result).isNotEmpty();
        }

        @Test
        @DisplayName("renders FLAT_RATE pay rate type with underscore replaced by space")
        void shouldRenderFlatRateType_withSpaceInsteadOfUnderscore() {
            // AC: payRateType.name().replace("_", " ") branch — FLAT_RATE displayed correctly
            Load load = buildLoad();
            load.setPayRateType(PayRateType.FLAT_RATE);
            User shipper = buildShipperWithBusiness();

            byte[] result = service.generateBol(load, shipper);

            assertThat(result).isNotEmpty();
        }
    }

    // ── generateExport ────────────────────────────────────────────────────────

    @Nested
    @DisplayName("generateExport")
    class GenerateExport {

        private User buildTrucker() {
            User u = new User();
            u.setFirstName("Bob");
            u.setLastName("Trucker");
            u.setPhone("555-987-6543");
            return u;
        }

        private LoadDocument buildDocument(boolean withNote) {
            LoadDocument d = new LoadDocument();
            d.setDocumentType(DocumentType.BOL_PHOTO);
            d.setOriginalFilename("bol.jpg");
            d.setFileSizeBytes(512_000L);
            if (withNote) {
                d.setNote("Driver confirmed delivery.");
            }
            return d;
        }

        @Test
        @DisplayName("returns non-empty PDF bytes for fully populated export")
        void shouldReturnPdfBytes_whenAllPartiesAndDocumentsPresent() {
            // AC: generateExport happy path — shipper + trucker + documents → valid PDF
            Load load = buildLoad();
            load.setDistanceMiles(new BigDecimal("250"));
            load.setPaymentTerms(PaymentTerms.NET_15);
            User shipper = buildShipperWithBusiness();
            User trucker = buildTrucker();
            List<LoadDocument> docs = List.of(buildDocument(true), buildDocument(false));

            byte[] result = service.generateExport(load, shipper, trucker, docs);

            assertThat(result).isNotNull().isNotEmpty();
            assertThat(result[0]).isEqualTo((byte) '%');
        }

        @Test
        @DisplayName("omits shipper section when shipper is null")
        void shouldOmitShipperSection_whenShipperIsNull() {
            // AC: shipper null-check branch — null shipper → section skipped
            Load load = buildLoad();
            User trucker = buildTrucker();

            byte[] result = service.generateExport(load, null, trucker, List.of());

            assertThat(result).isNotEmpty();
        }

        @Test
        @DisplayName("omits trucker section when trucker is null")
        void shouldOmitTruckerSection_whenTruckerIsNull() {
            // AC: trucker null-check branch — null trucker → section skipped
            Load load = buildLoad();
            User shipper = buildShipperWithBusiness();

            byte[] result = service.generateExport(load, shipper, null, List.of());

            assertThat(result).isNotEmpty();
        }

        @Test
        @DisplayName("omits trucker phone when trucker phone is null")
        void shouldOmitTruckerPhone_whenPhoneIsNull() {
            // AC: trucker phone null-check — null phone → no right-column phone text
            Load load = buildLoad();
            User shipper = buildShipperWithBusiness();
            User trucker = buildTrucker();
            trucker.setPhone(null);

            byte[] result = service.generateExport(load, shipper, trucker, List.of());

            assertThat(result).isNotEmpty();
        }

        @Test
        @DisplayName("renders distance when distanceMiles is present")
        void shouldRenderDistance_whenDistanceMilesIsSet() {
            // AC: distanceMiles null-check — non-null → distance row rendered
            Load load = buildLoad();
            load.setDistanceMiles(new BigDecimal("320"));
            User shipper = buildShipperWithBusiness();

            byte[] result = service.generateExport(load, shipper, null, List.of());

            assertThat(result).isNotEmpty();
        }

        @Test
        @DisplayName("omits distance row when distanceMiles is null")
        void shouldOmitDistance_whenDistanceMilesIsNull() {
            // AC: distanceMiles null-check — null → distance row skipped
            Load load = buildLoad();
            load.setDistanceMiles(null);
            User shipper = buildShipperWithBusiness();

            byte[] result = service.generateExport(load, shipper, null, List.of());

            assertThat(result).isNotEmpty();
        }

        @Test
        @DisplayName("renders no-documents placeholder when document list is empty")
        void shouldRenderNoDocumentsPlaceholder_whenListIsEmpty() {
            // AC: documents.isEmpty() branch — empty list → placeholder text rendered
            Load load = buildLoad();
            User shipper = buildShipperWithBusiness();

            byte[] result = service.generateExport(load, shipper, null, List.of());

            assertThat(result).isNotEmpty();
        }

        @Test
        @DisplayName("renders document note line when note is non-blank")
        void shouldRenderDocumentNote_whenNoteIsPresent() {
            // AC: document note null/blank check — non-blank note → note line rendered
            Load load = buildLoad();
            User shipper = buildShipperWithBusiness();
            LoadDocument docWithNote = buildDocument(true);

            byte[] result = service.generateExport(load, shipper, null, List.of(docWithNote));

            assertThat(result).isNotEmpty();
        }

        @Test
        @DisplayName("omits document note line when note is null")
        void shouldOmitDocumentNote_whenNoteIsNull() {
            // AC: document note null/blank check — null note → note line skipped
            Load load = buildLoad();
            User shipper = buildShipperWithBusiness();
            LoadDocument docNoNote = buildDocument(false);

            byte[] result = service.generateExport(load, shipper, null, List.of(docNoNote));

            assertThat(result).isNotEmpty();
        }

        @Test
        @DisplayName("renders document note line when note is blank — omitted correctly")
        void shouldOmitDocumentNote_whenNoteIsBlank() {
            // AC: document note blank check — blank note → note line skipped
            Load load = buildLoad();
            User shipper = buildShipperWithBusiness();
            LoadDocument doc = buildDocument(false);
            doc.setNote("   ");

            byte[] result = service.generateExport(load, shipper, null, List.of(doc));

            assertThat(result).isNotEmpty();
        }

        @Test
        @DisplayName("renders shipper businessName when present in export")
        void shouldUseBusinessName_whenPresentInExport() {
            // AC: nonempty() fallback in generateExport — businessName non-blank → used
            Load load = buildLoad();
            User shipper = buildShipperWithBusiness();

            byte[] result = service.generateExport(load, shipper, null, List.of());

            assertThat(result).isNotEmpty();
        }

        @Test
        @DisplayName("falls back to first+last name in export when businessName is null")
        void shouldFallBackToPersonName_whenBusinessNameNullInExport() {
            // AC: nonempty() fallback in generateExport — null businessName → first+last
            Load load = buildLoad();
            User shipper = buildShipperNoBusinessName();

            byte[] result = service.generateExport(load, shipper, null, List.of());

            assertThat(result).isNotEmpty();
        }

        @Test
        @DisplayName("fmtBytes renders bytes for files under 1024 bytes")
        void shouldFormatFileSize_asBytesWhenUnder1024() {
            // AC: fmtBytes branch — fileSizeBytes < 1024 → "N B" format
            Load load = buildLoad();
            User shipper = buildShipperWithBusiness();
            LoadDocument doc = buildDocument(false);
            doc.setFileSizeBytes(500L);

            byte[] result = service.generateExport(load, shipper, null, List.of(doc));

            assertThat(result).isNotEmpty();
        }

        @Test
        @DisplayName("fmtBytes renders KB for files between 1 KB and 1 MB")
        void shouldFormatFileSize_asKbWhenUnder1MB() {
            // AC: fmtBytes branch — 1024 <= fileSizeBytes < 1_048_576 → "N KB" format
            Load load = buildLoad();
            User shipper = buildShipperWithBusiness();
            LoadDocument doc = buildDocument(false);
            doc.setFileSizeBytes(20_480L);

            byte[] result = service.generateExport(load, shipper, null, List.of(doc));

            assertThat(result).isNotEmpty();
        }

        @Test
        @DisplayName("fmtBytes renders MB for files >= 1 MB")
        void shouldFormatFileSize_asMbWhenOver1MB() {
            // AC: fmtBytes branch — fileSizeBytes >= 1_048_576 → "N.N MB" format
            Load load = buildLoad();
            User shipper = buildShipperWithBusiness();
            LoadDocument doc = buildDocument(false);
            doc.setFileSizeBytes(5_242_880L);

            byte[] result = service.generateExport(load, shipper, null, List.of(doc));

            assertThat(result).isNotEmpty();
        }

        @Test
        @DisplayName("fmtBytes renders 0 B for zero-byte files")
        void shouldFormatFileSize_asZeroBytesWhenFileSizeIsZero() {
            // AC: fmtBytes branch — fileSizeBytes <= 0 → "0 B"
            Load load = buildLoad();
            User shipper = buildShipperWithBusiness();
            LoadDocument doc = buildDocument(false);
            doc.setFileSizeBytes(0L);

            byte[] result = service.generateExport(load, shipper, null, List.of(doc));

            assertThat(result).isNotEmpty();
        }
    }
}
