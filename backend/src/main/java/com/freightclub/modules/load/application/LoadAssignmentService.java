package com.freightclub.modules.load.application;

import com.freightclub.modules.load.domain.LoadAssignment;
import com.freightclub.modules.load.infrastructure.LoadAssignmentRepository;
import com.freightclub.security.TenantContextHolder;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class LoadAssignmentService {

  private final LoadAssignmentRepository repository;

  public LoadAssignmentService(LoadAssignmentRepository repository) {
    this.repository = repository;
  }

  @CacheEvict(value = "assignedLoads", allEntries = true)
  public LoadAssignment assignLoadToCarrier(
      String loadId,
      String carrierId,
      String shipperId) {
    String tenantId = TenantContextHolder.getTenantId();

    Optional<LoadAssignment> existing =
        repository.findByLoadAndTenant(loadId, tenantId);
    if (existing.isPresent()) {
      throw new IllegalArgumentException("Load is already assigned to a carrier");
    }

    LoadAssignment assignment = new LoadAssignment(
        UUID.randomUUID().toString(),
        loadId,
        tenantId,
        carrierId,
        shipperId);

    // TODO: Publish LoadAssignedToCarrier event for notifications
    return repository.save(assignment);
  }

  @CacheEvict(value = "assignedLoads", allEntries = true)
  public LoadAssignment reassignLoadToCarrier(
      String loadId,
      String newCarrierId,
      String shipperId) {
    String tenantId = TenantContextHolder.getTenantId();

    Optional<LoadAssignment> existing =
        repository.findByLoadAndTenant(loadId, tenantId);
    if (existing.isEmpty()) {
      throw new IllegalArgumentException("Load is not assigned to any carrier");
    }

    LoadAssignment assignment = existing.get();
    String oldCarrierId = assignment.getAssignedCarrierId();
    assignment.setAssignedCarrierId(newCarrierId);
    assignment.setAssignedAt(OffsetDateTime.now());

    // TODO: Publish events for old and new carrier notifications
    return repository.save(assignment);
  }

  @CacheEvict(value = "assignedLoads", allEntries = true)
  public void revokeAssignment(String loadId) {
    String tenantId = TenantContextHolder.getTenantId();

    Optional<LoadAssignment> assignment =
        repository.findByLoadAndTenant(loadId, tenantId);
    if (assignment.isEmpty()) {
      throw new IllegalArgumentException("Load is not assigned");
    }

    LoadAssignment la = assignment.get();
    la.setDeletedAt(OffsetDateTime.now());
    repository.save(la);

    // TODO: Publish LoadAssignmentRevoked event
  }

  @Transactional(readOnly = true)
  @Cacheable(
      value = "assignedLoads",
      key = "#carrierId + ':' + T(com.freightclub.security.TenantContextHolder).getTenantId()")
  public Page<LoadAssignment> getAssignedLoads(String carrierId, int page) {
    String tenantId = TenantContextHolder.getTenantId();
    Pageable pageable = PageRequest.of(page, 20);
    return repository.findByCarrierAndTenant(carrierId, tenantId, pageable);
  }

  @Transactional(readOnly = true)
  public Optional<LoadAssignment> getAssignmentByLoad(String loadId) {
    String tenantId = TenantContextHolder.getTenantId();
    return repository.findByLoadAndTenant(loadId, tenantId);
  }

  public void acceptAssignment(String loadId, String carrierId) {
    String tenantId = TenantContextHolder.getTenantId();

    Optional<LoadAssignment> assignment =
        repository.findByLoadAndTenant(loadId, tenantId);
    if (assignment.isEmpty()) {
      throw new IllegalArgumentException("Load assignment not found");
    }

    LoadAssignment la = assignment.get();
    if (!la.getAssignedCarrierId().equals(carrierId)) {
      throw new IllegalArgumentException("Carrier is not assigned to this load");
    }

    la.setAcceptedByCarrier(true);
    la.setAcceptedAt(OffsetDateTime.now());
    repository.save(la);

    // TODO: Publish LoadAssignmentAccepted event
  }
}
