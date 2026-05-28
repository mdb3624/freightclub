package com.freightclub.modules.shipper.application;

import com.freightclub.modules.shipper.domain.BlockedCarrier;
import com.freightclub.modules.shipper.infrastructure.BlockedCarrierRepository;
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
public class BlockedCarrierService {

  private final BlockedCarrierRepository repository;

  public BlockedCarrierService(BlockedCarrierRepository repository) {
    this.repository = repository;
  }

  @CacheEvict(value = "blockedCarriers", allEntries = true)
  public BlockedCarrier blockCarrier(
      String shipperId,
      String carrierId,
      String reason) {
    String tenantId = TenantContextHolder.getTenantId();

    Optional<BlockedCarrier> existing =
        repository.findByShipperCarrierAndTenant(shipperId, carrierId, tenantId);
    if (existing.isPresent()) {
      throw new IllegalArgumentException("Carrier is already blocked");
    }

    BlockedCarrier blocked = new BlockedCarrier(
        UUID.randomUUID().toString(),
        shipperId,
        carrierId,
        tenantId,
        reason);

    return repository.save(blocked);
  }

  @CacheEvict(value = "blockedCarriers", allEntries = true)
  public void unblockCarrier(String shipperId, String carrierId) {
    String tenantId = TenantContextHolder.getTenantId();

    Optional<BlockedCarrier> existing =
        repository.findByShipperCarrierAndTenant(shipperId, carrierId, tenantId);
    if (existing.isEmpty()) {
      throw new IllegalArgumentException("Carrier is not blocked");
    }

    BlockedCarrier blocked = existing.get();
    blocked.setDeletedAt(OffsetDateTime.now());
    repository.save(blocked);
  }

  @Transactional(readOnly = true)
  @Cacheable(
      value = "blockedCarriers",
      key = "#shipperId + ':' + T(com.freightclub.security.TenantContextHolder).getTenantId()")
  public Page<BlockedCarrier> getBlockedCarriers(String shipperId, int page) {
    String tenantId = TenantContextHolder.getTenantId();
    Pageable pageable = PageRequest.of(page, 20);
    return repository.findByShipperAndTenant(shipperId, tenantId, pageable);
  }

  @Transactional(readOnly = true)
  public long getBlockedCarrierCount(String shipperId) {
    String tenantId = TenantContextHolder.getTenantId();
    return repository.countByShipperAndTenant(shipperId, tenantId);
  }

  @Transactional(readOnly = true)
  public boolean isCarrierBlocked(String shipperId, String carrierId) {
    String tenantId = TenantContextHolder.getTenantId();
    return repository.isCarrierBlocked(shipperId, carrierId, tenantId);
  }
}
