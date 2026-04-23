package com.freightclub.modules.load.infrastructure.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.freightclub.modules.load.application.LoadNotFoundException;
import com.freightclub.modules.load.application.ports.in.LoadUseCase;
import com.freightclub.modules.load.domain.CarrierId;
import com.freightclub.modules.load.domain.LoadAggregate;
import com.freightclub.modules.load.domain.LoadStatus;
import com.freightclub.modules.load.domain.Weight;
import com.freightclub.modules.load.infrastructure.rest.dto.ClaimLoadRequest;
import com.freightclub.modules.load.infrastructure.rest.dto.CreateLoadRequest;
import com.freightclub.security.JwtService;
import com.freightclub.security.TenantContextHolder;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(LoadController.class)
class LoadApiIntegrationTest {

    @MockBean
    private LoadUseCase useCase;

    @MockBean
    @SuppressWarnings("unused")
    private JwtService jwtService;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private static final String TENANT  = "tenant-abc";
    private static final String LOAD_ID = "load-001";

    @BeforeEach
    void bindTenant() {
        TenantContextHolder.setTenantId(TENANT);
    }

    @AfterEach
    void clearTenant() {
        TenantContextHolder.clear();
    }

    private LoadAggregate draftLoad() {
        return LoadAggregate.reconstitute(
                LOAD_ID, TENANT, "shipper-1",
                Weight.of(BigDecimal.valueOf(1000)), LoadStatus.DRAFT,
                null, null, null);
    }

    private LoadAggregate publishedLoad() {
        return LoadAggregate.reconstitute(
                LOAD_ID, TENANT, "shipper-1",
                Weight.of(BigDecimal.valueOf(1000)), LoadStatus.PUBLISHED,
                null, null, null);
    }

    private LoadAggregate claimedLoad() {
        return LoadAggregate.reconstitute(
                LOAD_ID, TENANT, "shipper-1",
                Weight.of(BigDecimal.valueOf(1000)), LoadStatus.CLAIMED,
                CarrierId.of("carrier-99"), null, null);
    }

    // ── Happy-path tests ──────────────────────────────────────────────────────

    @Test
    @WithMockUser
    void createDraft_returns201_withDraftStatus() throws Exception {
        when(useCase.createDraft(eq(TENANT), eq("shipper-1"), any())).thenReturn(draftLoad());

        CreateLoadRequest request = new CreateLoadRequest("shipper-1", BigDecimal.valueOf(1000));

        mockMvc.perform(post("/api/v2/loads")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .with(csrf()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(LOAD_ID))
                .andExpect(jsonPath("$.status").value("DRAFT"));
    }

    @Test
    @WithMockUser
    void publish_returns200_withPublishedStatus() throws Exception {
        when(useCase.publish(TENANT, LOAD_ID)).thenReturn(publishedLoad());

        mockMvc.perform(put("/api/v2/loads/{id}/publish", LOAD_ID)
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PUBLISHED"));
    }

    @Test
    @WithMockUser
    void claim_returns200_withCarrierIdAndClaimedStatus() throws Exception {
        when(useCase.claim(TENANT, LOAD_ID, "carrier-99")).thenReturn(claimedLoad());

        ClaimLoadRequest request = new ClaimLoadRequest("carrier-99");

        mockMvc.perform(put("/api/v2/loads/{id}/claim", LOAD_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CLAIMED"))
                .andExpect(jsonPath("$.carrierId").value("carrier-99"));
    }

    // ── Tenant isolation tests ────────────────────────────────────────────────

    @Test
    @WithMockUser
    void publish_loadNotVisibleToTenant_returns404() throws Exception {
        // Simulates RLS + tenant-scoped query returning empty for a cross-tenant load.
        when(useCase.publish(eq(TENANT), eq(LOAD_ID)))
                .thenThrow(new LoadNotFoundException(LOAD_ID));

        mockMvc.perform(put("/api/v2/loads/{id}/publish", LOAD_ID)
                        .with(csrf()))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void claim_loadNotVisibleToTenant_returns404() throws Exception {
        when(useCase.claim(eq(TENANT), eq(LOAD_ID), any()))
                .thenThrow(new LoadNotFoundException(LOAD_ID));

        ClaimLoadRequest request = new ClaimLoadRequest("carrier-99");

        mockMvc.perform(put("/api/v2/loads/{id}/claim", LOAD_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .with(csrf()))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void startTrip_returns200_withInTransitStatus() throws Exception {
        LoadAggregate inTransit = LoadAggregate.reconstitute(
                LOAD_ID, TENANT, "shipper-1",
                Weight.of(BigDecimal.valueOf(1000)), LoadStatus.IN_TRANSIT,
                CarrierId.of("carrier-99"), null, null);
        when(useCase.startTrip(TENANT, LOAD_ID)).thenReturn(inTransit);

        mockMvc.perform(put("/api/v2/loads/{id}/start-trip", LOAD_ID)
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_TRANSIT"));
    }

    @Test
    @WithMockUser
    void deliver_returns200_withDeliveredStatus() throws Exception {
        LoadAggregate delivered = LoadAggregate.reconstitute(
                LOAD_ID, TENANT, "shipper-1",
                Weight.of(BigDecimal.valueOf(1000)), LoadStatus.DELIVERED,
                CarrierId.of("carrier-99"), "https://storage.example.com/pod.pdf", null);
        when(useCase.completeDelivery(TENANT, LOAD_ID, "https://storage.example.com/pod.pdf"))
                .thenReturn(delivered);

        mockMvc.perform(put("/api/v2/loads/{id}/deliver", LOAD_ID)
                        .contentType(MediaType.TEXT_PLAIN)
                        .content("https://storage.example.com/pod.pdf")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DELIVERED"));
    }

    @Test
    @WithMockUser
    void cancel_returns200_withCancelledStatus() throws Exception {
        LoadAggregate cancelled = LoadAggregate.reconstitute(
                LOAD_ID, TENANT, "shipper-1",
                Weight.of(BigDecimal.valueOf(1000)), LoadStatus.CANCELLED,
                null, null, "Equipment issue");
        when(useCase.cancelLoad(TENANT, LOAD_ID, "Equipment issue")).thenReturn(cancelled);

        mockMvc.perform(put("/api/v2/loads/{id}/cancel", LOAD_ID)
                        .contentType(MediaType.TEXT_PLAIN)
                        .content("Equipment issue")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }

    @Test
    void publish_noAuthentication_returns401() throws Exception {
        mockMvc.perform(put("/api/v2/loads/{id}/publish", LOAD_ID)
                        .with(csrf()))
                .andExpect(status().isUnauthorized());
    }
}
