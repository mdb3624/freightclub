package com.freightclub.modules.shipper.infrastructure.rest;

import com.freightclub.modules.shipper.application.LoadQueryService;
import com.freightclub.modules.shipper.infrastructure.rest.dto.LoadStatsResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ShipperControllerTest {
  @Autowired private MockMvc mvc;
  @MockBean private LoadQueryService loadQueryService;

  @Test
  @WithMockUser(roles = "SHIPPER")
  void testGetLoadStatsActiveView() throws Exception {
    var stats = LoadStatsResponse.StatusCounts.of(5, 3, 2, 10);
    var response = LoadStatsResponse.of(stats, null, "active");
    when(loadQueryService.getLoadStats("active")).thenReturn(response);

    mvc.perform(get("/api/v1/shipper/loads/stats").param("view", "active"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.active.open").value(5))
      .andExpect(jsonPath("$.active.claimed").value(3))
      .andExpect(jsonPath("$.active.inTransit").value(2))
      .andExpect(jsonPath("$.active.delivered").value(10))
      .andExpect(jsonPath("$.all").doesNotExist());
  }

  @Test
  @WithMockUser(roles = "SHIPPER")
  void testGetLoadStatsAllView() throws Exception {
    var activeStats = LoadStatsResponse.StatusCounts.of(5, 3, 2, 10);
    var allStats = LoadStatsResponse.StatusCounts.of(5, 3, 2, 10, 1, 2);
    var response = LoadStatsResponse.of(activeStats, allStats, "all");
    when(loadQueryService.getLoadStats("all")).thenReturn(response);

    mvc.perform(get("/api/v1/shipper/loads/stats").param("view", "all"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.active.open").value(5))
      .andExpect(jsonPath("$.all.draft").value(1))
      .andExpect(jsonPath("$.all.cancelled").value(2));
  }

  @Test
  @WithMockUser(roles = "SHIPPER")
  void testGetLoadStatsDefaultsToActiveView() throws Exception {
    var stats = LoadStatsResponse.StatusCounts.of(5, 3, 2, 10);
    var response = LoadStatsResponse.of(stats, null, "active");
    when(loadQueryService.getLoadStats("active")).thenReturn(response);

    mvc.perform(get("/api/v1/shipper/loads/stats"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.active.open").value(5));
  }

  @Test
  void testGetLoadStatsRequiresAuth() throws Exception {
    mvc.perform(get("/api/v1/shipper/loads/stats"))
      .andExpect(status().isUnauthorized());
  }
}
