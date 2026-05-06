package com.freightclub.modules.carrier.application;

import com.freightclub.security.TenantContextHolder;
import com.freightclub.modules.carrier.domain.BlockedCarrier;
import com.freightclub.modules.carrier.domain.PreferredCarrier;
import com.freightclub.modules.carrier.infrastructure.BlockedCarrierEntity;
import com.freightclub.modules.carrier.infrastructure.BlockedCarrierRepository;
import com.freightclub.modules.carrier.infrastructure.PreferredCarrierEntity;
import com.freightclub.modules.carrier.infrastructure.PreferredCarrierRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class PreferredCarrierService {
  private final PreferredCarrierRepository preferredRepository;
  private final BlockedCarrierRepository blockedRepository;

  public PreferredCarrierService(
      PreferredCarrierRepository preferredRepository,
      BlockedCarrierRepository blockedRepository) {
    this.preferredRepository = preferredRepository;
    this.blockedRepository = blockedRepository;
  }

  public PreferredCarrierDTO addPreferred(String shipperId, String truckerId) {
    String tenantId = TenantContextHolder.getTenantId();

    PreferredCarrier domain = PreferredCarrier.createPreferred(tenantId, shipperId, truckerId);
    PreferredCarrierEntity entity = PreferredCarrierEntity.fromDomain(domain);
    PreferredCarrierEntity saved = preferredRepository.save(entity);

    return toPreferredDTO(saved.toDomain());
  }

  public List<PreferredCarrierDTO> getPreferredCarriers(String shipperId) {
    String tenantId = TenantContextHolder.getTenantId();
    return preferredRepository
        .findByTenantIdAndShipperIdAndDeletedAtIsNull(tenantId, shipperId)
        .stream()
        .map(entity -> toPreferredDTO(entity.toDomain()))
        .toList();
  }

  public void removePreferred(String shipperId, String truckerId) {
    String tenantId = TenantContextHolder.getTenantId();
    preferredRepository
        .findByTenantIdAndShipperIdAndTruckerIdAndDeletedAtIsNull(tenantId, shipperId, truckerId)
        .ifPresent(entity -> {
          PreferredCarrier domain = entity.toDomain();
          domain.softDelete();
          preferredRepository.save(PreferredCarrierEntity.fromDomain(domain));
        });
  }

  public BlockedCarrierDTO blockCarrier(String shipperId, String truckerId) {
    String tenantId = TenantContextHolder.getTenantId();

    BlockedCarrier domain = BlockedCarrier.blockCarrier(tenantId, shipperId, truckerId);
    BlockedCarrierEntity entity = BlockedCarrierEntity.fromDomain(domain);
    BlockedCarrierEntity saved = blockedRepository.save(entity);

    return toBlockedDTO(saved.toDomain());
  }

  public void unblockCarrier(String shipperId, String truckerId) {
    String tenantId = TenantContextHolder.getTenantId();
    blockedRepository
        .findActiveBlock(tenantId, shipperId, truckerId)
        .ifPresent(entity -> {
          BlockedCarrier domain = entity.toDomain();
          domain.unblock();
          blockedRepository.save(BlockedCarrierEntity.fromDomain(domain));
        });
  }

  public boolean isCarrierBlocked(String shipperId, String truckerId) {
    String tenantId = TenantContextHolder.getTenantId();
    return blockedRepository.isBlocked(tenantId, shipperId, truckerId);
  }

  public boolean isPreferred(String shipperId, String truckerId) {
    String tenantId = TenantContextHolder.getTenantId();
    return preferredRepository.isPreferred(tenantId, shipperId, truckerId);
  }

  private PreferredCarrierDTO toPreferredDTO(PreferredCarrier domain) {
    return new PreferredCarrierDTO(
        domain.getId(),
        domain.getTenantId(),
        domain.getShipperId(),
        domain.getTruckerId(),
        domain.getAddedAt());
  }

  private BlockedCarrierDTO toBlockedDTO(BlockedCarrier domain) {
    return new BlockedCarrierDTO(
        domain.getId(),
        domain.getTenantId(),
        domain.getShipperId(),
        domain.getTruckerId(),
        domain.getBlockedAt(),
        domain.getUnblockedAt());
  }
}
