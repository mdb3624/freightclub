package com.freightclub.modules.carrier.domain;

import org.junit.jupiter.api.Test;
import java.time.LocalTime;

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
}
