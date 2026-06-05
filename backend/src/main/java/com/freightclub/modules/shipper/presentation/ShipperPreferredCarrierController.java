package com.freightclub.modules.shipper.presentation;

import com.freightclub.domain.User;
import com.freightclub.modules.shipper.application.ShipperPreferredCarrierService;
import com.freightclub.modules.shipper.domain.ShipperPreferredCarrier;
import com.freightclub.repository.UserRepository;
import com.freightclub.security.TenantContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/shippers")
public class ShipperPreferredCarrierController {

  private final ShipperPreferredCarrierService service;
  private final UserRepository userRepository;

  public ShipperPreferredCarrierController(ShipperPreferredCarrierService service,
                                            UserRepository userRepository) {
    this.service = service;
    this.userRepository = userRepository;
  }

  @PostMapping("/preferred-carriers")
  @PreAuthorize("hasRole('SHIPPER')")
  public ResponseEntity<PreferredCarrierResponse> addPreferredCarrier(
      @RequestParam String carrierId,
      @RequestParam(required = false) String notes) {
    String shipperId = TenantContextHolder.getCurrentUserId();
    ShipperPreferredCarrier result = service.addPreferredCarrier(shipperId, carrierId, notes);
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(mapToResponse(result));
  }

  @GetMapping("/preferred-carriers")
  @PreAuthorize("hasRole('SHIPPER')")
  public ResponseEntity<?> getPreferredCarriers(
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "20") int limit) {
    String shipperId = TenantContextHolder.getCurrentUserId();
    Page<ShipperPreferredCarrier> carriers = service.getPreferredCarriers(shipperId, page - 1);

    return ResponseEntity.ok(java.util.Map.of(
        "data", carriers.getContent().stream().map(this::mapToResponse).toList(),
        "pagination", java.util.Map.of(
            "page", page,
            "limit", limit,
            "total", carriers.getTotalElements()
        )
    ));
  }

  @GetMapping("/preferred-carriers/count")
  @PreAuthorize("hasRole('SHIPPER')")
  public ResponseEntity<PreferredCarrierCountResponse> getPreferredCarrierCount() {
    String shipperId = TenantContextHolder.getCurrentUserId();
    long count = service.getPreferredCarrierCount(shipperId);
    return ResponseEntity.ok(new PreferredCarrierCountResponse(count));
  }

  @DeleteMapping("/preferred-carriers/{carrierId}")
  @PreAuthorize("hasRole('SHIPPER')")
  public ResponseEntity<Void> removePreferredCarrier(
      @PathVariable String carrierId) {
    String shipperId = TenantContextHolder.getCurrentUserId();
    service.removePreferredCarrier(shipperId, carrierId);
    return ResponseEntity.noContent().build();
  }

  private PreferredCarrierResponse mapToResponse(ShipperPreferredCarrier carrier) {
    User user = userRepository.findById(carrier.getCarrierId()).orElse(null);
    String carrierName = user != null
        ? user.getFirstName() + " " + user.getLastName()
        : carrier.getCarrierId();
    String carrierEmail = user != null ? user.getEmail() : null;

    return new PreferredCarrierResponse(
        carrier.getId(),
        carrier.getCarrierId(),
        carrierName,
        carrierEmail,
        carrier.getNotes(),
        carrier.getCreatedAt().toString());
  }

  public record PreferredCarrierResponse(
      String id,
      String carrierId,
      String carrierName,
      String carrierEmail,
      String notes,
      String createdAt) {}

  public record PreferredCarrierCountResponse(long count) {}
}
