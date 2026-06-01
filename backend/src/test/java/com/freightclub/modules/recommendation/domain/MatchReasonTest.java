package com.freightclub.modules.recommendation.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("MatchReason")
class MatchReasonTest {

    // ---------------------------------------------------------------
    // Accessor tests
    // ---------------------------------------------------------------

    @Nested
    @DisplayName("accessors")
    class Accessors {

        @Test
        @DisplayName("equipment() returns the value supplied at construction")
        void equipment_accessor() {
            MatchReason r = new MatchReason(true, false, false, false);
            assertThat(r.equipment()).isTrue();
        }

        @Test
        @DisplayName("lane() returns the value supplied at construction")
        void lane_accessor() {
            MatchReason r = new MatchReason(false, true, false, false);
            assertThat(r.lane()).isTrue();
        }

        @Test
        @DisplayName("rate() returns the value supplied at construction")
        void rate_accessor() {
            MatchReason r = new MatchReason(false, false, true, false);
            assertThat(r.rate()).isTrue();
        }

        @Test
        @DisplayName("availability() returns the value supplied at construction")
        void availability_accessor() {
            MatchReason r = new MatchReason(false, false, false, true);
            assertThat(r.availability()).isTrue();
        }

        @Test
        @DisplayName("all fields false when constructed with all-false")
        void allFalse() {
            MatchReason r = new MatchReason(false, false, false, false);
            assertThat(r.equipment()).isFalse();
            assertThat(r.lane()).isFalse();
            assertThat(r.rate()).isFalse();
            assertThat(r.availability()).isFalse();
        }

        @Test
        @DisplayName("all fields true when constructed with all-true")
        void allTrue() {
            MatchReason r = new MatchReason(true, true, true, true);
            assertThat(r.equipment()).isTrue();
            assertThat(r.lane()).isTrue();
            assertThat(r.rate()).isTrue();
            assertThat(r.availability()).isTrue();
        }
    }

    // ---------------------------------------------------------------
    // equals() tests — every branch in the hand-written override
    // ---------------------------------------------------------------

    @Nested
    @DisplayName("equals()")
    class Equals {

        @Test
        @DisplayName("same instance is equal to itself (identity branch)")
        void sameInstance() {
            MatchReason r = new MatchReason(true, false, true, false);
            assertThat(r).isEqualTo(r);
        }

        @Test
        @DisplayName("null is not equal (null branch)")
        void nullNotEqual() {
            MatchReason r = new MatchReason(true, false, true, false);
            assertThat(r).isNotEqualTo(null);
        }

        @Test
        @DisplayName("different class is not equal (getClass() branch)")
        void differentClass() {
            MatchReason r = new MatchReason(true, false, true, false);
            assertThat(r).isNotEqualTo("not a MatchReason");
        }

        @Test
        @DisplayName("equal when all fields match")
        void allFieldsMatch() {
            MatchReason a = new MatchReason(true, true, false, false);
            MatchReason b = new MatchReason(true, true, false, false);
            assertThat(a).isEqualTo(b);
        }

        @Test
        @DisplayName("not equal when equipment differs")
        void equipmentDiffers() {
            assertThat(new MatchReason(true, true, true, true))
                    .isNotEqualTo(new MatchReason(false, true, true, true));
        }

        @Test
        @DisplayName("not equal when lane differs")
        void laneDiffers() {
            assertThat(new MatchReason(true, true, true, true))
                    .isNotEqualTo(new MatchReason(true, false, true, true));
        }

        @Test
        @DisplayName("not equal when rate differs")
        void rateDiffers() {
            assertThat(new MatchReason(true, true, true, true))
                    .isNotEqualTo(new MatchReason(true, true, false, true));
        }

        @Test
        @DisplayName("not equal when availability differs")
        void availabilityDiffers() {
            assertThat(new MatchReason(true, true, true, true))
                    .isNotEqualTo(new MatchReason(true, true, true, false));
        }
    }

    // ---------------------------------------------------------------
    // hashCode() tests
    // ---------------------------------------------------------------

    @Nested
    @DisplayName("hashCode()")
    class HashCode {

        @Test
        @DisplayName("equal records produce the same hash code")
        void equalRecordsSameHash() {
            MatchReason a = new MatchReason(true, false, true, false);
            MatchReason b = new MatchReason(true, false, true, false);
            assertThat(a.hashCode()).isEqualTo(b.hashCode());
        }

        @Test
        @DisplayName("all-false and all-true produce different hash codes")
        void differentValuesDifferentHash() {
            MatchReason allFalse = new MatchReason(false, false, false, false);
            MatchReason allTrue  = new MatchReason(true,  true,  true,  true);
            assertThat(allFalse.hashCode()).isNotEqualTo(allTrue.hashCode());
        }

        @Test
        @DisplayName("hash code is stable across multiple calls")
        void hashCodeIsStable() {
            MatchReason r = new MatchReason(false, true, false, true);
            int first  = r.hashCode();
            int second = r.hashCode();
            assertThat(first).isEqualTo(second);
        }
    }

    // ---------------------------------------------------------------
    // toString() — sanity check (record default)
    // ---------------------------------------------------------------

    @Nested
    @DisplayName("toString()")
    class ToString {

        @Test
        @DisplayName("contains all field names")
        void containsFieldNames() {
            String s = new MatchReason(true, false, true, false).toString();
            assertThat(s)
                    .contains("equipment")
                    .contains("lane")
                    .contains("rate")
                    .contains("availability");
        }
    }
}
