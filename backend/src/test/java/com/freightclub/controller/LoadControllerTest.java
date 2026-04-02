package com.freightclub.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.freightclub.domain.EquipmentType;
import com.freightclub.domain.LoadStatus;
import com.freightclub.domain.PayRateType;
import com.freightclub.domain.PaymentTerms;
import com.freightclub.dto.CreateLoadRequest;
import com.freightclub.dto.LoadResponse;
import com.freightclub.dto.LoadSummaryResponse;
import com.freightclub.dto.UpdateLoadRequest;
import com.freightclub.service.LoadService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class LoadControllerTest {

    @MockBean private LoadService loadService;

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    private static final String USER_ID = "user-shipper-1";

    private UsernamePasswordAuthenticationToken shipperAuth() {
        return new UsernamePasswordAuthenticationToken(USER_ID, null,
                List.of(new SimpleGrantedAuthority("ROLE_SHIPPER")));
    }

    private LoadResponse stubLoad() {
        LocalDateTime soon = LocalDateTime.now().plusDays(1);
        return new LoadResponse(
                "load-1", "tenant-1", USER_ID, null, LoadStatus.OPEN,
                "Chicago", "IL", "60601", "123 Main St", null,
                "New York", "NY", "10001", "456 Broadway", null,
                BigDecimal.valueOf(800),
                soon, soon.plusHours(4), soon.plusDays(1), soon.plusDays(1).plusHours(4),
                "Electronics", new BigDecimal("5000"),
                null, null, null,
                EquipmentType.DRY_VAN,
                new BigDecimal("1500"), PayRateType.FLAT_RATE,
                PaymentTerms.NET_15, null,
                null, null, null, null
        );
    }

    private CreateLoadRequest createRequest() {
        LocalDateTime soon = LocalDateTime.now().plusDays(1);
        return new CreateLoadRequest(
                "Chicago", "IL", "60601", "123 Main St", null,
                "New York", "NY", "10001", "456 Broadway", null,
                BigDecimal.valueOf(800),
                soon, soon.plusHours(4), soon.plusDays(1), soon.plusDays(1).plusHours(4),
                "Electronics", new BigDecimal("5000"),
                null, null, null,
                EquipmentType.DRY_VAN,
                new BigDecimal("1500"), PayRateType.FLAT_RATE,
                PaymentTerms.NET_15, null, null
        );
    }

    @Test
    void create_returns201() throws Exception {
        when(loadService.createLoad(any(), anyString())).thenReturn(stubLoad());

        mockMvc.perform(post("/api/v1/loads")
                        .with(authentication(shipperAuth()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("load-1"));
    }

    @Test
    void createDraft_returns201() throws Exception {
        when(loadService.createDraft(any(), anyString())).thenReturn(stubLoad());

        mockMvc.perform(post("/api/v1/loads/draft")
                        .with(authentication(shipperAuth()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("load-1"));
    }

    @Test
    void publish_returns200() throws Exception {
        when(loadService.publishLoad("load-1", USER_ID)).thenReturn(stubLoad());

        mockMvc.perform(post("/api/v1/loads/load-1/publish")
                        .with(authentication(shipperAuth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("OPEN"));
    }

    @Test
    void list_returnsPaginatedLoads() throws Exception {
        LocalDateTime soon = LocalDateTime.now().plusDays(1);
        LoadSummaryResponse summary = new LoadSummaryResponse(
                "load-1", LoadStatus.OPEN, "Chicago, IL", "New York, NY",
                BigDecimal.valueOf(800), soon, EquipmentType.DRY_VAN,
                new BigDecimal("1500"), PayRateType.FLAT_RATE, PaymentTerms.NET_15,
                soon.plusDays(1), null, null, 0L
        );
        when(loadService.listLoads(anyString(), anyInt(), anyInt()))
                .thenReturn(new PageImpl<>(List.of(summary), PageRequest.of(0, 20), 1));

        mockMvc.perform(get("/api/v1/loads")
                        .with(authentication(shipperAuth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value("load-1"));
    }

    @Test
    void getById_returns200() throws Exception {
        when(loadService.getLoad("load-1", USER_ID)).thenReturn(stubLoad());

        mockMvc.perform(get("/api/v1/loads/load-1")
                        .with(authentication(shipperAuth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("load-1"));
    }

    @Test
    void update_returns200() throws Exception {
        when(loadService.updateLoad(anyString(), any(), anyString())).thenReturn(stubLoad());

        LocalDateTime soon = LocalDateTime.now().plusDays(1);
        UpdateLoadRequest updateReq = new UpdateLoadRequest(
                "Chicago", "IL", "60601", "123 Main St", null,
                "New York", "NY", "10001", "456 Broadway", null,
                BigDecimal.valueOf(800),
                soon, soon.plusHours(4), soon.plusDays(1), soon.plusDays(1).plusHours(4),
                "Electronics", new BigDecimal("5000"),
                null, null, null,
                EquipmentType.DRY_VAN,
                new BigDecimal("1500"), PayRateType.FLAT_RATE,
                PaymentTerms.NET_15, null, null
        );

        mockMvc.perform(put("/api/v1/loads/load-1")
                        .with(authentication(shipperAuth()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk());
    }

    @Test
    void cancel_returns200() throws Exception {
        when(loadService.cancelLoad(eq("load-1"), eq(USER_ID), any())).thenReturn(stubLoad());

        mockMvc.perform(patch("/api/v1/loads/load-1/cancel")
                        .with(authentication(shipperAuth()))
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content("{\"reason\":\"No longer needed\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void claim_returns200() throws Exception {
        when(loadService.claimLoad("load-1", USER_ID)).thenReturn(stubLoad());

        // Claim endpoint requires TRUCKER role
        UsernamePasswordAuthenticationToken truckerAuth = new UsernamePasswordAuthenticationToken(
                USER_ID, null, List.of(new SimpleGrantedAuthority("ROLE_TRUCKER")));

        mockMvc.perform(post("/api/v1/loads/load-1/claim")
                        .with(authentication(truckerAuth)))
                .andExpect(status().isOk());
    }

    @Test
    void statusCounts_returnsMap() throws Exception {
        when(loadService.getLoadStatusCounts(USER_ID))
                .thenReturn(Map.of("OPEN", 3L, "DRAFT", 1L));

        mockMvc.perform(get("/api/v1/loads/counts")
                        .with(authentication(shipperAuth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.OPEN").value(3));
    }
}
