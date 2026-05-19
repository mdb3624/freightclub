package com.freightclub.modules.shipper.infrastructure.rest.dto;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class LoadStatsResponseTest {
  @Test
  void testFromWithActiveView() {
    var stats = LoadStatsResponse.StatusCounts.of(
      5,   // open
      3,   // claimed
      2,   // inTransit
      10   // delivered
    );

    var response = LoadStatsResponse.of(stats, null, "active");

    assertNotNull(response.active());
    assertEquals(5, response.active().open());
    assertEquals(3, response.active().claimed());
    assertEquals(2, response.active().inTransit());
    assertEquals(10, response.active().delivered());
    assertNull(response.all());
  }

  @Test
  void testFromWithAllView() {
    var activeStats = LoadStatsResponse.StatusCounts.of(5, 3, 2, 10);
    var allStats = LoadStatsResponse.StatusCounts.of(6, 3, 2, 10, 1, 5); // draft, cancelled added

    var response = LoadStatsResponse.of(activeStats, allStats, "all");

    assertNotNull(response.active());
    assertNotNull(response.all());
    assertEquals(6, response.all().draft());
    assertEquals(5, response.all().cancelled());
  }
}
