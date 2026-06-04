package com.freightclub.modules.carrier.presentation;

import com.freightclub.modules.carrier.application.CarrierProfileService;
import com.freightclub.modules.carrier.application.CarrierSearchResult;
import com.freightclub.modules.carrier.application.CarrierSearchService;
import com.freightclub.modules.carrier.application.PublicCarrierProfileDTO;
import com.freightclub.security.TenantContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/carriers")
@PreAuthorize("hasRole('SHIPPER')")
public class CarrierPublicProfileController {

  private final CarrierProfileService carrierProfileService;
  private final CarrierSearchService carrierSearchService;

  public CarrierPublicProfileController(CarrierProfileService carrierProfileService,
                                        CarrierSearchService carrierSearchService) {
    this.carrierProfileService = carrierProfileService;
    this.carrierSearchService = carrierSearchService;
  }

  @GetMapping("/{carrierId}/public-profile")
  public ResponseEntity<PublicCarrierProfileDTO> getPublicProfile(
      @PathVariable String carrierId) {
    PublicCarrierProfileDTO profile = carrierProfileService.getPublicProfile(carrierId);
    return ResponseEntity.ok(profile);
  }

  // AC-v2-2: Search carriers by name or email within the shipper's tenant
  @GetMapping("/search")
  public ResponseEntity<List<CarrierSearchResult>> searchCarriers(
      @RequestParam String q) {
    String tenantId = TenantContextHolder.getTenantId();
    List<CarrierSearchResult> results = carrierSearchService.searchCarriers(tenantId, q);
    return ResponseEntity.ok(results);
  }
}
