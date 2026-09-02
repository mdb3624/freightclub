package com.freightclub.controller;

import com.freightclub.dto.PlatformHealthResponse;
import com.freightclub.service.PlatformHealthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PlatformHealthControllerTest {

    @MockBean private PlatformHealthService platformHealthService;

    @Autowired private MockMvc mockMvc;

    private static RequestPostProcessor superUser(String id) {
        return authentication(new UsernamePasswordAuthenticationToken(
                id, null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))));
    }

    private static RequestPostProcessor plainShipper(String id) {
        return authentication(new UsernamePasswordAuthenticationToken(
                id, null, List.of(new SimpleGrantedAuthority("ROLE_SHIPPER"))));
    }

    @Test
    void getHealth_ok_forSuperUser() throws Exception {
        when(platformHealthService.getHealth()).thenReturn(new PlatformHealthResponse(true, 500L, 3L));

        mockMvc.perform(get("/api/v1/super-user/health").with(superUser("admin-1")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.backendHealthy").value(true));
    }

    @Test
    void getHealth_forbidden_forPlainShipper() throws Exception {
        mockMvc.perform(get("/api/v1/super-user/health").with(plainShipper("shipper-1")))
                .andExpect(status().isForbidden());

        verify(platformHealthService, never()).getHealth();
    }
}
