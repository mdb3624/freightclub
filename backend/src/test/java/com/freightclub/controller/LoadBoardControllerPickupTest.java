package com.freightclub.controller;

import com.freightclub.modules.payment.application.PaymentService;
import com.freightclub.service.LoadService;
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

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class LoadBoardControllerPickupTest {

    @MockBean
    private LoadService loadService;

    @MockBean
    private PaymentService paymentService;

    @Autowired
    private MockMvc mockMvc;

    private static RequestPostProcessor trucker(String id) {
        return authentication(new UsernamePasswordAuthenticationToken(
                id, null, List.of(new SimpleGrantedAuthority("ROLE_TRUCKER"))));
    }

    // US-302-v2: trucker can submit exception notes/photo on pickup via multipart
    @Test
    void markPickedUp_acceptsMultipartExceptionNotes() throws Exception {
        when(loadService.markPickedUp(eq("load-1"), eq("trucker-1"), eq("Damaged pallet"), any()))
                .thenReturn(null);

        mockMvc.perform(multipart("/api/v1/board/load-1/pickup")
                        .param("exceptionNotes", "Damaged pallet")
                        .with(trucker("trucker-1")))
                .andExpect(status().isOk());
    }
}
