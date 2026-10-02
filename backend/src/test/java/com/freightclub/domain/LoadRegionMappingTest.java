package com.freightclub.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

/**
 * CHG-871: Load.stateToRegion() was scanned at CRAP=2162 (cc=46, 0% branch
 * coverage) — the highest-risk method found in the 2026-09-09 complexity/coverage
 * baseline scan. Covers every branch of the private switch via the public
 * getOriginRegion()/getDestRegion() accessors.
 */
class LoadRegionMappingTest {

    @Test
    void southeastStates_mapToSoutheast() {
        Load load = new Load();
        for (String state : new String[] {"AL", "GA", "FL", "SC", "NC", "VA", "WV", "TN", "KY", "AR", "LA", "MS",
                "TX", "OK"}) {
            load.setOriginState(state);
            assertThat(load.getOriginRegion()).as("state=%s", state).isEqualTo("Southeast");
        }
    }

    @Test
    void californiaStates_mapToCalifornia() {
        Load load = new Load();
        for (String state : new String[] {"CA", "NV", "HI"}) {
            load.setOriginState(state);
            assertThat(load.getOriginRegion()).as("state=%s", state).isEqualTo("California");
        }
    }

    @Test
    void southwestStates_mapToSouthwest() {
        Load load = new Load();
        for (String state : new String[] {"CO", "WY", "MT", "UT", "AZ", "NM"}) {
            load.setOriginState(state);
            assertThat(load.getOriginRegion()).as("state=%s", state).isEqualTo("Southwest");
        }
    }

    @Test
    void midwestStates_mapToMidwest() {
        Load load = new Load();
        for (String state : new String[] {"OH", "IN", "IL", "MI", "WI", "MN", "IA", "MO"}) {
            load.setOriginState(state);
            assertThat(load.getOriginRegion()).as("state=%s", state).isEqualTo("Midwest");
        }
    }

    @Test
    void greatPlainsStates_mapToGreatPlains() {
        Load load = new Load();
        for (String state : new String[] {"NE", "KS", "SD", "ND"}) {
            load.setOriginState(state);
            assertThat(load.getOriginRegion()).as("state=%s", state).isEqualTo("Great Plains");
        }
    }

    @Test
    void northeastStates_mapToNortheast() {
        Load load = new Load();
        for (String state : new String[] {"NY", "NJ", "CT", "MA", "VT", "NH", "ME", "PA", "DC"}) {
            load.setOriginState(state);
            assertThat(load.getOriginRegion()).as("state=%s", state).isEqualTo("Northeast");
        }
    }

    @Test
    void unmappedState_returnsStateCodeUnchanged() {
        Load load = new Load();
        load.setOriginState("AK");
        assertThat(load.getOriginRegion()).isEqualTo("AK");
    }

    @Test
    void lowercaseStateCode_isNormalizedBeforeMapping() {
        Load load = new Load();
        load.setOriginState("ca");
        assertThat(load.getOriginRegion()).isEqualTo("California");
    }

    @Test
    void nullState_returnsNull() {
        Load load = new Load();
        load.setOriginState(null);
        assertThat(load.getOriginRegion()).isNull();
    }

    @Test
    void destinationRegion_usesDestinationState_independentlyOfOrigin() {
        Load load = new Load();
        load.setOriginState("CA");
        load.setDestinationState("NY");
        assertThat(load.getOriginRegion()).isEqualTo("California");
        assertThat(load.getDestRegion()).isEqualTo("Northeast");
    }
}
