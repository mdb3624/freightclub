package com.freightclub.domain;

import com.freightclub.modules.carrier.domain.EquipmentCondition;
import com.freightclub.modules.carrier.domain.EquipmentStatus;
import com.freightclub.modules.carrier.domain.EquipmentType;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for CarrierEquipment domain class.
 * Covers AC-1 (createNew validation), AC-3 (updateEquipment), AC-5 (updateCondition, softDelete).
 */
class CarrierEquipmentTest {

    // ── helpers ──────────────────────────────────────────────────────────────

    private CarrierEquipment validEquipment() {
        return CarrierEquipment.createNew(
            EquipmentType.FLATBED,
            48, 8, 8,
            45000L,
            EquipmentCondition.GOOD,
            "2022",
            "tenant-1",
            "trucker-1"
        );
    }

    private CarrierEquipment deletedEquipment() {
        CarrierEquipment eq = validEquipment();
        eq.softDelete();
        return eq;
    }

    // ── createNew ─────────────────────────────────────────────────────────────

    @Nested
    class CreateNew {

        @Test
        void happyPath_returnsEquipmentWithExpectedFields() {
            CarrierEquipment eq = CarrierEquipment.createNew(
                EquipmentType.DRY_VAN,
                53, 8, 9,
                44000L,
                EquipmentCondition.FAIR,
                "2021",
                "tenant-abc",
                "trucker-xyz"
            );

            assertNotNull(eq.getId());
            assertEquals("tenant-abc", eq.getTenantId());
            assertEquals("trucker-xyz", eq.getTruckerId());
            assertEquals(EquipmentType.DRY_VAN, eq.getEquipmentType());
            assertEquals(53, eq.getLengthFeet());
            assertEquals(8, eq.getWidthFeet());
            assertEquals(9, eq.getHeightFeet());
            assertEquals(44000L, eq.getCapacityLbs());
            assertEquals(EquipmentCondition.FAIR, eq.getEquipmentCondition());
            assertEquals("2021", eq.getYearModel());
            assertEquals(EquipmentStatus.ACTIVE, eq.getStatus());
            assertNotNull(eq.getCreatedAt());
            assertNull(eq.getDeletedAt());
        }

        @Test
        void eachCallProducesUniqueId() {
            CarrierEquipment a = validEquipment();
            CarrierEquipment b = validEquipment();
            assertNotEquals(a.getId(), b.getId());
        }

        @Test
        void negativeLengthThrows() {
            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                CarrierEquipment.createNew(EquipmentType.FLATBED, -1, 8, 8, 45000L,
                    EquipmentCondition.GOOD, "2022", "t1", "tr1")
            );
            assertTrue(ex.getMessage().contains("Dimensions must be positive"));
        }

        @Test
        void zeroLengthThrows() {
            assertThrows(IllegalArgumentException.class, () ->
                CarrierEquipment.createNew(EquipmentType.FLATBED, 0, 8, 8, 45000L,
                    EquipmentCondition.GOOD, "2022", "t1", "tr1")
            );
        }

        @Test
        void negativeWidthThrows() {
            assertThrows(IllegalArgumentException.class, () ->
                CarrierEquipment.createNew(EquipmentType.FLATBED, 48, -1, 8, 45000L,
                    EquipmentCondition.GOOD, "2022", "t1", "tr1")
            );
        }

        @Test
        void negativeHeightThrows() {
            assertThrows(IllegalArgumentException.class, () ->
                CarrierEquipment.createNew(EquipmentType.FLATBED, 48, 8, -1, 45000L,
                    EquipmentCondition.GOOD, "2022", "t1", "tr1")
            );
        }

        @Test
        void negativeCapacityThrows() {
            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                CarrierEquipment.createNew(EquipmentType.FLATBED, 48, 8, 8, -1L,
                    EquipmentCondition.GOOD, "2022", "t1", "tr1")
            );
            assertTrue(ex.getMessage().contains("Capacity must be positive"));
        }

        @Test
        void zeroCapacityThrows() {
            assertThrows(IllegalArgumentException.class, () ->
                CarrierEquipment.createNew(EquipmentType.FLATBED, 48, 8, 8, 0L,
                    EquipmentCondition.GOOD, "2022", "t1", "tr1")
            );
        }
    }

    // ── updateCondition ───────────────────────────────────────────────────────

    @Nested
    class UpdateCondition {

        @Test
        void happyPath_updatesCondition() {
            CarrierEquipment eq = validEquipment();
            eq.updateCondition(EquipmentCondition.NEEDS_REPAIR);
            assertEquals(EquipmentCondition.NEEDS_REPAIR, eq.getEquipmentCondition());
        }

        @Test
        void onDeletedEquipment_throws() {
            CarrierEquipment eq = deletedEquipment();
            IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                eq.updateCondition(EquipmentCondition.FAIR)
            );
            assertEquals("Cannot update deleted equipment", ex.getMessage());
        }
    }

    // ── updateEquipment ───────────────────────────────────────────────────────

    @Nested
    class UpdateEquipment {

        @Test
        void happyPath_updatesAllFields() {
            CarrierEquipment eq = validEquipment();
            eq.updateEquipment(40, 8, 9, 40000L, EquipmentCondition.FAIR);
            assertEquals(40, eq.getLengthFeet());
            assertEquals(8, eq.getWidthFeet());
            assertEquals(9, eq.getHeightFeet());
            assertEquals(40000L, eq.getCapacityLbs());
            assertEquals(EquipmentCondition.FAIR, eq.getEquipmentCondition());
        }

        @Test
        void onDeletedEquipment_throws() {
            CarrierEquipment eq = deletedEquipment();
            assertThrows(IllegalStateException.class, () ->
                eq.updateEquipment(40, 8, 8, 40000L, EquipmentCondition.FAIR)
            );
        }

        @Test
        void negativeLength_throws() {
            CarrierEquipment eq = validEquipment();
            assertThrows(IllegalArgumentException.class, () ->
                eq.updateEquipment(-5, 8, 8, 40000L, EquipmentCondition.FAIR)
            );
        }

        @Test
        void negativeWidth_throws() {
            CarrierEquipment eq = validEquipment();
            assertThrows(IllegalArgumentException.class, () ->
                eq.updateEquipment(48, -1, 8, 40000L, EquipmentCondition.FAIR)
            );
        }

        @Test
        void negativeHeight_throws() {
            CarrierEquipment eq = validEquipment();
            assertThrows(IllegalArgumentException.class, () ->
                eq.updateEquipment(48, 8, -1, 40000L, EquipmentCondition.FAIR)
            );
        }

        @Test
        void negativeCapacity_throws() {
            CarrierEquipment eq = validEquipment();
            assertThrows(IllegalArgumentException.class, () ->
                eq.updateEquipment(48, 8, 8, -1L, EquipmentCondition.FAIR)
            );
        }

        @Test
        void zeroCapacity_throws() {
            CarrierEquipment eq = validEquipment();
            assertThrows(IllegalArgumentException.class, () ->
                eq.updateEquipment(48, 8, 8, 0L, EquipmentCondition.FAIR)
            );
        }
    }

    // ── softDelete ────────────────────────────────────────────────────────────

    @Nested
    class SoftDelete {

        @Test
        void setsDeletedAt() {
            CarrierEquipment eq = validEquipment();
            assertNull(eq.getDeletedAt());
            eq.softDelete();
            assertNotNull(eq.getDeletedAt());
        }

        @Test
        void deletedAtIsInUTC() {
            CarrierEquipment eq = validEquipment();
            eq.softDelete();
            assertEquals(ZoneOffset.UTC, eq.getDeletedAt().getOffset());
        }

        @Test
        void callingTwiceUpdatesDeletedAt() {
            CarrierEquipment eq = validEquipment();
            eq.softDelete();
            eq.softDelete();
            assertNotNull(eq.getDeletedAt());
            // second call should not throw and deletedAt is non-null
        }
    }

    // ── equals / hashCode ─────────────────────────────────────────────────────

    @Nested
    class EqualsAndHashCode {

        @Test
        void sameInstance_isEqual() {
            CarrierEquipment eq = validEquipment();
            assertEquals(eq, eq);
        }

        @Test
        void differentInstances_sameId_areEqual() {
            String sharedId = "same-id";
            CarrierEquipment a = new CarrierEquipment(sharedId, "t1", "tr1",
                EquipmentType.FLATBED, 48, 8, 8, 45000L,
                EquipmentCondition.GOOD, "2022", EquipmentStatus.ACTIVE,
                OffsetDateTime.now(ZoneOffset.UTC), null);
            CarrierEquipment b = new CarrierEquipment(sharedId, "t2", "tr2",
                EquipmentType.DRY_VAN, 53, 8, 9, 44000L,
                EquipmentCondition.FAIR, "2021", EquipmentStatus.ACTIVE,
                OffsetDateTime.now(ZoneOffset.UTC), null);
            assertEquals(a, b);
            assertEquals(a.hashCode(), b.hashCode());
        }

        @Test
        void differentIds_areNotEqual() {
            CarrierEquipment a = validEquipment();
            CarrierEquipment b = validEquipment();
            assertNotEquals(a, b);
        }

        @Test
        void nullId_notEqualToAnyOther() {
            CarrierEquipment nullId = new CarrierEquipment(null, "t1", "tr1",
                EquipmentType.FLATBED, 48, 8, 8, 45000L,
                EquipmentCondition.GOOD, "2022", EquipmentStatus.ACTIVE,
                OffsetDateTime.now(ZoneOffset.UTC), null);
            CarrierEquipment other = validEquipment();
            assertNotEquals(nullId, other);
        }

        @Test
        void nullId_hashCodeIsZero() {
            CarrierEquipment nullId = new CarrierEquipment(null, "t1", "tr1",
                EquipmentType.FLATBED, 48, 8, 8, 45000L,
                EquipmentCondition.GOOD, "2022", EquipmentStatus.ACTIVE,
                OffsetDateTime.now(ZoneOffset.UTC), null);
            assertEquals(0, nullId.hashCode());
        }

        @Test
        void notEqualToNull() {
            assertNotEquals(null, validEquipment());
        }

        @Test
        void notEqualToDifferentType() {
            assertNotEquals(validEquipment(), "some-string");
        }
    }
}
