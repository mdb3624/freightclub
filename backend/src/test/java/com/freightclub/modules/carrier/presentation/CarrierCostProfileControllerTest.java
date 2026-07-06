package com.freightclub.modules.carrier.presentation;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.freightclub.dto.DieselPriceResponse;
import com.freightclub.modules.carrier.application.CarrierCostProfileService;
import com.freightclub.modules.carrier.application.CostProfileWizardInput;
import com.freightclub.modules.carrier.domain.CarrierCostProfile;
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

// Feature: US-730a-v2 (Cost Profile Wizard Redesign)
// AC: GET returns null body when no profile exists (triggers wizard on frontend)
// AC: PUT upserts and returns derived RPM values
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CarrierCostProfileControllerTest {

  @Autowired private MockMvc mvc;
  @Autowired private ObjectMapper objectMapper;
  @MockBean private CarrierCostProfileService service;

  @BeforeEach
  void setTenantContext() {
    TenantContextHolder.setTenantId("tenant-1");
  }

  @AfterEach
  void clearTenantContext() {
    TenantContextHolder.clear();
  }

  @Test
  @WithMockUser(username = "trucker-1", roles = "TRUCKER")
  void getCostProfile_noProfile_returnsNullBody() throws Exception {
    when(service.getCostProfile("trucker-1")).thenReturn(null);

    mvc.perform(get("/api/v1/carrier/cost-profile"))
        .andExpect(status().isOk())
        .andExpect(result -> org.junit.jupiter.api.Assertions.assertEquals(
            "", result.getResponse().getContentAsString().replace("null", "")));
  }

  @Test
  @WithMockUser(username = "trucker-1", roles = "TRUCKER")
  void putCostProfile_upsertsAndReturnsDerivedValues() throws Exception {
    CarrierCostProfile saved =
        CarrierCostProfile.createNewWizard(
            "tenant-1", "trucker-1", "MIDWEST", new BigDecimal("6.5"),
            new BigDecimal("0.08"), new BigDecimal("1200"), new BigDecimal("600"),
            new BigDecimal("150"), 120000, new BigDecimal("2000"), 48);

    when(service.upsertWizardProfile(eq("trucker-1"), any(CostProfileWizardInput.class)))
        .thenReturn(saved);
    when(service.resolveDieselPrice(saved)).thenReturn(new BigDecimal("3.90"));

    String body =
        """
        {
          "dieselRegion": "MIDWEST",
          "milesPerGallon": 6.5,
          "additionalCostPerMile": 0.08,
          "truckPaymentMonthly": 1200,
          "insuranceMonthly": 600,
          "permitsMonthly": 150,
          "annualMiles": 120000,
          "weeklyIncomeGoal": 2000,
          "weeksWorkedPerYear": 48
        }
        """;

    mvc.perform(put("/api/v1/carrier/cost-profile")
            .contentType("application/json")
            .content(body))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.dieselRegion").value("MIDWEST"))
        .andExpect(jsonPath("$.minRpm").value(1.675));
  }
}
