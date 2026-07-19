package com.freightclub.modules.carrier.presentation;

import com.freightclub.modules.carrier.application.CarrierLaneSearchResult;
import com.freightclub.modules.carrier.application.CarrierProfileService;
import com.freightclub.modules.carrier.application.CarrierSearchResult;
import com.freightclub.modules.carrier.application.CarrierSearchService;
import com.freightclub.security.TenantContextHolder;
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

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Feature: US-762 (Carrier Search Lane Extension)
// AC-1: GET /carriers/search?origin=&destination=&equipmentType= routes to lane search
// AC-2: Existing GET /carriers/search?q= name/email search remains unaffected (US-707-v2)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CarrierPublicProfileControllerTest {

    @Autowired private MockMvc mvc;
    @MockBean private CarrierSearchService carrierSearchService;
    @MockBean private CarrierProfileService carrierProfileService;

    @BeforeEach
    void setTenantContext() {
        TenantContextHolder.setTenantId("tenant-1");
    }

    @AfterEach
    void clearTenantContext() {
        TenantContextHolder.clear();
    }

    @Test
    @WithMockUser(roles = "SHIPPER")
    void searchByLane_returnsLaneResults() throws Exception {
        var result = new CarrierLaneSearchResult("id-1", "Mike Johnson", "mike@example.com", List.of("FLATBED"), null, List.of());
        when(carrierSearchService.searchCarriersByLane(any(), eq("Midwest"), eq("Northeast"), eq("FLATBED")))
                .thenReturn(List.of(result));

        mvc.perform(get("/api/v1/carriers/search")
                        .param("origin", "Midwest")
                        .param("destination", "Northeast")
                        .param("equipmentType", "FLATBED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("id-1"))
                .andExpect(jsonPath("$[0].companyName").value("Mike Johnson"))
                .andExpect(jsonPath("$[0].equipmentTypes[0]").value("FLATBED"));
    }

    @Test
    @WithMockUser(roles = "SHIPPER")
    void searchByLane_equipmentTypeOptional() throws Exception {
        when(carrierSearchService.searchCarriersByLane(any(), eq("Midwest"), eq("Northeast"), isNull()))
                .thenReturn(List.of());

        mvc.perform(get("/api/v1/carriers/search")
                        .param("origin", "Midwest")
                        .param("destination", "Northeast"))
                .andExpect(status().isOk());

        verify(carrierSearchService).searchCarriersByLane(any(), eq("Midwest"), eq("Northeast"), isNull());
    }

    @Test
    @WithMockUser(roles = "SHIPPER")
    void searchByQ_stillRoutesToNameSearch() throws Exception {
        var result = new CarrierSearchResult("id-2", "Carlos", "Rivera", "carlos@test.com", "DRY_VAN");
        when(carrierSearchService.searchCarriers(any(), eq("Car"))).thenReturn(List.of(result));

        mvc.perform(get("/api/v1/carriers/search").param("q", "Car"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].firstName").value("Carlos"));
    }
}
