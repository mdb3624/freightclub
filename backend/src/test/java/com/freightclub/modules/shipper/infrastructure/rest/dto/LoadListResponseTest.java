package com.freightclub.modules.shipper.infrastructure.rest.dto;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class LoadListResponseTest {
  @Test
  void testLoadListResponseWithPagination() {
    var item1 = new LoadListResponse.LoadItemDto(
      "LOAD-001",
      "San Jose", "CA",
      "Phoenix", "AZ",
      "2026-05-20T08:00", "2026-05-20T17:00",
      "OPEN",
      1200.0, "flat",
      null,
      "2026-05-19T10:30:00Z"
    );

    var response = LoadListResponse.of(
      new LoadListResponse.LoadItemDto[] { item1 },
      0, 20, 147
    );

    assertEquals(1, response.loads().length);
    assertEquals("LOAD-001", response.loads()[0].id());
    assertEquals(0, response.pagination().page());
    assertEquals(20, response.pagination().limit());
    assertEquals(147, response.pagination().total());
  }

  @Test
  void testEmptyLoadsList() {
    var response = LoadListResponse.of(
      new LoadListResponse.LoadItemDto[] {},
      0, 20, 0
    );

    assertEquals(0, response.loads().length);
    assertEquals(0, response.pagination().total());
  }
}
