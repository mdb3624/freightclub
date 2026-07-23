package com.freightclub.modules.load.infrastructure.rest;

import com.freightclub.modules.load.application.LoadNotFoundException;
import com.freightclub.modules.load.application.ports.in.LoadUseCase;
import com.freightclub.modules.load.domain.CarrierId;
import com.freightclub.modules.load.domain.LoadAggregate;
import com.freightclub.modules.load.domain.LoadStatus;
import com.freightclub.modules.load.domain.Weight;
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

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// PROJECT_AUDIT_2026-07-23 item 1: /api/v2/loads had zero authorization checks —
// any authenticated user of any role/tenant-mate could publish/claim/cancel/start/deliver
// any load. These tests pin the fix: role gating (SecurityConfig) + per-load ownership
// (LoadApplicationService), mirroring the legacy /api/v1/loads controller's pattern.
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class LoadControllerTest {

    @MockBean
    private LoadUseCase loadUseCase;

    @Autowired
    private MockMvc mockMvc;

    private static RequestPostProcessor shipper(String id) {
        return org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication(
                new UsernamePasswordAuthenticationToken(
                        id, null, List.of(new SimpleGrantedAuthority("ROLE_SHIPPER"))));
    }

    private static RequestPostProcessor trucker(String id) {
        return org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication(
                new UsernamePasswordAuthenticationToken(
                        id, null, List.of(new SimpleGrantedAuthority("ROLE_TRUCKER"))));
    }

    private LoadAggregate mockLoad(String shipperId, String carrierId, LoadStatus status) {
        LoadAggregate load = mock(LoadAggregate.class);
        when(load.getId()).thenReturn("load-1");
        when(load.getShipperId()).thenReturn(shipperId);
        when(load.getCarrierId()).thenReturn(carrierId != null ? CarrierId.of(carrierId) : null);
        when(load.getStatus()).thenReturn(status);
        when(load.getWeight()).thenReturn(Weight.of(BigDecimal.valueOf(1000)));
        return load;
    }

    @Test
    void publish_wrongRole_isForbidden() throws Exception {
        mockMvc.perform(put("/api/v2/loads/load-1/publish").with(trucker("trucker-1")))
                .andExpect(status().isForbidden());
    }

    @Test
    void publish_rightRoleButNotOwner_returns404NotAuthorizationLeak() throws Exception {
        // "shipper-2" is authenticated but the load belongs to "shipper-1" — must not
        // be able to distinguish "not yours" from "doesn't exist" (anti-enumeration).
        when(loadUseCase.publish(eq("load-1"), eq("shipper-2")))
                .thenThrow(new LoadNotFoundException("load-1"));

        mockMvc.perform(put("/api/v2/loads/load-1/publish").with(shipper("shipper-2")))
                .andExpect(status().isNotFound());
    }

    @Test
    void publish_owner_succeeds() throws Exception {
        LoadAggregate published = mockLoad("shipper-1", null, LoadStatus.PUBLISHED);
        when(loadUseCase.publish(eq("load-1"), eq("shipper-1"))).thenReturn(published);

        mockMvc.perform(put("/api/v2/loads/load-1/publish").with(shipper("shipper-1")))
                .andExpect(status().isOk());

        verify(loadUseCase).publish("load-1", "shipper-1");
    }

    @Test
    void claim_wrongRole_isForbidden() throws Exception {
        mockMvc.perform(put("/api/v2/loads/load-1/claim").with(shipper("shipper-1")))
                .andExpect(status().isForbidden());
    }

    @Test
    void claim_usesAuthenticatedPrincipal_notAnyClientSuppliedId() throws Exception {
        LoadAggregate claimed = mockLoad("shipper-1", "trucker-1", LoadStatus.CLAIMED);
        when(loadUseCase.claim(eq("load-1"), eq("trucker-1"))).thenReturn(claimed);

        mockMvc.perform(put("/api/v2/loads/load-1/claim").with(trucker("trucker-1")))
                .andExpect(status().isOk());

        // Prior to the fix this endpoint took carrierId from the request body,
        // letting a trucker claim a load "as" a different trucker.
        verify(loadUseCase).claim("load-1", "trucker-1");
    }

    @Test
    void cancel_notOwningShipper_returns404() throws Exception {
        when(loadUseCase.cancelLoad(eq("load-1"), eq("shipper-2"), any()))
                .thenThrow(new LoadNotFoundException("load-1"));

        mockMvc.perform(put("/api/v2/loads/load-1/cancel").with(shipper("shipper-2")))
                .andExpect(status().isNotFound());
    }

    @Test
    void startTrip_wrongRole_isForbidden() throws Exception {
        mockMvc.perform(put("/api/v2/loads/load-1/start-trip").with(shipper("shipper-1")))
                .andExpect(status().isForbidden());
    }

    @Test
    void startTrip_notAssignedCarrier_returns404() throws Exception {
        when(loadUseCase.startTrip(eq("load-1"), eq("trucker-2")))
                .thenThrow(new LoadNotFoundException("load-1"));

        mockMvc.perform(put("/api/v2/loads/load-1/start-trip").with(trucker("trucker-2")))
                .andExpect(status().isNotFound());
    }

    @Test
    void deliver_assignedCarrier_succeeds() throws Exception {
        LoadAggregate delivered = mockLoad("shipper-1", "trucker-1", LoadStatus.DELIVERED);
        when(loadUseCase.completeDelivery(eq("load-1"), eq("trucker-1"), anyString())).thenReturn(delivered);

        mockMvc.perform(put("/api/v2/loads/load-1/deliver")
                        .with(trucker("trucker-1"))
                        .contentType(MediaType.TEXT_PLAIN)
                        .content("https://example.com/pod.jpg"))
                .andExpect(status().isOk());

        verify(loadUseCase).completeDelivery("load-1", "trucker-1", "https://example.com/pod.jpg");
    }
}
