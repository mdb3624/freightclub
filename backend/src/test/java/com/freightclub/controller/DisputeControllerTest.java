package com.freightclub.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.freightclub.dto.RaiseDisputeRequest;
import com.freightclub.service.DisputeService;
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

import static org.mockito.Mockito.verify;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class DisputeControllerTest {

    @MockBean private DisputeService disputeService;

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    private static RequestPostProcessor shipper(String id) {
        return authentication(new UsernamePasswordAuthenticationToken(
                id, null, List.of(new SimpleGrantedAuthority("ROLE_SHIPPER"))));
    }

    @Test
    void raiseDispute_created_forAuthenticatedUser() throws Exception {
        mockMvc.perform(post("/api/v1/disputes").with(shipper("shipper-1"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RaiseDisputeRequest("load-1", "Load arrived damaged"))))
                .andExpect(status().isCreated());

        verify(disputeService).raiseDispute("shipper-1", new RaiseDisputeRequest("load-1", "Load arrived damaged"));
    }

    @Test
    void raiseDispute_badRequest_whenReasonBlank() throws Exception {
        mockMvc.perform(post("/api/v1/disputes").with(shipper("shipper-1"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RaiseDisputeRequest("load-1", ""))))
                .andExpect(status().isBadRequest());
    }
}
