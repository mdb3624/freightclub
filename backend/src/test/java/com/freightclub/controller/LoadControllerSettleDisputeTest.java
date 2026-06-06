package com.freightclub.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.freightclub.domain.LoadStatus;
import com.freightclub.dto.LoadResponse;
import com.freightclub.service.LoadService;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// US-506: SETTLED Load Status & Workflow — controller integration tests
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class LoadControllerSettleDisputeTest {

    @MockBean
    private LoadService loadService;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private static RequestPostProcessor shipper(String id) {
        return authentication(new UsernamePasswordAuthenticationToken(
                id, null, List.of(new SimpleGrantedAuthority("ROLE_SHIPPER"))));
    }

    private static RequestPostProcessor trucker(String id) {
        return authentication(new UsernamePasswordAuthenticationToken(
                id, null, List.of(new SimpleGrantedAuthority("ROLE_TRUCKER"))));
    }

    private LoadResponse settledResponse() {
        return new LoadResponse(
                "load-1", "tenant-1", "shipper-1", null, LoadStatus.SETTLED,
                null, null, null, null, null,
                null, null, null, null, null,
                null, null, null, null, null,
                null, null, null, null, null,
                null, null, null, null, null,
                null, null, null, null, null, null,
                null, null
        );
    }

    private LoadResponse disputedResponse() {
        return new LoadResponse(
                "load-1", "tenant-1", "shipper-1", null, LoadStatus.DISPUTED,
                null, null, null, null, null,
                null, null, null, null, null,
                null, null, null, null, null,
                null, null, null, null, null,
                null, null, null, null, null,
                null, null, null, "Cargo was damaged", null, null,
                null, null
        );
    }

    @Nested
    class SettleLoad {

        // US-506 AC-1: Shipper can settle a DELIVERED load
        @Test
        void settle_asShipper_returns200() throws Exception {
            when(loadService.settleLoad(eq("load-1"), any())).thenReturn(settledResponse());

            mockMvc.perform(patch("/api/v1/loads/load-1/settle").with(shipper("shipper-1")))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("SETTLED"));
        }

        // US-506 AC-3: Trucker cannot settle (SHIPPER role required)
        @Test
        void settle_asTrucker_returns403() throws Exception {
            mockMvc.perform(patch("/api/v1/loads/load-1/settle").with(trucker("trucker-1")))
                    .andExpect(status().isForbidden());
        }

        // US-506 AC-4: Cannot settle a load not in DELIVERED status
        @Test
        void settle_wrongStatus_returns403() throws Exception {
            when(loadService.settleLoad(eq("load-1"), any()))
                    .thenThrow(new IllegalStateException("Load must be DELIVERED to settle"));

            mockMvc.perform(patch("/api/v1/loads/load-1/settle").with(shipper("shipper-1")))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    class DisputeLoad {

        // US-506 AC-2: Shipper can dispute a DELIVERED load with reason
        @Test
        void dispute_asShipper_returns200() throws Exception {
            when(loadService.disputeLoad(eq("load-1"), any(), eq("Cargo was damaged")))
                    .thenReturn(disputedResponse());

            mockMvc.perform(patch("/api/v1/loads/load-1/dispute")
                            .with(shipper("shipper-1"))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(Map.of("reason", "Cargo was damaged"))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("DISPUTED"))
                    .andExpect(jsonPath("$.disputeReason").value("Cargo was damaged"));
        }

        // US-506 AC-3: Trucker cannot dispute (SHIPPER role required)
        @Test
        void dispute_asTrucker_returns403() throws Exception {
            mockMvc.perform(patch("/api/v1/loads/load-1/dispute")
                            .with(trucker("trucker-1"))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(Map.of("reason", "Some reason"))))
                    .andExpect(status().isForbidden());
        }

        // US-506 AC-6: Blank dispute reason is rejected
        @Test
        void dispute_blankReason_returns400() throws Exception {
            mockMvc.perform(patch("/api/v1/loads/load-1/dispute")
                            .with(shipper("shipper-1"))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(Map.of("reason", ""))))
                    .andExpect(status().isBadRequest());
        }
    }
}
