package com.freightclub.infrastructure.security;

import com.freightclub.domain.User;
import com.freightclub.domain.UserRole;
import com.freightclub.modules.load.application.ports.in.LoadUseCase;
import com.freightclub.modules.load.domain.LoadAggregate;
import com.freightclub.modules.load.domain.LoadStatus;
import com.freightclub.modules.load.domain.Weight;
import com.freightclub.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityIntegrationTest {

    private static final String TENANT_ID = UUID.randomUUID().toString();
    private static final String USER_ID   = UUID.randomUUID().toString();

    @Autowired MockMvc mockMvc;
    @Autowired JwtService jwtService;

    // Mock service layer so no database is touched
    @MockBean LoadUseCase loadUseCase;
    // The legacy LoadService is also in context — mock it to satisfy the full app context
    @MockBean com.freightclub.service.LoadService loadService;

    private String validToken;

    @BeforeEach
    void setUp() {
        User user = mock(User.class);
        when(user.getId()).thenReturn(USER_ID);
        when(user.getEmail()).thenReturn("shipper@test.com");
        when(user.getRole()).thenReturn(UserRole.SHIPPER);
        when(user.getTenantId()).thenReturn(TENANT_ID);

        validToken = jwtService.generateAccessToken(user);

        LoadAggregate stubLoad = mock(LoadAggregate.class);
        when(stubLoad.getId()).thenReturn("load-1");
        when(stubLoad.getTenantId()).thenReturn(TENANT_ID);
        when(stubLoad.getShipperId()).thenReturn("shipper-1");
        when(stubLoad.getStatus()).thenReturn(LoadStatus.DRAFT);
        when(stubLoad.getWeight()).thenReturn(Weight.of(BigDecimal.valueOf(1000)));

        when(loadUseCase.createDraft(anyString(), anyString(), any(BigDecimal.class)))
                .thenReturn(stubLoad);
    }

    @Test
    void validRs256Jwt_allowsAccess_andPropagatesTenantId() throws Exception {
        mockMvc.perform(post("/api/v2/loads")
                        .header("Authorization", "Bearer " + validToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"shipperId\":\"shipper-1\",\"weightLbs\":1000}"))
                .andExpect(status().isCreated());

        verify(loadUseCase).createDraft(eq(TENANT_ID), anyString(), any(BigDecimal.class));
    }

    @Test
    void tamperedJwt_returns401() throws Exception {
        String tampered = validToken.substring(0, validToken.lastIndexOf('.') + 1) + "invalidsignature";

        mockMvc.perform(post("/api/v2/loads")
                        .header("Authorization", "Bearer " + tampered)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"shipperId\":\"shipper-1\",\"weightLbs\":1000}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void missingJwt_returns401() throws Exception {
        mockMvc.perform(post("/api/v2/loads")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"shipperId\":\"shipper-1\",\"weightLbs\":1000}"))
                .andExpect(status().isUnauthorized());
    }
}
