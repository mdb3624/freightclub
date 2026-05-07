package com.freightclub.controller;

import com.freightclub.dto.ProfileResponse;
import com.freightclub.dto.UpdateProfileRequest;
import com.freightclub.modules.carrier.application.CarrierProfileService;
import com.freightclub.modules.carrier.application.CarrierAvailabilityDTO;
import com.freightclub.modules.carrier.application.CarrierEquipmentDTO;
import com.freightclub.modules.carrier.application.CarrierLaneDTO;
import com.freightclub.modules.carrier.application.PublicCarrierProfileDTO;
import com.freightclub.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/profile")
public class ProfileController {

    private final ProfileService profileService;
    private final CarrierProfileService carrierProfileService;

    public ProfileController(ProfileService profileService, CarrierProfileService carrierProfileService) {
        this.profileService = profileService;
        this.carrierProfileService = carrierProfileService;
    }

    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile(@AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(profileService.getProfile(userId));
    }

    @PutMapping
    public ResponseEntity<ProfileResponse> updateProfile(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(profileService.updateProfile(userId, request));
    }

    // --- Equipment ---

    @GetMapping("/equipment")
    public ResponseEntity<List<CarrierEquipmentDTO>> getEquipment(@AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(carrierProfileService.getEquipment(userId));
    }

    @PostMapping("/equipment")
    public ResponseEntity<CarrierEquipmentDTO> addEquipment(
            @AuthenticationPrincipal String userId,
            @RequestBody CarrierEquipmentDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(carrierProfileService.addEquipment(userId, dto));
    }

    @PutMapping("/equipment/{id}")
    public ResponseEntity<CarrierEquipmentDTO> updateEquipment(
            @AuthenticationPrincipal String userId,
            @PathVariable String id,
            @RequestBody CarrierEquipmentDTO dto) {
        CarrierEquipmentDTO withId = new CarrierEquipmentDTO(
                id, dto.equipmentType(), dto.lengthFeet(), dto.widthFeet(), dto.heightFeet(),
                dto.capacityLbs(), dto.equipmentCondition(), dto.yearModel(), dto.status(), dto.createdAt());
        return ResponseEntity.ok(carrierProfileService.updateEquipment(userId, withId));
    }

    @DeleteMapping("/equipment/{id}")
    public ResponseEntity<Void> deleteEquipment(
            @AuthenticationPrincipal String userId,
            @PathVariable String id) {
        carrierProfileService.deleteEquipment(userId, id);
        return ResponseEntity.noContent().build();
    }

    // --- Lanes ---

    @GetMapping("/lanes")
    public ResponseEntity<List<CarrierLaneDTO>> getLanes(@AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(carrierProfileService.getLanes(userId));
    }

    @PostMapping("/lanes")
    public ResponseEntity<CarrierLaneDTO> addLane(
            @AuthenticationPrincipal String userId,
            @RequestBody CarrierLaneDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(carrierProfileService.addLane(userId, dto));
    }

    @PutMapping("/lanes/{id}")
    public ResponseEntity<CarrierLaneDTO> updateLane(
            @AuthenticationPrincipal String userId,
            @PathVariable String id,
            @RequestBody CarrierLaneDTO dto) {
        CarrierLaneDTO withId = new CarrierLaneDTO(
                id, dto.originRegion(), dto.destinationRegion(), dto.minRateCents(),
                dto.frequencyPreference(), dto.status(), dto.createdAt());
        return ResponseEntity.ok(carrierProfileService.updateLane(userId, withId));
    }

    @DeleteMapping("/lanes/{id}")
    public ResponseEntity<Void> deleteLane(
            @AuthenticationPrincipal String userId,
            @PathVariable String id) {
        carrierProfileService.deleteLane(userId, id);
        return ResponseEntity.noContent().build();
    }

    // --- Availability ---

    @GetMapping("/availability")
    public ResponseEntity<CarrierAvailabilityDTO> getAvailability(@AuthenticationPrincipal String userId) {
        CarrierAvailabilityDTO result = carrierProfileService.getAvailability(userId);
        return result != null ? ResponseEntity.ok(result) : ResponseEntity.noContent().build();
    }

    @PutMapping("/availability")
    public ResponseEntity<CarrierAvailabilityDTO> setAvailability(
            @AuthenticationPrincipal String userId,
            @RequestBody CarrierAvailabilityDTO dto) {
        return ResponseEntity.ok(carrierProfileService.setAvailability(userId, dto));
    }

    // --- Public profile ---

    @GetMapping("/carrier/{truckerId}")
    public ResponseEntity<PublicCarrierProfileDTO> getPublicProfile(@PathVariable String truckerId) {
        return ResponseEntity.ok(carrierProfileService.getPublicProfile(truckerId));
    }
}
