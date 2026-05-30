package com.freightclub.modules.carrier.presentation;

import com.freightclub.modules.carrier.application.CarrierProfileService;
import com.freightclub.modules.carrier.application.PublicCarrierProfileDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/carriers")
@PreAuthorize("hasRole('SHIPPER')")
public class CarrierPublicProfileController {

  private final CarrierProfileService carrierProfileService;

  public CarrierPublicProfileController(CarrierProfileService carrierProfileService) {
    this.carrierProfileService = carrierProfileService;
  }

  @GetMapping("/{carrierId}/public-profile")
  public ResponseEntity<PublicCarrierProfileDTO> getPublicProfile(
      @PathVariable String carrierId) {
    PublicCarrierProfileDTO profile = carrierProfileService.getPublicProfile(carrierId);
    return ResponseEntity.ok(profile);
  }
}
