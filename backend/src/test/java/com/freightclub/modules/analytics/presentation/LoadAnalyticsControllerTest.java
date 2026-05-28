package com.freightclub.modules.analytics.presentation;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.freightclub.modules.analytics.application.LoadAnalyticsService;
import com.freightclub.modules.analytics.application.LoadAnalyticsService.AdminAnalyticsResponse;
import com.freightclub.modules.analytics.application.LoadAnalyticsService.ShipperAnalyticsResponse;
import com.freightclub.security.TenantContextHolder;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class LoadAnalyticsControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private LoadAnalyticsService analyticsService;

  private static final String TEST_TENANT_ID = "tenant-123";

  @Test
  @WithMockUser(roles = "ADMIN")
  void testGetAdminAnalytics_Success() throws Exception {
    TenantContextHolder.setTenantId(TEST_TENANT_ID);
    AdminAnalyticsResponse response =
        new AdminAnalyticsResponse(100, 50, 50, 2.5);
    when(analyticsService.getAdminAnalytics(TEST_TENANT_ID, 7))
        .thenReturn(response);

    mockMvc
        .perform(get("/api/v1/admin/analytics/load-board").param("range", "7"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalPosted").value(100))
        .andExpect(jsonPath("$.totalClaimed").value(50))
        .andExpect(jsonPath("$.claimPercentage").value(50))
        .andExpect(jsonPath("$.avgClaimTimeHours").value(2.5));

    verify(analyticsService).getAdminAnalytics(TEST_TENANT_ID, 7);
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void testGetAdminAnalytics_DefaultRange() throws Exception {
    TenantContextHolder.setTenantId(TEST_TENANT_ID);
    AdminAnalyticsResponse response =
        new AdminAnalyticsResponse(100, 50, 50, 2.5);
    when(analyticsService.getAdminAnalytics(TEST_TENANT_ID, 7))
        .thenReturn(response);

    mockMvc
        .perform(get("/api/v1/admin/analytics/load-board"))
        .andExpect(status().isOk());

    verify(analyticsService).getAdminAnalytics(TEST_TENANT_ID, 7);
  }

  @Test
  @WithMockUser(roles = "SHIPPER")
  void testGetShipperAnalytics_Success() throws Exception {
    TenantContextHolder.setTenantId(TEST_TENANT_ID);
    String shipperId = "shipper-456";
    ShipperAnalyticsResponse response =
        new ShipperAnalyticsResponse(50, 25, 50, 1.5);
    when(analyticsService.getShipperAnalytics(shipperId, TEST_TENANT_ID, 7))
        .thenReturn(response);

    mockMvc
        .perform(get("/api/v1/shippers/analytics/performance")
            .param("range", "7")
            .param("shipperId", shipperId))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.postedCount").value(50))
        .andExpect(jsonPath("$.claimedCount").value(25))
        .andExpect(jsonPath("$.claimPercentage").value(50));

    verify(analyticsService).getShipperAnalytics(shipperId, TEST_TENANT_ID, 7);
  }

  @Test
  @WithMockUser(roles = "SHIPPER")
  void testGetLoadAnalytics_Success() throws Exception {
    String loadId = "load-789";

    mockMvc
        .perform(get("/api/v1/loads/{loadId}/analytics", loadId))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.loadId").value(loadId));
  }
}
