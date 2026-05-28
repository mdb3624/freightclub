package com.freightclub.modules.load.application;

import com.freightclub.modules.load.domain.LoadAssignment;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class LoadAssignmentController {

  private final LoadAssignmentService service;

  public LoadAssignmentController(LoadAssignmentService service) {
    this.service = service;
  }

  @PostMapping("/loads/{loadId}/assign-to-carrier")
  public ResponseEntity<LoadAssignment> assignLoadToCarrier(
      @PathVariable String loadId,
      @RequestParam String carrierId,
      @RequestParam String shipperId) {
    try {
      LoadAssignment assignment = service.assignLoadToCarrier(loadId, carrierId, shipperId);
      return ResponseEntity.status(HttpStatus.CREATED).body(assignment);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().build();
    }
  }

  @PutMapping("/loads/{loadId}/assign-to-carrier")
  public ResponseEntity<LoadAssignment> reassignLoadToCarrier(
      @PathVariable String loadId,
      @RequestParam String newCarrierId,
      @RequestParam String shipperId) {
    try {
      LoadAssignment assignment = service.reassignLoadToCarrier(loadId, newCarrierId, shipperId);
      return ResponseEntity.ok(assignment);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().build();
    }
  }

  @GetMapping("/carriers/{carrierId}/assigned-loads")
  public ResponseEntity<Page<LoadAssignment>> getAssignedLoads(
      @PathVariable String carrierId,
      @RequestParam(defaultValue = "0") int page) {
    Page<LoadAssignment> assignments = service.getAssignedLoads(carrierId, page);
    return ResponseEntity.ok(assignments);
  }

  @GetMapping("/loads/{loadId}/assignment")
  public ResponseEntity<LoadAssignment> getAssignmentByLoad(@PathVariable String loadId) {
    Optional<LoadAssignment> assignment = service.getAssignmentByLoad(loadId);
    return assignment.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
  }

  @DeleteMapping("/loads/{loadId}/assignment")
  public ResponseEntity<Void> revokeAssignment(@PathVariable String loadId) {
    try {
      service.revokeAssignment(loadId);
      return ResponseEntity.noContent().build();
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().build();
    }
  }

  @PostMapping("/loads/{loadId}/assignment/accept")
  public ResponseEntity<Void> acceptAssignment(
      @PathVariable String loadId,
      @RequestParam String carrierId) {
    try {
      service.acceptAssignment(loadId, carrierId);
      return ResponseEntity.noContent().build();
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().build();
    }
  }
}
