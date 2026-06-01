package com.freightclub.domain;

// com.freightclub.domain.CarrierLane coverage
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CarrierLaneTest {

    private static final String TENANT_ID = "tenant-1";
    private static final String TRUCKER_ID = "trucker-1";

    @Nested
    @DisplayName("createNew validation")
    class CreateNew {

        @Test
        @DisplayName("creates lane with all valid fields")
        void validFields_createsLane() {
            CarrierLane lane = CarrierLane.createNew(TENANT_ID, TRUCKER_ID, "TX", "CA", 150000L, "WEEKLY");

            assertThat(lane.getId()).isNotNull();
            assertThat(lane.getOriginRegion()).isEqualTo("TX");
            assertThat(lane.getDestinationRegion()).isEqualTo("CA");
            assertThat(lane.getMinRateCents()).isEqualTo(150000L);
            assertThat(lane.getFrequencyPreference()).isEqualTo("WEEKLY");
            assertThat(lane.getDeletedAt()).isNull();
        }

        @Test
        @DisplayName("throws when originRegion is null")
        void nullOrigin_throws() {
            assertThatThrownBy(() -> CarrierLane.createNew(TENANT_ID, TRUCKER_ID, null, "CA", null, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Origin region");
        }

        @Test
        @DisplayName("throws when originRegion is blank")
        void blankOrigin_throws() {
            assertThatThrownBy(() -> CarrierLane.createNew(TENANT_ID, TRUCKER_ID, "  ", "CA", null, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Origin region");
        }

        @Test
        @DisplayName("throws when destinationRegion is null")
        void nullDestination_throws() {
            assertThatThrownBy(() -> CarrierLane.createNew(TENANT_ID, TRUCKER_ID, "TX", null, null, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Destination region");
        }

        @Test
        @DisplayName("throws when destinationRegion is blank")
        void blankDestination_throws() {
            assertThatThrownBy(() -> CarrierLane.createNew(TENANT_ID, TRUCKER_ID, "TX", "  ", null, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Destination region");
        }

        @Test
        @DisplayName("defaults frequencyPreference to ANY when null")
        void nullFrequency_defaultsToAny() {
            CarrierLane lane = CarrierLane.createNew(TENANT_ID, TRUCKER_ID, "TX", "CA", null, null);

            assertThat(lane.getFrequencyPreference()).isEqualTo("ANY");
        }

        @Test
        @DisplayName("accepts null minRateCents")
        void nullMinRate_accepted() {
            CarrierLane lane = CarrierLane.createNew(TENANT_ID, TRUCKER_ID, "TX", "CA", null, "DAILY");

            assertThat(lane.getMinRateCents()).isNull();
        }
    }

    @Nested
    @DisplayName("Builder")
    class BuilderTest {

        @Test
        @DisplayName("builds lane with explicit id")
        void explicitId_used() {
            CarrierLane lane = CarrierLane.builder()
                .id("lane-123")
                .tenantId(TENANT_ID)
                .truckerId(TRUCKER_ID)
                .originRegion("TX")
                .destinationRegion("CA")
                .build();

            assertThat(lane.getId()).isEqualTo("lane-123");
        }

        @Test
        @DisplayName("builder generates id when not set")
        void noId_generatesId() {
            CarrierLane lane = CarrierLane.builder()
                .tenantId(TENANT_ID)
                .originRegion("TX")
                .destinationRegion("CA")
                .build();

            assertThat(lane.getId()).isNotNull();
        }

        @Test
        @DisplayName("builder defaults frequencyPreference to ANY when null")
        void nullFrequency_defaultsToAny() {
            CarrierLane lane = CarrierLane.builder()
                .tenantId(TENANT_ID)
                .originRegion("TX")
                .destinationRegion("CA")
                .build();

            assertThat(lane.getFrequencyPreference()).isEqualTo("ANY");
        }
    }

    @Nested
    @DisplayName("softDelete")
    class SoftDelete {

        @Test
        @DisplayName("sets deletedAt timestamp")
        void softDelete_setsDeletedAt() {
            CarrierLane lane = CarrierLane.createNew(TENANT_ID, TRUCKER_ID, "TX", "CA", null, "WEEKLY");
            assertThat(lane.getDeletedAt()).isNull();

            lane.softDelete();

            assertThat(lane.getDeletedAt()).isNotNull();
            assertThat(lane.getDeletedAt().getOffset()).isEqualTo(ZoneOffset.UTC);
        }
    }

    @Nested
    @DisplayName("equals and hashCode")
    class EqualsAndHashCode {

        @Test
        @DisplayName("same instance is equal to itself")
        void sameInstance_equal() {
            CarrierLane lane = CarrierLane.createNew(TENANT_ID, TRUCKER_ID, "TX", "CA", null, "ANY");
            assertThat(lane).isEqualTo(lane);
        }

        @Test
        @DisplayName("lanes with same id are equal")
        void sameId_equal() {
            OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
            CarrierLane a = new CarrierLane("id-1", TENANT_ID, TRUCKER_ID, "TX", "CA", null, "ANY", now, null);
            CarrierLane b = new CarrierLane("id-1", TENANT_ID, TRUCKER_ID, "FL", "NY", null, "WEEKLY", now, null);
            assertThat(a).isEqualTo(b);
        }

        @Test
        @DisplayName("lanes with different ids are not equal")
        void differentId_notEqual() {
            CarrierLane a = CarrierLane.createNew(TENANT_ID, TRUCKER_ID, "TX", "CA", null, "ANY");
            CarrierLane b = CarrierLane.createNew(TENANT_ID, TRUCKER_ID, "TX", "CA", null, "ANY");
            assertThat(a).isNotEqualTo(b);
        }

        @Test
        @DisplayName("not equal to null")
        void notEqualToNull() {
            CarrierLane lane = CarrierLane.createNew(TENANT_ID, TRUCKER_ID, "TX", "CA", null, "ANY");
            assertThat(lane).isNotEqualTo(null);
        }

        @Test
        @DisplayName("not equal to different type")
        void notEqualToDifferentType() {
            CarrierLane lane = CarrierLane.createNew(TENANT_ID, TRUCKER_ID, "TX", "CA", null, "ANY");
            assertThat(lane).isNotEqualTo("string");
        }

        @Test
        @DisplayName("hashCode is 0 when id is null")
        void nullId_hashCodeZero() {
            CarrierLane lane = new CarrierLane(null, TENANT_ID, TRUCKER_ID, "TX", "CA", null, "ANY",
                OffsetDateTime.now(ZoneOffset.UTC), null);
            assertThat(lane.hashCode()).isEqualTo(0);
        }

        @Test
        @DisplayName("hashCode based on id")
        void hashCode_basedOnId() {
            OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
            CarrierLane a = new CarrierLane("id-1", TENANT_ID, TRUCKER_ID, "TX", "CA", null, "ANY", now, null);
            CarrierLane b = new CarrierLane("id-1", TENANT_ID, TRUCKER_ID, "FL", "NY", null, "ANY", now, null);
            assertThat(a.hashCode()).isEqualTo(b.hashCode());
        }
    }
}
