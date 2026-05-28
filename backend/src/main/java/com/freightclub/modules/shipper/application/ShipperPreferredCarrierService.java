package com.freightclub.modules.shipper.application;

import com.freightclub.modules.shipper.domain.ShipperPreferredCarrier;
import com.freightclub.modules.shipper.infrastructure.ShipperPreferredCarrierRepository;
import com.freightclub.security.TenantContextHolder;
import java.time.OffsetDateTime;
import java.util.List;
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
public class ShipperPreferredCarrierService {

  private final ShipperPreferredCarrierRepository repository;

  public ShipperPreferredCarrierService(ShipperPreferredCarrierRepository repository) {
    this.repository = repository;
  }

  @CacheEvict(value = "preferredCarriers", allEntries = true)
  public ShipperPreferredCarrier addPreferredCarrier(
      String shipperId, String carrierId, String notes) {
    String tenantId = TenantContextHolder.getTenantId();

    Optional<ShipperPreferredCarrier> existing =
        repository.findByShipperCarrierAndTenant(tenantId, shipperId, carrierId);
    if (existing.isPresent() && existing.get().getDeletedAt() == null) {
      throw new IllegalArgumentException("Carrier already in preferred list");
    }

    ShipperPreferredCarrier preferred =
        new ShipperPreferredCarrier(
            UUID.randomUUID().toString(), shipperId, carrierId, tenantId, notes);
    return repository.save(preferred);
  }

  @Transactional(readOnly = true)
  @Cacheable(
      value = "preferredCarriers",
      key = "#shipperId + ':' + T(com.freightclub.security.TenantContextHolder).getTenantId()")
  public Page<ShipperPreferredCarrier> getPreferredCarriers(String shipperId, int page) {
    String tenantId = TenantContextHolder.getTenantId();
    Pageable pageable = PageRequest.of(page, 20);
    return repository.findByShipperAndTenant(tenantId, shipperId, pageable);
  }

  @CacheEvict(value = "preferredCarriers", allEntries = true)
  public void removePreferredCarrier(String shipperId, String carrierId) {
    String tenantId = TenantContextHolder.getTenantId();

    Optional<ShipperPreferredCarrier> preferred =
        repository.findByShipperCarrierAndTenant(tenantId, shipperId, carrierId);
    if (preferred.isEmpty()) {
      throw new IllegalArgumentException("Carrier not found in preferred list");
    }

    ShipperPreferredCarrier spc = preferred.get();
    spc.setDeletedAt(OffsetDateTime.now());
    repository.save(spc);
  }

  @Transactional(readOnly = true)
  @Cacheable(
      value = "preferredCarriers",
      key = "#shipperId + ':count:' + T(com.freightclub.security.TenantContextHolder).getTenantId()")
  public long getPreferredCarrierCount(String shipperId) {
    String tenantId = TenantContextHolder.getTenantId();
    return repository.countByShipperAndTenant(tenantId, shipperId);
  }

  @Transactional(readOnly = true)
  public List<ShipperPreferredCarrier> getAllPreferredCarriers(String shipperId) {
    String tenantId = TenantContextHolder.getTenantId();
    return repository.findAllByShipperAndTenant(tenantId, shipperId);
  }
}
