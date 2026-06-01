package com.freightclub.modules.carrier.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.*;

class CarrierAvailabilityTest {

    @Test
    void createNew_validInput_success() {
        LocalTime startTime = LocalTime.of(6, 0);
        LocalTime endTime = LocalTime.of(22, 0);

        CarrierAvailability availability = CarrierAvailability.createNew(
            "tenant-1",
            "trucker-1",
            AvailableDays.MON_FRI,
            startTime,
            endTime,
            "EST",
            false
        );

        assertNotNull(availability.getId());
        assertEquals("tenant-1", availability.getTenantId());
        assertEquals("trucker-1", availability.getTruckerId());
        assertEquals(AvailableDays.MON_FRI, availability.getAvailableDays());
        assertEquals(startTime, availability.getAvailableStartTime());
        assertEquals(endTime, availability.getAvailableEndTime());
        assertEquals("EST", availability.getTimeZone());
        assertFalse(availability.isCurrentlyOnLoad());
    }

    @Test
    void createNew_invalidTimeWindow_throws() {
        LocalTime startTime = LocalTime.of(22, 0);
        LocalTime endTime = LocalTime.of(6, 0);

        assertThrows(IllegalArgumentException.class, () ->
            CarrierAvailability.createNew(
                "tenant-1",
                "trucker-1",
                AvailableDays.MON_FRI,
                startTime,
                endTime,
                "EST",
                false
            )
        );
    }

    @Test
    void createNew_nullStartTime_throws() {
        assertThrows(IllegalArgumentException.class, () ->
            CarrierAvailability.createNew(
                "tenant-1",
                "trucker-1",
                AvailableDays.MON_FRI,
                null,
                LocalTime.of(22, 0),
                "EST",
                false
            )
        );
    }

    @Test
    void createNew_nullTimeZone_throws() {
        assertThrows(IllegalArgumentException.class, () ->
            CarrierAvailability.createNew(
                "tenant-1",
                "trucker-1",
                AvailableDays.MON_FRI,
                LocalTime.of(6, 0),
                LocalTime.of(22, 0),
                null,
                false
            )
        );
    }

    @Test
    void updateAvailability_validInput_success() {
        CarrierAvailability availability = CarrierAvailability.createNew(
            "tenant-1",
            "trucker-1",
            AvailableDays.MON_FRI,
            LocalTime.of(6, 0),
            LocalTime.of(22, 0),
            "EST",
            false
        );

        availability.updateAvailability(
            AvailableDays.MON_SUN,
            LocalTime.of(8, 0),
            LocalTime.of(20, 0),
            "CST",
            true
        );

        assertEquals(AvailableDays.MON_SUN, availability.getAvailableDays());
        assertEquals(LocalTime.of(8, 0), availability.getAvailableStartTime());
        assertEquals(LocalTime.of(20, 0), availability.getAvailableEndTime());
        assertEquals("CST", availability.getTimeZone());
        assertTrue(availability.isCurrentlyOnLoad());
    }

    @Test
    void setCurrentlyOnLoad_true_success() {
        CarrierAvailability availability = CarrierAvailability.createNew(
            "tenant-1",
            "trucker-1",
            AvailableDays.MON_FRI,
            LocalTime.of(6, 0),
            LocalTime.of(22, 0),
            "EST",
            false
        );

        availability.setCurrentlyOnLoad(true);

        assertTrue(availability.isCurrentlyOnLoad());
        assertNotNull(availability.getLastUpdatedAt());
    }

    @Test
    @DisplayName("throws when endTime is null")
    void createNew_nullEndTime_throws() {
        assertThatThrownBy(() -> CarrierAvailability.createNew(
            "tenant-1", "trucker-1", AvailableDays.MON_FRI,
            LocalTime.of(6, 0), null, "EST", false))
            .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("throws when timeZone is blank")
    void createNew_blankTimeZone_throws() {
        assertThatThrownBy(() -> CarrierAvailability.createNew(
            "tenant-1", "trucker-1", AvailableDays.MON_FRI,
            LocalTime.of(6, 0), LocalTime.of(22, 0), "  ", false))
            .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("throws when availableDays is null")
    void createNew_nullAvailableDays_throws() {
        assertThatThrownBy(() -> CarrierAvailability.createNew(
            "tenant-1", "trucker-1", null,
            LocalTime.of(6, 0), LocalTime.of(22, 0), "EST", false))
            .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("throws when startTime equals endTime")
    void createNew_startEqualsEnd_throws() {
        LocalTime t = LocalTime.of(9, 0);
        assertThatThrownBy(() -> CarrierAvailability.createNew(
            "tenant-1", "trucker-1", AvailableDays.MON_FRI, t, t, "EST", false))
            .isInstanceOf(IllegalArgumentException.class);
    }

    @Nested
    @DisplayName("equals and hashCode")
    class EqualsAndHashCode {

        @Test
        @DisplayName("same instance equals itself")
        void sameInstance_equal() {
            CarrierAvailability a = CarrierAvailability.createNew(
                "t", "u", AvailableDays.MON_FRI, LocalTime.of(6, 0), LocalTime.of(22, 0), "EST", false);
            assertThat(a).isEqualTo(a);
        }

        @Test
        @DisplayName("same id equals")
        void sameId_equal() {
            OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
            CarrierAvailability a = new CarrierAvailability("id-1", "t", "u",
                AvailableDays.MON_FRI, LocalTime.of(6, 0), LocalTime.of(22, 0), "EST", false, now);
            CarrierAvailability b = new CarrierAvailability("id-1", "x", "y",
                AvailableDays.WEEKENDS, LocalTime.of(8, 0), LocalTime.of(20, 0), "UTC", true, now);
            assertThat(a).isEqualTo(b);
        }

        @Test
        @DisplayName("different ids not equal")
        void differentId_notEqual() {
            CarrierAvailability a = CarrierAvailability.createNew("t", "u", AvailableDays.MON_FRI, LocalTime.of(6, 0), LocalTime.of(22, 0), "EST", false);
            CarrierAvailability b = CarrierAvailability.createNew("t", "u", AvailableDays.MON_FRI, LocalTime.of(6, 0), LocalTime.of(22, 0), "EST", false);
            assertThat(a).isNotEqualTo(b);
        }

        @Test
        @DisplayName("not equal to null")
        void notEqualToNull() {
            CarrierAvailability a = CarrierAvailability.createNew("t", "u", AvailableDays.MON_FRI, LocalTime.of(6, 0), LocalTime.of(22, 0), "EST", false);
            assertThat(a).isNotEqualTo(null);
        }

        @Test
        @DisplayName("not equal to different type")
        void notEqualToDifferentType() {
            CarrierAvailability a = CarrierAvailability.createNew("t", "u", AvailableDays.MON_FRI, LocalTime.of(6, 0), LocalTime.of(22, 0), "EST", false);
            assertThat(a).isNotEqualTo("string");
        }

        @Test
        @DisplayName("hashCode is 0 when id is null")
        void nullId_hashCodeZero() {
            CarrierAvailability a = new CarrierAvailability(null, "t", "u",
                AvailableDays.MON_FRI, LocalTime.of(6, 0), LocalTime.of(22, 0), "EST", false,
                OffsetDateTime.now(ZoneOffset.UTC));
            assertThat(a.hashCode()).isEqualTo(0);
        }
    }
}
