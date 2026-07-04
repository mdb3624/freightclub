package com.freightclub.controller;

import com.freightclub.dto.PaymentStatusResponse;
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

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class LoadBoardControllerPaymentStatusTest {

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

    // US-730f AC-1: Trucker can view payment status for a delivered load
    @Test
    void getPaymentStatus_withInvoice_returns200() throws Exception {
        when(paymentService.getPaymentStatus(eq("load-1"), eq("trucker-1")))
                .thenReturn(Optional.of(new PaymentStatusResponse("PAID", OffsetDateTime.parse("2026-07-05T10:00:00Z"), 21000L)));

        mockMvc.perform(get("/api/v1/board/load-1/payment").with(trucker("trucker-1")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PAID"))
                .andExpect(jsonPath("$.truckerPayoutCents").value(21000));
    }

    // US-730f AC-2: No invoice yet (load not delivered) returns 204, not an error
    @Test
    void getPaymentStatus_noInvoiceYet_returns204() throws Exception {
        when(paymentService.getPaymentStatus(eq("load-1"), eq("trucker-1")))
                .thenReturn(Optional.empty());

        mockMvc.perform(get("/api/v1/board/load-1/payment").with(trucker("trucker-1")))
                .andExpect(status().isNoContent());
    }
}
