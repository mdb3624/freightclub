package com.freightclub.modules.analytics.presentation;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

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
class LoadAnalyticsControllerIntegrationTest {

  @Autowired private MockMvc mvc;

  @MockBean private LoadAnalyticsService analyticsService;

  private static final String TEST_TENANT_ID = "tenant-123";

  @Test
  @WithMockUser(roles = "ADMIN")
  void testGetAdminAnalytics_ReturnsOk() throws Exception {
    TenantContextHolder.setTenantId(TEST_TENANT_ID);
    AdminAnalyticsResponse response = new AdminAnalyticsResponse(100, 50, 50, 2.5);
    when(analyticsService.getAdminAnalytics(TEST_TENANT_ID, 7)).thenReturn(response);

    mvc.perform(get("/api/v1/admin/analytics/load-board").param("range", "7"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalPosted").value(100))
        .andExpect(jsonPath("$.totalClaimed").value(50))
        .andExpect(jsonPath("$.claimPercentage").value(50))
        .andExpect(jsonPath("$.avgClaimTimeHours").value(2.5));

    verify(analyticsService).getAdminAnalytics(TEST_TENANT_ID, 7);
  }

  @Test
  @WithMockUser(roles = "SHIPPER")
  void testGetShipperAnalytics_ReturnsOk() throws Exception {
    TenantContextHolder.setTenantId(TEST_TENANT_ID);
    String shipperId = "shipper-456";
    ShipperAnalyticsResponse response = new ShipperAnalyticsResponse(50, 25, 50, 1.5);
    when(analyticsService.getShipperAnalytics(shipperId, TEST_TENANT_ID, 7))
        .thenReturn(response);

    mvc.perform(
            get("/api/v1/shippers/analytics/performance")
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
  void testGetLoadAnalytics_ReturnsOk() throws Exception {
    String loadId = "load-789";

    mvc.perform(get("/api/v1/loads/{loadId}/analytics", loadId))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.loadId").value(loadId));
  }

  @Test
  void testGetAdminAnalytics_RequiresAuthentication() throws Exception {
    mvc.perform(get("/api/v1/admin/analytics/load-board"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void testGetAdminAnalytics_DifferentRanges() throws Exception {
    TenantContextHolder.setTenantId(TEST_TENANT_ID);
    AdminAnalyticsResponse response = new AdminAnalyticsResponse(300, 180, 60, 3.0);
    when(analyticsService.getAdminAnalytics(TEST_TENANT_ID, 30)).thenReturn(response);

    mvc.perform(get("/api/v1/admin/analytics/load-board").param("range", "30"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalPosted").value(300))
        .andExpect(jsonPath("$.claimPercentage").value(60));

    verify(analyticsService).getAdminAnalytics(TEST_TENANT_ID, 30);
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void testGetAdminAnalytics_DefaultRange() throws Exception {
    TenantContextHolder.setTenantId(TEST_TENANT_ID);
    AdminAnalyticsResponse response = new AdminAnalyticsResponse(50, 25, 50, 1.5);
    when(analyticsService.getAdminAnalytics(TEST_TENANT_ID, 7)).thenReturn(response);

    mvc.perform(get("/api/v1/admin/analytics/load-board"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalPosted").value(50));

    verify(analyticsService).getAdminAnalytics(TEST_TENANT_ID, 7);
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void testGetAdminAnalytics_ZeroLoads() throws Exception {
    TenantContextHolder.setTenantId(TEST_TENANT_ID);
    AdminAnalyticsResponse response = new AdminAnalyticsResponse(0, 0, 0, 0.0);
    when(analyticsService.getAdminAnalytics(TEST_TENANT_ID, 7)).thenReturn(response);

    mvc.perform(get("/api/v1/admin/analytics/load-board").param("range", "7"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalPosted").value(0))
        .andExpect(jsonPath("$.claimPercentage").value(0));

    verify(analyticsService).getAdminAnalytics(TEST_TENANT_ID, 7);
  }

  @Test
  @WithMockUser(roles = "SHIPPER")
  void testGetShipperAnalytics_DefaultRange() throws Exception {
    TenantContextHolder.setTenantId(TEST_TENANT_ID);
    String shipperId = "shipper-789";
    ShipperAnalyticsResponse response = new ShipperAnalyticsResponse(20, 10, 50, 1.0);
    when(analyticsService.getShipperAnalytics(shipperId, TEST_TENANT_ID, 7))
        .thenReturn(response);

    mvc.perform(
            get("/api/v1/shippers/analytics/performance")
                .param("shipperId", shipperId))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.postedCount").value(20));

    verify(analyticsService).getShipperAnalytics(shipperId, TEST_TENANT_ID, 7);
  }

  @Test
  @WithMockUser(roles = "SHIPPER")
  void testGetShipperAnalytics_WithCustomRange() throws Exception {
    TenantContextHolder.setTenantId(TEST_TENANT_ID);
    String shipperId = "shipper-custom";
    ShipperAnalyticsResponse response = new ShipperAnalyticsResponse(100, 75, 75, 2.5);
    when(analyticsService.getShipperAnalytics(shipperId, TEST_TENANT_ID, 60))
        .thenReturn(response);

    mvc.perform(
            get("/api/v1/shippers/analytics/performance")
                .param("range", "60")
                .param("shipperId", shipperId))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.claimPercentage").value(75));

    verify(analyticsService).getShipperAnalytics(shipperId, TEST_TENANT_ID, 60);
  }

  @Test
  @WithMockUser(roles = "SHIPPER")
  void testGetShipperAnalytics_ZeroClaimedLoads() throws Exception {
    TenantContextHolder.setTenantId(TEST_TENANT_ID);
    String shipperId = "shipper-no-claims";
    ShipperAnalyticsResponse response = new ShipperAnalyticsResponse(15, 0, 0, 0.0);
    when(analyticsService.getShipperAnalytics(shipperId, TEST_TENANT_ID, 7))
        .thenReturn(response);

    mvc.perform(
            get("/api/v1/shippers/analytics/performance")
                .param("shipperId", shipperId))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.claimedCount").value(0))
        .andExpect(jsonPath("$.claimPercentage").value(0));
  }

  @Test
  @WithMockUser(roles = "SHIPPER")
  void testGetLoadAnalytics_ValidLoadId() throws Exception {
    String loadId = "load-detail-123";

    mvc.perform(get("/api/v1/loads/{loadId}/analytics", loadId))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.loadId").value(loadId))
        .andExpect(jsonPath("$.matchCount").value(0))
        .andExpect(jsonPath("$.claimTime").value(0))
        .andExpect(jsonPath("$.avgRate").value(0.0))
        .andExpect(jsonPath("$.claimPercentage").value(0));
  }

  @Test
  @WithMockUser(roles = "SHIPPER")
  void testGetLoadAnalytics_VariousLoadIds() throws Exception {
    String[] loadIds = {"load-001", "load-002", "load-999"};
    for (String loadId : loadIds) {
      mvc.perform(get("/api/v1/loads/{loadId}/analytics", loadId))
          .andExpect(status().isOk())
          .andExpect(jsonPath("$.loadId").value(loadId));
    }
  }

  @Test
  void testGetShipperAnalytics_MissingShipperIdParam() throws Exception {
    mvc.perform(get("/api/v1/shippers/analytics/performance").param("range", "7"))
        .andExpect(status().isBadRequest());
  }

  @Test
  @WithMockUser(roles = "SHIPPER")
  void testGetAdminAnalytics_ForbiddenForNonAdmin() throws Exception {
    TenantContextHolder.setTenantId(TEST_TENANT_ID);

    mvc.perform(get("/api/v1/admin/analytics/load-board").param("range", "7"))
        .andExpect(status().isForbidden());
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void testGetAdminAnalytics_HighClaimPercentage() throws Exception {
    TenantContextHolder.setTenantId(TEST_TENANT_ID);
    AdminAnalyticsResponse response = new AdminAnalyticsResponse(1000, 950, 95, 5.0);
    when(analyticsService.getAdminAnalytics(TEST_TENANT_ID, 7)).thenReturn(response);

    mvc.perform(get("/api/v1/admin/analytics/load-board").param("range", "7"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.claimPercentage").value(95))
        .andExpect(jsonPath("$.avgClaimTimeHours").value(5.0));
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void testGetAdminAnalytics_ContentType() throws Exception {
    TenantContextHolder.setTenantId(TEST_TENANT_ID);
    AdminAnalyticsResponse response = new AdminAnalyticsResponse(100, 50, 50, 2.5);
    when(analyticsService.getAdminAnalytics(TEST_TENANT_ID, 7)).thenReturn(response);

    mvc.perform(get("/api/v1/admin/analytics/load-board").param("range", "7"))
        .andExpect(status().isOk())
        .andExpect(content().contentType("application/json;charset=UTF-8"));
  }
}
