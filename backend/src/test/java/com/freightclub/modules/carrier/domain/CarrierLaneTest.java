package com.freightclub.modules.carrier.domain;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CarrierLaneTest {

    @Test
    void createNew_validInput_success() {
        CarrierLane lane = CarrierLane.createNew(
            "tenant-1",
            "trucker-1",
            "Southeast",
            "California",
            175L,
            FrequencyPreference.WEEKLY
        );

        assertNotNull(lane.getId());
        assertEquals("tenant-1", lane.getTenantId());
        assertEquals("trucker-1", lane.getTruckerId());
        assertEquals("Southeast", lane.getOriginRegion());
        assertEquals("California", lane.getDestinationRegion());
        assertEquals(175L, lane.getMinRateCents());
        assertEquals(FrequencyPreference.WEEKLY, lane.getFrequencyPreference());
        assertEquals(LaneStatus.ACTIVE, lane.getStatus());
        assertNull(lane.getDeletedAt());
    }

    @Test
    void createNew_nullOriginRegion_throws() {
        assertThrows(IllegalArgumentException.class, () ->
            CarrierLane.createNew(
                "tenant-1",
                "trucker-1",
                null,
                "California",
                175L,
                FrequencyPreference.WEEKLY
            )
        );
    }

    @Test
    void createNew_emptyOriginRegion_throws() {
        assertThrows(IllegalArgumentException.class, () ->
            CarrierLane.createNew(
                "tenant-1",
                "trucker-1",
                "  ",
                "California",
                175L,
                FrequencyPreference.WEEKLY
            )
        );
    }

    @Test
    void createNew_negativeRate_throws() {
        assertThrows(IllegalArgumentException.class, () ->
            CarrierLane.createNew(
                "tenant-1",
                "trucker-1",
                "Southeast",
                "California",
                -100L,
                FrequencyPreference.WEEKLY
            )
        );
    }

    @Test
    void createNew_nullFrequency_throws() {
        assertThrows(IllegalArgumentException.class, () ->
            CarrierLane.createNew(
                "tenant-1",
                "trucker-1",
                "Southeast",
                "California",
                175L,
                null
            )
        );
    }

    @Test
    void updateLane_validInput_success() {
        CarrierLane lane = CarrierLane.createNew(
            "tenant-1",
            "trucker-1",
            "Southeast",
            "California",
            175L,
            FrequencyPreference.WEEKLY
        );

        lane.updateLane("Texas", "Northeast", 200L, FrequencyPreference.DAILY);

        assertEquals("Texas", lane.getOriginRegion());
        assertEquals("Northeast", lane.getDestinationRegion());
        assertEquals(200L, lane.getMinRateCents());
        assertEquals(FrequencyPreference.DAILY, lane.getFrequencyPreference());
    }

    @Test
    void updateLane_deletedLane_throws() {
        CarrierLane lane = CarrierLane.createNew(
            "tenant-1",
            "trucker-1",
            "Southeast",
            "California",
            175L,
            FrequencyPreference.WEEKLY
        );
        lane.softDelete();

        assertThrows(IllegalStateException.class, () ->
            lane.updateLane("Texas", "Northeast", 200L, FrequencyPreference.DAILY)
        );
    }

    @Test
    void softDelete_success() {
        CarrierLane lane = CarrierLane.createNew(
            "tenant-1",
            "trucker-1",
            "Southeast",
            "California",
            175L,
            FrequencyPreference.WEEKLY
        );

        lane.softDelete();

        assertNotNull(lane.getDeletedAt());
    }
}
