package com.freightclub.modules.carrier.domain;

import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for CarrierLane domain class.
 * Covers createNew validation, updateLane, softDelete, and equals/hashCode branches.
 */
class CarrierLaneTest {

    // ── helpers ───────────────────────────────────────────────────────────────

    private CarrierLane validLane() {
        return CarrierLane.createNew(
            "tenant-1",
            "trucker-1",
            "Chicago, IL",
            "Dallas, TX",
            150000L,
            FrequencyPreference.WEEKLY
        );
    }

    private CarrierLane deletedLane() {
        CarrierLane lane = validLane();
        lane.softDelete();
        return lane;
    }

    // ── createNew ─────────────────────────────────────────────────────────────

    @Nested
    class CreateNew {

        @Test
        void happyPath_returnsLaneWithExpectedFields() {
            CarrierLane lane = CarrierLane.createNew(
                "tenant-abc",
                "trucker-xyz",
                "Miami, FL",
                "Atlanta, GA",
                200000L,
                FrequencyPreference.DAILY
            );

            assertNotNull(lane.getId());
            assertEquals("tenant-abc", lane.getTenantId());
            assertEquals("trucker-xyz", lane.getTruckerId());
            assertEquals("Miami, FL", lane.getOriginRegion());
            assertEquals("Atlanta, GA", lane.getDestinationRegion());
            assertEquals(200000L, lane.getMinRateCents());
            assertEquals(FrequencyPreference.DAILY, lane.getFrequencyPreference());
            assertEquals(LaneStatus.ACTIVE, lane.getStatus());
            assertNotNull(lane.getCreatedAt());
            assertNull(lane.getDeletedAt());
        }

        @Test
        void eachCallProducesUniqueId() {
            CarrierLane a = validLane();
            CarrierLane b = validLane();
            assertNotEquals(a.getId(), b.getId());
        }

        @Test
        void nullOrigin_throws() {
            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                CarrierLane.createNew("t1", "tr1", null, "Dallas, TX", 100000L, FrequencyPreference.ANY)
            );
            assertEquals("Origin region is required", ex.getMessage());
        }

        @Test
        void blankOrigin_throws() {
            assertThrows(IllegalArgumentException.class, () ->
                CarrierLane.createNew("t1", "tr1", "   ", "Dallas, TX", 100000L, FrequencyPreference.ANY)
            );
        }

        @Test
        void emptyOrigin_throws() {
            assertThrows(IllegalArgumentException.class, () ->
                CarrierLane.createNew("t1", "tr1", "", "Dallas, TX", 100000L, FrequencyPreference.ANY)
            );
        }

        @Test
        void nullDestination_throws() {
            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                CarrierLane.createNew("t1", "tr1", "Chicago, IL", null, 100000L, FrequencyPreference.ANY)
            );
            assertEquals("Destination region is required", ex.getMessage());
        }

        @Test
        void blankDestination_throws() {
            assertThrows(IllegalArgumentException.class, () ->
                CarrierLane.createNew("t1", "tr1", "Chicago, IL", "  ", 100000L, FrequencyPreference.ANY)
            );
        }

        @Test
        void negativeRate_throws() {
            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                CarrierLane.createNew("t1", "tr1", "Chicago, IL", "Dallas, TX", -1L, FrequencyPreference.ANY)
            );
            assertEquals("Min rate must be positive", ex.getMessage());
        }

        @Test
        void zeroRate_throws() {
            assertThrows(IllegalArgumentException.class, () ->
                CarrierLane.createNew("t1", "tr1", "Chicago, IL", "Dallas, TX", 0L, FrequencyPreference.ANY)
            );
        }

        @Test
        void nullRate_isAllowed() {
            CarrierLane lane = CarrierLane.createNew(
                "t1", "tr1", "Chicago, IL", "Dallas, TX", null, FrequencyPreference.ANY
            );
            assertNull(lane.getMinRateCents());
        }

        @Test
        void nullFrequencyPreference_throws() {
            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                CarrierLane.createNew("t1", "tr1", "Chicago, IL", "Dallas, TX", 100000L, null)
            );
            assertEquals("Frequency preference is required", ex.getMessage());
        }
    }

    // ── updateLane ────────────────────────────────────────────────────────────

    @Nested
    class UpdateLane {

        @Test
        void happyPath_updatesAllFields() {
            CarrierLane lane = validLane();
            lane.updateLane("Phoenix, AZ", "Seattle, WA", 250000L, FrequencyPreference.MONTHLY);
            assertEquals("Phoenix, AZ", lane.getOriginRegion());
            assertEquals("Seattle, WA", lane.getDestinationRegion());
            assertEquals(250000L, lane.getMinRateCents());
            assertEquals(FrequencyPreference.MONTHLY, lane.getFrequencyPreference());
        }

        @Test
        void onDeletedLane_throws() {
            CarrierLane lane = deletedLane();
            IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                lane.updateLane("Phoenix, AZ", "Seattle, WA", 250000L, FrequencyPreference.MONTHLY)
            );
            assertEquals("Cannot update deleted lane", ex.getMessage());
        }

        @Test
        void blankOrigin_throws() {
            CarrierLane lane = validLane();
            assertThrows(IllegalArgumentException.class, () ->
                lane.updateLane("  ", "Seattle, WA", 250000L, FrequencyPreference.ANY)
            );
        }

        @Test
        void nullOrigin_throws() {
            CarrierLane lane = validLane();
            assertThrows(IllegalArgumentException.class, () ->
                lane.updateLane(null, "Seattle, WA", 250000L, FrequencyPreference.ANY)
            );
        }

        @Test
        void blankDestination_throws() {
            CarrierLane lane = validLane();
            assertThrows(IllegalArgumentException.class, () ->
                lane.updateLane("Chicago, IL", "", 250000L, FrequencyPreference.ANY)
            );
        }

        @Test
        void negativeRate_throws() {
            CarrierLane lane = validLane();
            assertThrows(IllegalArgumentException.class, () ->
                lane.updateLane("Chicago, IL", "Dallas, TX", -500L, FrequencyPreference.ANY)
            );
        }

        @Test
        void nullRate_isAllowed() {
            CarrierLane lane = validLane();
            lane.updateLane("Chicago, IL", "Dallas, TX", null, FrequencyPreference.ANY);
            assertNull(lane.getMinRateCents());
        }
    }

    // ── softDelete ────────────────────────────────────────────────────────────

    @Nested
    class SoftDelete {

        @Test
        void setsDeletedAt() {
            CarrierLane lane = validLane();
            assertNull(lane.getDeletedAt());
            lane.softDelete();
            assertNotNull(lane.getDeletedAt());
        }

        @Test
        void deletedAtIsInUTC() {
            CarrierLane lane = validLane();
            lane.softDelete();
            assertEquals(ZoneOffset.UTC, lane.getDeletedAt().getOffset());
        }

        @Test
        void callingTwiceDoesNotThrow() {
            CarrierLane lane = validLane();
            lane.softDelete();
            assertDoesNotThrow(lane::softDelete);
            assertNotNull(lane.getDeletedAt());
        }
    }

    // ── equals / hashCode ─────────────────────────────────────────────────────

    @Nested
    class EqualsAndHashCode {

        @Test
        void sameInstance_isEqual() {
            CarrierLane lane = validLane();
            assertEquals(lane, lane);
        }

        @Test
        void differentInstances_sameId_areEqual() {
            String sharedId = "same-id";
            CarrierLane a = new CarrierLane(sharedId, "t1", "tr1", "Chicago, IL", "Dallas, TX",
                100000L, FrequencyPreference.DAILY, LaneStatus.ACTIVE,
                OffsetDateTime.now(ZoneOffset.UTC), null);
            CarrierLane b = new CarrierLane(sharedId, "t2", "tr2", "Miami, FL", "Atlanta, GA",
                200000L, FrequencyPreference.WEEKLY, LaneStatus.ACTIVE,
                OffsetDateTime.now(ZoneOffset.UTC), null);
            assertEquals(a, b);
            assertEquals(a.hashCode(), b.hashCode());
        }

        @Test
        void differentIds_areNotEqual() {
            CarrierLane a = validLane();
            CarrierLane b = validLane();
            assertNotEquals(a, b);
        }

        @Test
        void nullId_notEqualToAnyOther() {
            CarrierLane nullId = new CarrierLane(null, "t1", "tr1", "Chicago, IL", "Dallas, TX",
                100000L, FrequencyPreference.DAILY, LaneStatus.ACTIVE,
                OffsetDateTime.now(ZoneOffset.UTC), null);
            assertNotEquals(nullId, validLane());
        }

        @Test
        void nullId_hashCodeIsZero() {
            CarrierLane nullId = new CarrierLane(null, "t1", "tr1", "Chicago, IL", "Dallas, TX",
                100000L, FrequencyPreference.DAILY, LaneStatus.ACTIVE,
                OffsetDateTime.now(ZoneOffset.UTC), null);
            assertEquals(0, nullId.hashCode());
        }

        @Test
        void notEqualToNull() {
            assertNotEquals(null, validLane());
        }

        @Test
        void notEqualToDifferentType() {
            assertNotEquals(validLane(), "some-string");
        }
    }
}
