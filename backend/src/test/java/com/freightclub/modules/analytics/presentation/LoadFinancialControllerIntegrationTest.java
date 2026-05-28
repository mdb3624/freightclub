package com.freightclub.modules.analytics.presentation;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.freightclub.modules.analytics.application.LoadFinancialService;
import com.freightclub.modules.analytics.application.LoadFinancialService.RevenueSummaryResponse;
import com.freightclub.security.TenantContextHolder;
import java.math.BigDecimal;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
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
class LoadFinancialControllerIntegrationTest {

  @Autowired private MockMvc mvc;

  @MockBean private LoadFinancialService financialService;

  private static final String TEST_TENANT_ID = "tenant-financial";
  private static final String TEST_SHIPPER_ID = "shipper-financial-123";

  @BeforeEach
  void setUp() {
    TenantContextHolder.setTenantId(TEST_TENANT_ID);
  }

  @AfterEach
  void tearDown() {
    TenantContextHolder.clear();
  }

  @Test
  @WithMockUser(roles = "SHIPPER")
  void testGetRevenueSummary_ReturnsOk() throws Exception {
    BigDecimal totalRevenue = BigDecimal.valueOf(10000.00);
    BigDecimal totalCommission = BigDecimal.valueOf(200.00);
    BigDecimal netRevenue = BigDecimal.valueOf(9800.00);
    BigDecimal avgRate = BigDecimal.valueOf(1.95);
    RevenueSummaryResponse response =
        new RevenueSummaryResponse(totalRevenue, totalCommission, netRevenue, 100, avgRate);
    when(financialService.getRevenueSummary(TEST_SHIPPER_ID, 30)).thenReturn(response);

    mvc.perform(get("/api/v1/shippers/{shipperId}/revenue-summary", TEST_SHIPPER_ID))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalRevenue").value(10000.00))
        .andExpect(jsonPath("$.totalCommission").value(200.00))
        .andExpect(jsonPath("$.netRevenue").value(9800.00))
        .andExpect(jsonPath("$.loadCount").value(100));

    verify(financialService).getRevenueSummary(TEST_SHIPPER_ID, 30);
  }

  @Test
  @WithMockUser(roles = "SHIPPER")
  void testGetRevenueSummary_CustomDayRange() throws Exception {
    BigDecimal totalRevenue = BigDecimal.valueOf(50000.00);
    BigDecimal totalCommission = BigDecimal.valueOf(1000.00);
    BigDecimal netRevenue = BigDecimal.valueOf(49000.00);
    BigDecimal avgRate = BigDecimal.valueOf(2.50);
    RevenueSummaryResponse response =
        new RevenueSummaryResponse(totalRevenue, totalCommission, netRevenue, 500, avgRate);
    when(financialService.getRevenueSummary(TEST_SHIPPER_ID, 90)).thenReturn(response);

    mvc.perform(
            get("/api/v1/shippers/{shipperId}/revenue-summary", TEST_SHIPPER_ID)
                .param("days", "90"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalRevenue").value(50000.00))
        .andExpect(jsonPath("$.loadCount").value(500));

    verify(financialService).getRevenueSummary(TEST_SHIPPER_ID, 90);
  }

  @Test
  @WithMockUser(roles = "SHIPPER")
  void testGetRevenueSummary_ZeroRevenue() throws Exception {
    RevenueSummaryResponse response =
        new RevenueSummaryResponse(
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            0,
            BigDecimal.ZERO);
    when(financialService.getRevenueSummary(TEST_SHIPPER_ID, 30)).thenReturn(response);

    mvc.perform(get("/api/v1/shippers/{shipperId}/revenue-summary", TEST_SHIPPER_ID))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalRevenue").value(0.00))
        .andExpect(jsonPath("$.loadCount").value(0));
  }

  @Test
  @WithMockUser(roles = "SHIPPER")
  void testGetRevenueSummary_LargeAmounts() throws Exception {
    BigDecimal totalRevenue = BigDecimal.valueOf(999999.99);
    BigDecimal totalCommission = BigDecimal.valueOf(19999.99);
    BigDecimal netRevenue = BigDecimal.valueOf(980000.00);
    BigDecimal avgRate = BigDecimal.valueOf(9.99);
    RevenueSummaryResponse response =
        new RevenueSummaryResponse(totalRevenue, totalCommission, netRevenue, 10000, avgRate);
    when(financialService.getRevenueSummary(TEST_SHIPPER_ID, 30)).thenReturn(response);

    mvc.perform(get("/api/v1/shippers/{shipperId}/revenue-summary", TEST_SHIPPER_ID))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalRevenue").value(999999.99))
        .andExpect(jsonPath("$.loadCount").value(10000));
  }

  @Test
  @WithMockUser(roles = "SHIPPER")
  void testGetRevenueSummary_DefaultDays() throws Exception {
    RevenueSummaryResponse response =
        new RevenueSummaryResponse(
            BigDecimal.valueOf(5000.00),
            BigDecimal.valueOf(100.00),
            BigDecimal.valueOf(4900.00),
            50,
            BigDecimal.valueOf(1.50));
    when(financialService.getRevenueSummary(TEST_SHIPPER_ID, 30)).thenReturn(response);

    mvc.perform(get("/api/v1/shippers/{shipperId}/revenue-summary", TEST_SHIPPER_ID))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalRevenue").value(5000.00));

    verify(financialService).getRevenueSummary(TEST_SHIPPER_ID, 30);
  }

  @Test
  @WithMockUser(roles = "SHIPPER")
  void testGetRevenueSummary_Commission2Percent() throws Exception {
    BigDecimal totalRevenue = BigDecimal.valueOf(100.00);
    BigDecimal expectedCommission = BigDecimal.valueOf(2.00);
    BigDecimal expectedNetRevenue = BigDecimal.valueOf(98.00);
    RevenueSummaryResponse response =
        new RevenueSummaryResponse(
            totalRevenue,
            expectedCommission,
            expectedNetRevenue,
            1,
            BigDecimal.valueOf(1.00));
    when(financialService.getRevenueSummary(TEST_SHIPPER_ID, 30)).thenReturn(response);

    mvc.perform(get("/api/v1/shippers/{shipperId}/revenue-summary", TEST_SHIPPER_ID))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalCommission").value(2.00))
        .andExpect(jsonPath("$.netRevenue").value(98.00));
  }

  @Test
  @WithMockUser(roles = "SHIPPER")
  void testGetLaneProfitability_ReturnsEmpty() throws Exception {
    mvc.perform(
            get("/api/v1/shippers/{shipperId}/lane-profitability", TEST_SHIPPER_ID)
                .param("days", "30"))
        .andExpect(status().isOk());
  }

  @Test
  @WithMockUser(roles = "SHIPPER")
  void testGetLaneProfitability_DefaultDays() throws Exception {
    mvc.perform(get("/api/v1/shippers/{shipperId}/lane-profitability", TEST_SHIPPER_ID))
        .andExpect(status().isOk());
  }

  @Test
  @WithMockUser(roles = "SHIPPER")
  void testGetCarrierProfitability_ReturnsEmpty() throws Exception {
    mvc.perform(
            get("/api/v1/shippers/{shipperId}/carrier-profitability", TEST_SHIPPER_ID)
                .param("days", "30"))
        .andExpect(status().isOk());
  }

  @Test
  @WithMockUser(roles = "SHIPPER")
  void testGetCarrierProfitability_DefaultDays() throws Exception {
    mvc.perform(get("/api/v1/shippers/{shipperId}/carrier-profitability", TEST_SHIPPER_ID))
        .andExpect(status().isOk());
  }

  @Test
  void testGetRevenueSummary_RequiresAuthentication() throws Exception {
    mvc.perform(get("/api/v1/shippers/{shipperId}/revenue-summary", TEST_SHIPPER_ID))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void testGetLaneProfitability_RequiresAuthentication() throws Exception {
    mvc.perform(get("/api/v1/shippers/{shipperId}/lane-profitability", TEST_SHIPPER_ID))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void testGetCarrierProfitability_RequiresAuthentication() throws Exception {
    mvc.perform(get("/api/v1/shippers/{shipperId}/carrier-profitability", TEST_SHIPPER_ID))
        .andExpect(status().isUnauthorized());
  }

  @Test
  @WithMockUser(roles = "SHIPPER")
  void testGetRevenueSummary_ContentType() throws Exception {
    RevenueSummaryResponse response =
        new RevenueSummaryResponse(
            BigDecimal.valueOf(5000.00),
            BigDecimal.valueOf(100.00),
            BigDecimal.valueOf(4900.00),
            50,
            BigDecimal.valueOf(1.50));
    when(financialService.getRevenueSummary(TEST_SHIPPER_ID, 30)).thenReturn(response);

    mvc.perform(get("/api/v1/shippers/{shipperId}/revenue-summary", TEST_SHIPPER_ID))
        .andExpect(status().isOk())
        .andExpect(content().contentType("application/json;charset=UTF-8"));
  }

  @Test
  @WithMockUser(roles = "SHIPPER")
  void testGetRevenueSummary_Various7DayRanges() throws Exception {
    for (int days : new int[] {1, 7, 14, 30, 60, 90}) {
      RevenueSummaryResponse response =
          new RevenueSummaryResponse(
              BigDecimal.valueOf(1000.00),
              BigDecimal.valueOf(20.00),
              BigDecimal.valueOf(980.00),
              10,
              BigDecimal.valueOf(1.50));
      when(financialService.getRevenueSummary(TEST_SHIPPER_ID, days)).thenReturn(response);

      mvc.perform(
              get("/api/v1/shippers/{shipperId}/revenue-summary", TEST_SHIPPER_ID)
                  .param("days", String.valueOf(days)))
          .andExpect(status().isOk());
    }
  }
}
