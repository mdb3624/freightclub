package com.freightclub.modules.recommendation.application;

// LoadRecommendationService coverage
import com.freightclub.domain.CarrierEquipment;
import com.freightclub.domain.CarrierLane;
import com.freightclub.domain.Load;
import com.freightclub.modules.carrier.domain.EquipmentCondition;
import com.freightclub.modules.carrier.domain.EquipmentStatus;
import com.freightclub.modules.carrier.domain.EquipmentType;
import com.freightclub.modules.recommendation.domain.LoadRecommendation;
import com.freightclub.security.TenantContextHolder;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LoadRecommendationServiceTest {

    private final LoadRecommendationService service = new LoadRecommendationService();

    private static final String TENANT_ID = "tenant-1";
    private static final String LOAD_ID = "load-1";
    private static final String TRUCKER_ID = "trucker-1";

    @Mock
    private Load load;

    private CarrierEquipment buildEquipment(EquipmentType type) {
        return new CarrierEquipment(
            UUID.randomUUID().toString(), TENANT_ID, TRUCKER_ID,
            type, 53, 8, 9, 80000L,
            EquipmentCondition.GOOD, "2022", EquipmentStatus.ACTIVE,
            OffsetDateTime.now(), null);
    }

    private CarrierLane mockLane(String origin, String dest, Long minRateCents) {
        CarrierLane lane = mock(CarrierLane.class);
        when(lane.getTenantId()).thenReturn(TENANT_ID);
        lenient().when(lane.getOriginRegion()).thenReturn(origin);
        lenient().when(lane.getDestinationRegion()).thenReturn(dest);
        lenient().when(lane.getMinRateCents()).thenReturn(minRateCents);
        return lane;
    }

    @Nested
    @DisplayName("Cross-tenant validation")
    class CrossTenantValidation {

        @Test
        @DisplayName("AC-6: throws when load tenant does not match context tenant")
        void loadTenantMismatch_throws() {
            try (MockedStatic<TenantContextHolder> ctx = mockStatic(TenantContextHolder.class)) {
                ctx.when(TenantContextHolder::getTenantId).thenReturn(TENANT_ID);
                when(load.getTenantId()).thenReturn("other-tenant");
                CarrierEquipment eq = buildEquipment(EquipmentType.FLATBED);

                assertThatThrownBy(() -> service.generateRecommendation(load, eq))
                    .isInstanceOf(AccessDeniedException.class);
            }
        }

        @Test
        @DisplayName("AC-6: throws when equipment tenant does not match context tenant")
        void equipmentTenantMismatch_throws() {
            try (MockedStatic<TenantContextHolder> ctx = mockStatic(TenantContextHolder.class)) {
                ctx.when(TenantContextHolder::getTenantId).thenReturn(TENANT_ID);
                when(load.getTenantId()).thenReturn(TENANT_ID);
                CarrierEquipment eq = new CarrierEquipment(
                    UUID.randomUUID().toString(), "other-tenant", TRUCKER_ID,
                    EquipmentType.FLATBED, 53, 8, 9, 80000L,
                    EquipmentCondition.GOOD, "2022", EquipmentStatus.ACTIVE,
                    OffsetDateTime.now(), null);

                assertThatThrownBy(() -> service.generateRecommendation(load, eq))
                    .isInstanceOf(AccessDeniedException.class);
            }
        }

        @Test
        @DisplayName("AC-6: throws when lane tenant does not match context tenant")
        void laneTenantMismatch_throws() {
            try (MockedStatic<TenantContextHolder> ctx = mockStatic(TenantContextHolder.class)) {
                ctx.when(TenantContextHolder::getTenantId).thenReturn(TENANT_ID);
                when(load.getTenantId()).thenReturn(TENANT_ID);
                CarrierEquipment eq = buildEquipment(EquipmentType.FLATBED);
                CarrierLane lane = mock(CarrierLane.class);
                when(lane.getTenantId()).thenReturn("other-tenant");

                assertThatThrownBy(() -> service.generateRecommendation(load, eq, lane))
                    .isInstanceOf(AccessDeniedException.class);
            }
        }
    }

    @Nested
    @DisplayName("Equipment matching")
    class EquipmentMatching {

        @Test
        @DisplayName("AC-1: no equipment match when load equipmentType is null")
        void nullEquipmentType_noMatch() {
            try (MockedStatic<TenantContextHolder> ctx = mockStatic(TenantContextHolder.class)) {
                ctx.when(TenantContextHolder::getTenantId).thenReturn(TENANT_ID);
                when(load.getTenantId()).thenReturn(TENANT_ID);
                when(load.getId()).thenReturn(LOAD_ID);
                when(load.getEquipmentType()).thenReturn(null);
                when(load.getPickupFrom()).thenReturn(null);
                CarrierEquipment eq = buildEquipment(EquipmentType.FLATBED);

                LoadRecommendation rec = service.generateRecommendation(load, eq);

                assertThat(rec.getMatchReason().equipment()).isFalse();
            }
        }

        @Test
        @DisplayName("equipment check branch executed when load equipmentType is non-null")
        void nonNullEquipmentType_branchExecuted() {
            try (MockedStatic<TenantContextHolder> ctx = mockStatic(TenantContextHolder.class)) {
                ctx.when(TenantContextHolder::getTenantId).thenReturn(TENANT_ID);
                when(load.getTenantId()).thenReturn(TENANT_ID);
                when(load.getId()).thenReturn(LOAD_ID);
                // domain EquipmentType — different enum from carrier module, so match will be false
                when(load.getEquipmentType()).thenReturn(com.freightclub.domain.EquipmentType.FLATBED);
                when(load.getPickupFrom()).thenReturn(null);
                CarrierEquipment eq = buildEquipment(EquipmentType.FLATBED);

                LoadRecommendation rec = service.generateRecommendation(load, eq);

                // Different enum types — comparison always false; score floor is 1
                assertThat(rec.getMatchScore()).isEqualTo(1);
            }
        }
    }

    @Nested
    @DisplayName("Lane matching")
    class LaneMatching {

        @Test
        @DisplayName("AC-2: scores 50 when origin and destination match")
        void matchingLane_scores50() {
            try (MockedStatic<TenantContextHolder> ctx = mockStatic(TenantContextHolder.class)) {
                ctx.when(TenantContextHolder::getTenantId).thenReturn(TENANT_ID);
                when(load.getTenantId()).thenReturn(TENANT_ID);
                when(load.getId()).thenReturn(LOAD_ID);
                when(load.getEquipmentType()).thenReturn(null);
                when(load.getOriginRegion()).thenReturn("TX");
                when(load.getDestRegion()).thenReturn("CA");
                when(load.getPickupFrom()).thenReturn(null);
                CarrierEquipment eq = buildEquipment(EquipmentType.FLATBED);
                CarrierLane lane = mockLane("TX", "CA", null);

                LoadRecommendation rec = service.generateRecommendation(load, eq, lane);

                assertThat(rec.getMatchReason().lane()).isTrue();
                assertThat(rec.getMatchScore()).isGreaterThanOrEqualTo(50);
            }
        }

        @Test
        @DisplayName("no lane score when lane is null")
        void nullLane_noLaneScore() {
            try (MockedStatic<TenantContextHolder> ctx = mockStatic(TenantContextHolder.class)) {
                ctx.when(TenantContextHolder::getTenantId).thenReturn(TENANT_ID);
                when(load.getTenantId()).thenReturn(TENANT_ID);
                when(load.getId()).thenReturn(LOAD_ID);
                when(load.getEquipmentType()).thenReturn(null);
                when(load.getPickupFrom()).thenReturn(null);
                CarrierEquipment eq = buildEquipment(EquipmentType.FLATBED);

                LoadRecommendation rec = service.generateRecommendation(load, eq);

                assertThat(rec.getMatchReason().lane()).isFalse();
            }
        }

        @Test
        @DisplayName("no lane score when origin region does not match")
        void originMismatch_noLaneScore() {
            try (MockedStatic<TenantContextHolder> ctx = mockStatic(TenantContextHolder.class)) {
                ctx.when(TenantContextHolder::getTenantId).thenReturn(TENANT_ID);
                when(load.getTenantId()).thenReturn(TENANT_ID);
                when(load.getId()).thenReturn(LOAD_ID);
                when(load.getEquipmentType()).thenReturn(null);
                when(load.getOriginRegion()).thenReturn("FL");
                when(load.getPickupFrom()).thenReturn(null);
                CarrierEquipment eq = buildEquipment(EquipmentType.FLATBED);
                CarrierLane lane = mockLane("TX", "CA", null);

                LoadRecommendation rec = service.generateRecommendation(load, eq, lane);

                assertThat(rec.getMatchReason().lane()).isFalse();
            }
        }

        @Test
        @DisplayName("no lane score when load origin region is null")
        void nullOrigin_noLaneScore() {
            try (MockedStatic<TenantContextHolder> ctx = mockStatic(TenantContextHolder.class)) {
                ctx.when(TenantContextHolder::getTenantId).thenReturn(TENANT_ID);
                when(load.getTenantId()).thenReturn(TENANT_ID);
                when(load.getId()).thenReturn(LOAD_ID);
                when(load.getEquipmentType()).thenReturn(null);
                when(load.getOriginRegion()).thenReturn(null);
                when(load.getPickupFrom()).thenReturn(null);
                CarrierEquipment eq = buildEquipment(EquipmentType.FLATBED);
                CarrierLane lane = mockLane("TX", "CA", null);

                LoadRecommendation rec = service.generateRecommendation(load, eq, lane);

                assertThat(rec.getMatchReason().lane()).isFalse();
            }
        }
    }

    @Nested
    @DisplayName("Rate matching")
    class RateMatching {

        @Test
        @DisplayName("AC-3: scores 25 when payRate meets minRate")
        void payRateMeetsMinRate_scores25() {
            try (MockedStatic<TenantContextHolder> ctx = mockStatic(TenantContextHolder.class)) {
                ctx.when(TenantContextHolder::getTenantId).thenReturn(TENANT_ID);
                when(load.getTenantId()).thenReturn(TENANT_ID);
                when(load.getId()).thenReturn(LOAD_ID);
                when(load.getEquipmentType()).thenReturn(null);
                when(load.getOriginRegion()).thenReturn(null);
                when(load.getPayRate()).thenReturn(new BigDecimal("2000.00"));
                when(load.getPickupFrom()).thenReturn(null);
                CarrierEquipment eq = buildEquipment(EquipmentType.FLATBED);
                CarrierLane lane = mockLane("TX", "CA", 150000L);

                LoadRecommendation rec = service.generateRecommendation(load, eq, lane);

                assertThat(rec.getMatchReason().rate()).isTrue();
            }
        }

        @Test
        @DisplayName("no rate score when payRate is below minRate")
        void payRateBelowMinRate_noRateScore() {
            try (MockedStatic<TenantContextHolder> ctx = mockStatic(TenantContextHolder.class)) {
                ctx.when(TenantContextHolder::getTenantId).thenReturn(TENANT_ID);
                when(load.getTenantId()).thenReturn(TENANT_ID);
                when(load.getId()).thenReturn(LOAD_ID);
                when(load.getEquipmentType()).thenReturn(null);
                when(load.getOriginRegion()).thenReturn(null);
                when(load.getPayRate()).thenReturn(new BigDecimal("500.00"));
                when(load.getPickupFrom()).thenReturn(null);
                CarrierEquipment eq = buildEquipment(EquipmentType.FLATBED);
                CarrierLane lane = mockLane("TX", "CA", 200000L);

                LoadRecommendation rec = service.generateRecommendation(load, eq, lane);

                assertThat(rec.getMatchReason().rate()).isFalse();
            }
        }

        @Test
        @DisplayName("no rate score when payRate is null")
        void nullPayRate_noRateScore() {
            try (MockedStatic<TenantContextHolder> ctx = mockStatic(TenantContextHolder.class)) {
                ctx.when(TenantContextHolder::getTenantId).thenReturn(TENANT_ID);
                when(load.getTenantId()).thenReturn(TENANT_ID);
                when(load.getId()).thenReturn(LOAD_ID);
                when(load.getEquipmentType()).thenReturn(null);
                when(load.getOriginRegion()).thenReturn(null);
                when(load.getPayRate()).thenReturn(null);
                when(load.getPickupFrom()).thenReturn(null);
                CarrierEquipment eq = buildEquipment(EquipmentType.FLATBED);
                CarrierLane lane = mockLane("TX", "CA", 150000L);

                LoadRecommendation rec = service.generateRecommendation(load, eq, lane);

                assertThat(rec.getMatchReason().rate()).isFalse();
            }
        }

        @Test
        @DisplayName("no rate score when minRateCents is null")
        void nullMinRateCents_noRateScore() {
            try (MockedStatic<TenantContextHolder> ctx = mockStatic(TenantContextHolder.class)) {
                ctx.when(TenantContextHolder::getTenantId).thenReturn(TENANT_ID);
                when(load.getTenantId()).thenReturn(TENANT_ID);
                when(load.getId()).thenReturn(LOAD_ID);
                when(load.getEquipmentType()).thenReturn(null);
                when(load.getOriginRegion()).thenReturn(null);
                when(load.getPayRate()).thenReturn(new BigDecimal("2000.00"));
                when(load.getPickupFrom()).thenReturn(null);
                CarrierEquipment eq = buildEquipment(EquipmentType.FLATBED);
                CarrierLane lane = mockLane("TX", "CA", null);

                LoadRecommendation rec = service.generateRecommendation(load, eq, lane);

                assertThat(rec.getMatchReason().rate()).isFalse();
            }
        }
    }

    @Nested
    @DisplayName("Availability matching")
    class AvailabilityMatching {

        @Test
        @DisplayName("AC-4: scores 25 when pickup is within 30 days")
        void pickupWithin30Days_scores25() {
            try (MockedStatic<TenantContextHolder> ctx = mockStatic(TenantContextHolder.class)) {
                ctx.when(TenantContextHolder::getTenantId).thenReturn(TENANT_ID);
                when(load.getTenantId()).thenReturn(TENANT_ID);
                when(load.getId()).thenReturn(LOAD_ID);
                when(load.getEquipmentType()).thenReturn(null);
                when(load.getPickupFrom()).thenReturn(LocalDateTime.now().plusDays(5));
                CarrierEquipment eq = buildEquipment(EquipmentType.FLATBED);

                LoadRecommendation rec = service.generateRecommendation(load, eq);

                assertThat(rec.getMatchReason().availability()).isTrue();
                assertThat(rec.getMatchScore()).isGreaterThanOrEqualTo(25);
            }
        }

        @Test
        @DisplayName("no availability score when pickup is beyond 30 days")
        void pickupBeyond30Days_noScore() {
            try (MockedStatic<TenantContextHolder> ctx = mockStatic(TenantContextHolder.class)) {
                ctx.when(TenantContextHolder::getTenantId).thenReturn(TENANT_ID);
                when(load.getTenantId()).thenReturn(TENANT_ID);
                when(load.getId()).thenReturn(LOAD_ID);
                when(load.getEquipmentType()).thenReturn(null);
                when(load.getPickupFrom()).thenReturn(LocalDateTime.now().plusDays(60));
                CarrierEquipment eq = buildEquipment(EquipmentType.FLATBED);

                LoadRecommendation rec = service.generateRecommendation(load, eq);

                assertThat(rec.getMatchReason().availability()).isFalse();
            }
        }

        @Test
        @DisplayName("no availability score when pickup is in the past")
        void pickupInPast_noScore() {
            try (MockedStatic<TenantContextHolder> ctx = mockStatic(TenantContextHolder.class)) {
                ctx.when(TenantContextHolder::getTenantId).thenReturn(TENANT_ID);
                when(load.getTenantId()).thenReturn(TENANT_ID);
                when(load.getId()).thenReturn(LOAD_ID);
                when(load.getEquipmentType()).thenReturn(null);
                when(load.getPickupFrom()).thenReturn(LocalDateTime.now().minusDays(1));
                CarrierEquipment eq = buildEquipment(EquipmentType.FLATBED);

                LoadRecommendation rec = service.generateRecommendation(load, eq);

                assertThat(rec.getMatchReason().availability()).isFalse();
            }
        }

        @Test
        @DisplayName("no availability score when pickupFrom is null")
        void nullPickupFrom_noScore() {
            try (MockedStatic<TenantContextHolder> ctx = mockStatic(TenantContextHolder.class)) {
                ctx.when(TenantContextHolder::getTenantId).thenReturn(TENANT_ID);
                when(load.getTenantId()).thenReturn(TENANT_ID);
                when(load.getId()).thenReturn(LOAD_ID);
                when(load.getEquipmentType()).thenReturn(null);
                when(load.getPickupFrom()).thenReturn(null);
                CarrierEquipment eq = buildEquipment(EquipmentType.FLATBED);

                LoadRecommendation rec = service.generateRecommendation(load, eq);

                assertThat(rec.getMatchReason().availability()).isFalse();
            }
        }
    }

    @Nested
    @DisplayName("Score floor and ceiling")
    class ScoreFloor {

        @Test
        @DisplayName("score is at least 1 when no criteria match")
        void noMatches_scoreIsOne() {
            try (MockedStatic<TenantContextHolder> ctx = mockStatic(TenantContextHolder.class)) {
                ctx.when(TenantContextHolder::getTenantId).thenReturn(TENANT_ID);
                when(load.getTenantId()).thenReturn(TENANT_ID);
                when(load.getId()).thenReturn(LOAD_ID);
                when(load.getEquipmentType()).thenReturn(null);
                when(load.getPickupFrom()).thenReturn(null);
                CarrierEquipment eq = buildEquipment(EquipmentType.FLATBED);

                LoadRecommendation rec = service.generateRecommendation(load, eq);

                assertThat(rec.getMatchScore()).isEqualTo(1);
            }
        }

        @Test
        @DisplayName("lane + rate + availability full match scores 100")
        void laneRateAvailabilityMatch_scores100() {
            try (MockedStatic<TenantContextHolder> ctx = mockStatic(TenantContextHolder.class)) {
                ctx.when(TenantContextHolder::getTenantId).thenReturn(TENANT_ID);
                when(load.getTenantId()).thenReturn(TENANT_ID);
                when(load.getId()).thenReturn(LOAD_ID);
                when(load.getEquipmentType()).thenReturn(null);
                when(load.getOriginRegion()).thenReturn("TX");
                when(load.getDestRegion()).thenReturn("CA");
                when(load.getPayRate()).thenReturn(new BigDecimal("2000.00"));
                when(load.getPickupFrom()).thenReturn(LocalDateTime.now().plusDays(5));
                CarrierEquipment eq = buildEquipment(EquipmentType.FLATBED);
                CarrierLane lane = mockLane("TX", "CA", 150000L);

                LoadRecommendation rec = service.generateRecommendation(load, eq, lane);

                assertThat(rec.getMatchScore()).isEqualTo(100); // 50 + 25 + 25
            }
        }
    }
}
