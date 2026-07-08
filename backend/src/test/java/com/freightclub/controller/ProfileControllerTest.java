package com.freightclub.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.freightclub.domain.CdlClass;
import com.freightclub.dto.ProfileResponse;
import com.freightclub.modules.carrier.application.*;
import com.freightclub.modules.carrier.domain.*;
import com.freightclub.service.ProfileService;
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

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProfileControllerTest {

    @MockBean private ProfileService profileService;
    @MockBean private CarrierProfileService carrierProfileService;

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    private static RequestPostProcessor trucker(String id) {
        return authentication(new UsernamePasswordAuthenticationToken(
                id, null, List.of(new SimpleGrantedAuthority("ROLE_TRUCKER"))));
    }

    private static RequestPostProcessor shipper(String id) {
        return authentication(new UsernamePasswordAuthenticationToken(
                id, null, List.of(new SimpleGrantedAuthority("ROLE_SHIPPER"))));
    }

    private CarrierEquipmentDTO sampleEquipment() {
        return new CarrierEquipmentDTO("eq-1", EquipmentType.FLATBED, 48, 8, 6, 45000,
                EquipmentCondition.GOOD, "2022", EquipmentStatus.ACTIVE, OffsetDateTime.now());
    }

    private CarrierLaneDTO sampleLane() {
        return new CarrierLaneDTO("lane-1", "Southeast", "California", 175L,
                FrequencyPreference.WEEKLY, LaneStatus.ACTIVE, OffsetDateTime.now());
    }

    private CarrierAvailabilityDTO sampleAvailability() {
        return new CarrierAvailabilityDTO("av-1", AvailableDays.MON_FRI,
                LocalTime.of(6, 0), LocalTime.of(22, 0), "EST", false, OffsetDateTime.now());
    }

    // Profile

    @Test
    void getProfile_includesCarrierIdentityCredentialsFields() throws Exception {
        when(profileService.getProfile("trucker-1")).thenReturn(
            new ProfileResponse(
                "trucker-1", "jake@example.com", "Jake", "Morrison", "TRUCKER", "tenant-1",
                null, null, null, "(512) 555-0182",
                null, null, null, null, null,
                null, null, null, null, null,
                true, true, true,
                "MC-772341", "TX-4821", com.freightclub.domain.EquipmentType.DRY_VAN,
                "2019", "Freightliner", "Cascadia", "TX-4821", null,
                CdlClass.CLASS_A, LocalDate.of(2027, 8, 15),
                "Progressive Commercial", LocalDate.of(2026, 10, 1), LocalDate.of(2026, 12, 1),
                null, null, null, null, null, null,
                null, null, null, null, null, null
            )
        );

        mockMvc.perform(get("/api/v1/profile").with(trucker("trucker-1")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.equipmentYear").value("2019"))
                .andExpect(jsonPath("$.cdlClass").value("CLASS_A"))
                .andExpect(jsonPath("$.cdlExpiry").value("2027-08-15"))
                .andExpect(jsonPath("$.insuranceCarrier").value("Progressive Commercial"));
    }

    // Equipment

    @Test
    void getEquipment_returns200() throws Exception {
        when(carrierProfileService.getEquipment("trucker-1")).thenReturn(List.of(sampleEquipment()));

        mockMvc.perform(get("/api/v1/profile/equipment").with(trucker("trucker-1")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("eq-1"));
    }

    @Test
    void addEquipment_returns201() throws Exception {
        when(carrierProfileService.addEquipment(eq("trucker-1"), any())).thenReturn(sampleEquipment());

        mockMvc.perform(post("/api/v1/profile/equipment").with(trucker("trucker-1"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleEquipment())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("eq-1"));
    }

    @Test
    void updateEquipment_returns200() throws Exception {
        when(carrierProfileService.updateEquipment(eq("trucker-1"), any())).thenReturn(sampleEquipment());

        mockMvc.perform(put("/api/v1/profile/equipment/eq-1").with(trucker("trucker-1"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleEquipment())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("eq-1"));
    }

    @Test
    void deleteEquipment_returns204() throws Exception {
        doNothing().when(carrierProfileService).deleteEquipment("trucker-1", "eq-1");

        mockMvc.perform(delete("/api/v1/profile/equipment/eq-1").with(trucker("trucker-1")))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteEquipment_notOwned_returns403() throws Exception {
        doThrow(new IllegalStateException("Equipment does not belong to this trucker"))
                .when(carrierProfileService).deleteEquipment("trucker-1", "eq-99");

        mockMvc.perform(delete("/api/v1/profile/equipment/eq-99").with(trucker("trucker-1")))
                .andExpect(status().isForbidden());
    }

    @Test
    void deleteEquipment_notFound_returns400() throws Exception {
        doThrow(new IllegalArgumentException("Equipment not found"))
                .when(carrierProfileService).deleteEquipment("trucker-1", "eq-missing");

        mockMvc.perform(delete("/api/v1/profile/equipment/eq-missing").with(trucker("trucker-1")))
                .andExpect(status().isBadRequest());
    }

    // Lanes

    @Test
    void getLanes_returns200() throws Exception {
        when(carrierProfileService.getLanes("trucker-1")).thenReturn(List.of(sampleLane()));

        mockMvc.perform(get("/api/v1/profile/lanes").with(trucker("trucker-1")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("lane-1"));
    }

    @Test
    void addLane_returns201() throws Exception {
        when(carrierProfileService.addLane(eq("trucker-1"), any())).thenReturn(sampleLane());

        mockMvc.perform(post("/api/v1/profile/lanes").with(trucker("trucker-1"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleLane())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.originRegion").value("Southeast"));
    }

    @Test
    void updateLane_returns200() throws Exception {
        when(carrierProfileService.updateLane(eq("trucker-1"), any())).thenReturn(sampleLane());

        mockMvc.perform(put("/api/v1/profile/lanes/lane-1").with(trucker("trucker-1"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleLane())))
                .andExpect(status().isOk());
    }

    @Test
    void deleteLane_returns204() throws Exception {
        doNothing().when(carrierProfileService).deleteLane("trucker-1", "lane-1");

        mockMvc.perform(delete("/api/v1/profile/lanes/lane-1").with(trucker("trucker-1")))
                .andExpect(status().isNoContent());
    }

    // Availability

    @Test
    void getAvailability_returns200() throws Exception {
        when(carrierProfileService.getAvailability("trucker-1")).thenReturn(sampleAvailability());

        mockMvc.perform(get("/api/v1/profile/availability").with(trucker("trucker-1")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.timeZone").value("EST"));
    }

    @Test
    void getAvailability_notSet_returns204() throws Exception {
        when(carrierProfileService.getAvailability("trucker-1")).thenReturn(null);

        mockMvc.perform(get("/api/v1/profile/availability").with(trucker("trucker-1")))
                .andExpect(status().isNoContent());
    }

    @Test
    void setAvailability_returns200() throws Exception {
        when(carrierProfileService.setAvailability(eq("trucker-1"), any())).thenReturn(sampleAvailability());

        mockMvc.perform(put("/api/v1/profile/availability").with(trucker("trucker-1"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleAvailability())))
                .andExpect(status().isOk());
    }

    // Public profile

    @Test
    void getPublicProfile_returns200() throws Exception {
        PublicCarrierProfileDTO profile = new PublicCarrierProfileDTO(
                "trucker-1", List.of(sampleEquipment()), List.of(sampleLane()), sampleAvailability());
        when(carrierProfileService.getPublicProfile("trucker-1")).thenReturn(profile);

        mockMvc.perform(get("/api/v1/profile/carrier/trucker-1").with(shipper("shipper-1")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.truckerId").value("trucker-1"));
    }
}
