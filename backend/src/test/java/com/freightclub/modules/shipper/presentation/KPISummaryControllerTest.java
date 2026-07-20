package com.freightclub.modules.shipper.presentation;

import com.freightclub.modules.shipper.application.KPISummaryService;
import com.freightclub.modules.shipper.infrastructure.rest.dto.KPISummaryResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// US-820: KPISummaryController controller-level coverage — this endpoint had zero tests
// prior to the 2026-07-19/20 "Active Shipments shows 0" investigation.
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class KPISummaryControllerTest {

    @Autowired
    private MockMvc mvc;

    @MockBean
    private KPISummaryService kpiSummaryService;

    @Test
    @WithMockUser(roles = "SHIPPER")
    void getKpiSummary_returnsActiveLoadCountAndMetrics() throws Exception {
        var response = new KPISummaryResponse(1, BigDecimal.valueOf(94.5), BigDecimal.valueOf(2.35), false);
        when(kpiSummaryService.getSummary()).thenReturn(response);

        mvc.perform(get("/api/v1/shipper/dashboard/kpi-summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activeLoadCount").value(1))
                .andExpect(jsonPath("$.onTimePercentage").value(94.5))
                .andExpect(jsonPath("$.costPerMile").value(2.35))
                .andExpect(jsonPath("$.isEmpty").value(false));
    }

    @Test
    void getKpiSummary_requiresAuth() throws Exception {
        mvc.perform(get("/api/v1/shipper/dashboard/kpi-summary"))
                .andExpect(status().isUnauthorized());
    }
}
