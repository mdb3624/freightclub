package com.freightclub.modules.shipper.infrastructure.rest;

import com.freightclub.modules.shipper.application.ShipperProfileService;
import com.freightclub.modules.shipper.domain.ShipperProfile;
import com.freightclub.modules.shipper.infrastructure.rest.dto.ShipperProfileRequest;
import com.freightclub.modules.shipper.infrastructure.rest.dto.ShipperProfileResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/profile")
public class ShipperController {

    private final ShipperProfileService shipperProfileService;

    public ShipperController(ShipperProfileService shipperProfileService) {
        this.shipperProfileService = shipperProfileService;
    }

    @GetMapping
    public ResponseEntity<ShipperProfileResponse> getProfile() {
        var profile = shipperProfileService.getProfile();

        // If empty, return empty default (new shipper)
        if (profile.isEmpty()) {
            return ResponseEntity.ok(new ShipperProfileResponse(
                null, null, null, null, null, null, null, null, null, null, 0, null, null
            ));
        }

        return ResponseEntity.ok(mapToResponse(profile.get()));
    }

    @PostMapping("/company-info")
    public ResponseEntity<ShipperProfileResponse> saveProfile(@RequestBody ShipperProfileRequest request) {
        // Validation happens here
        validateRequest(request);

        ShipperProfile saved = shipperProfileService.saveProfile(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(saved));
    }

    @PutMapping("/company-info")
    public ResponseEntity<ShipperProfileResponse> updateProfile(@RequestBody ShipperProfileRequest request) {
        // Validation happens here
        validateRequest(request);

        ShipperProfile updated = shipperProfileService.saveProfile(request);
        return ResponseEntity.ok(mapToResponse(updated));
    }

    private void validateRequest(ShipperProfileRequest request) {
        // Company name: required, max 120 chars
        if (request.companyName() == null || request.companyName().isBlank()) {
            throw new IllegalArgumentException("Company name is required");
        }
        if (request.companyName().length() > 120) {
            throw new IllegalArgumentException("Company name must be ≤ 120 characters");
        }

        // Billing email: required, valid format
        if (request.billingEmail() == null || request.billingEmail().isBlank()) {
            throw new IllegalArgumentException("Billing email is required");
        }
        if (!isValidEmail(request.billingEmail())) {
            throw new IllegalArgumentException("Invalid email format");
        }

        // Phone: required, US format
        if (request.phoneNumber() == null || request.phoneNumber().isBlank()) {
            throw new IllegalArgumentException("Phone number is required");
        }
        if (!isValidUSPhone(request.phoneNumber())) {
            throw new IllegalArgumentException("Invalid US phone format. Use (XXX) XXX-XXXX, XXX-XXX-XXXX, or XXXXXXXXXX");
        }

        // City: required
        if (request.city() == null || request.city().isBlank()) {
            throw new IllegalArgumentException("City is required");
        }

        // State: required, 2 letters
        if (request.state() == null || request.state().isBlank() || request.state().length() != 2) {
            throw new IllegalArgumentException("State must be a 2-letter code");
        }

        // ZIP: required, 5 digits
        if (request.zipCode() == null || !request.zipCode().matches("\\d{5}")) {
            throw new IllegalArgumentException("ZIP code must be 5 digits");
        }

        // MC: optional, 6-8 digits if provided
        if (request.mcNumber() != null && !request.mcNumber().isBlank() && !request.mcNumber().matches("\\d{6,8}")) {
            throw new IllegalArgumentException("MC number must be 6-8 digits");
        }

        // USDOT: optional, 6-8 digits if provided
        if (request.usdotNumber() != null && !request.usdotNumber().isBlank() && !request.usdotNumber().matches("\\d{6,8}")) {
            throw new IllegalArgumentException("USDOT number must be 6-8 digits");
        }
    }

    private boolean isValidEmail(String email) {
        return email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    }

    private boolean isValidUSPhone(String phone) {
        // Accept formats: (XXX) XXX-XXXX, XXX-XXX-XXXX, XXXXXXXXXX
        return phone.matches("^(\\(\\d{3}\\) ?)?\\d{3}-?\\d{4}$|^\\d{10}$");
    }

    private ShipperProfileResponse mapToResponse(ShipperProfile profile) {
        return new ShipperProfileResponse(
            profile.id(),
            profile.companyName(),
            profile.billingEmail(),
            profile.phoneNumber(),
            profile.city(),
            profile.state(),
            profile.zipCode(),
            profile.mcNumber(),
            profile.usdotNumber(),
            profile.logoUrl(),
            profile.completenessPercent(),
            profile.createdAt() != null ? profile.createdAt().toString() : null,
            profile.updatedAt() != null ? profile.updatedAt().toString() : null
        );
    }
}
