package com.freightclub.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class StateToEiaRegionResolverTest {

  @Test
  void resolve_nyOrigin_returnsEast() {
    assertThat(StateToEiaRegionResolver.resolve("NY")).isEqualTo("EAST");
  }

  @Test
  void resolve_floridaOrigin_returnsEast() {
    // FL is PADD 1C (Lower Atlantic) -- same PADD as NY, not SOUTH.
    assertThat(StateToEiaRegionResolver.resolve("FL")).isEqualTo("EAST");
  }

  @Test
  void resolve_texasOrigin_returnsSouth() {
    // TX is PADD 3 (Gulf Coast).
    assertThat(StateToEiaRegionResolver.resolve("TX")).isEqualTo("SOUTH");
  }

  @Test
  void resolve_illinoisOrigin_returnsMidwest() {
    assertThat(StateToEiaRegionResolver.resolve("IL")).isEqualTo("MIDWEST");
  }

  @Test
  void resolve_coloradoOrigin_returnsRocky() {
    assertThat(StateToEiaRegionResolver.resolve("CO")).isEqualTo("ROCKY");
  }

  @Test
  void resolve_californiaOrigin_returnsWest() {
    assertThat(StateToEiaRegionResolver.resolve("CA")).isEqualTo("WEST");
  }

  @Test
  void resolve_lowercaseStateCode_isCaseInsensitive() {
    assertThat(StateToEiaRegionResolver.resolve("ny")).isEqualTo("EAST");
  }

  @Test
  void resolve_nullState_returnsNull() {
    assertThat(StateToEiaRegionResolver.resolve(null)).isNull();
  }

  @Test
  void resolve_unknownOrUnmappableCode_returnsNull() {
    assertThat(StateToEiaRegionResolver.resolve("XX")).isNull();
    assertThat(StateToEiaRegionResolver.resolve("")).isNull();
  }

  @Test
  void resolve_allFiftyStatesPlusDc_mapToOneOfFiveRegions() {
    String[] allCodes = {
      "AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN","IA",
      "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM",
      "NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA",
      "WV","WI","WY"
    };
    for (String code : allCodes) {
      String region = StateToEiaRegionResolver.resolve(code);
      assertThat(region)
          .as("state code %s should resolve to a valid EIA region", code)
          .isIn("EAST", "MIDWEST", "SOUTH", "ROCKY", "WEST");
    }
  }
}
