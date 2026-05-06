package com.freightclub.modules.shipper.application;

import com.freightclub.security.TenantContextHolder;
import com.freightclub.modules.shipper.domain.ShipperReputation;
import com.freightclub.modules.shipper.infrastructure.ShipperReputationEntity;
import com.freightclub.modules.shipper.infrastructure.ShipperReputationRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class ShipperService {

  private final ShipperReputationRepository reputationRepository;

  public ShipperService(ShipperReputationRepository reputationRepository) {
    this.reputationRepository = reputationRepository;
  }

  @Cacheable(value = "shipperReputation", key = "#shipperId", unless = "#result == null")
  public ShipperReputation getShipperReputation(String shipperId) {
    String tenantId = TenantContextHolder.getTenantId();
    ShipperReputationEntity entity =
        reputationRepository.findByTenantIdAndShipperIdAndDeletedAtIsNull(tenantId, shipperId);
    return entity != null ? entity.toDomain() : null;
  }

  @CacheEvict(value = "shipperReputation", key = "#shipperId")
  public void updateShipperReputation(
      String shipperId,
      BigDecimal averagePaymentSpeedDays,
      int completedLoadCount,
      int cancelledLoadCount,
      int openDisputeCount) {
    String tenantId = TenantContextHolder.getTenantId();
    ShipperReputationEntity entity =
        reputationRepository.findByTenantIdAndShipperIdAndDeletedAtIsNull(tenantId, shipperId);

    if (entity != null) {
      ShipperReputation reputation = entity.toDomain();
      reputation.updateMetrics(
          averagePaymentSpeedDays, completedLoadCount, cancelledLoadCount, openDisputeCount);
      entity = new ShipperReputationEntity(reputation);
    } else {
      ShipperReputation reputation =
          ShipperReputation.createNew(
              tenantId,
              shipperId,
              averagePaymentSpeedDays,
              completedLoadCount,
              cancelledLoadCount,
              openDisputeCount);
      entity = new ShipperReputationEntity(reputation);
    }
    reputationRepository.save(entity);
  }

  public String getPaymentSpeedLabel(String shipperId) {
    ShipperReputation reputation = getShipperReputation(shipperId);
    if (reputation == null) {
      return "Not rated";
    }
    return reputation.getPaymentSpeedLabel();
  }

  public int calculateAveragePaymentSpeedDays(
      java.util.List<java.util.Map<String, Object>> recentPayments) {
    if (recentPayments == null || recentPayments.isEmpty()) {
      return 0;
    }

    BigDecimal sum = BigDecimal.ZERO;
    for (java.util.Map<String, Object> payment : recentPayments) {
      Object daysDiff = payment.get("days_to_payment");
      if (daysDiff instanceof Number) {
        sum = sum.add(new BigDecimal(((Number) daysDiff).doubleValue()));
      }
    }

    BigDecimal avg =
        sum.divide(
            new BigDecimal(recentPayments.size()), 1, RoundingMode.HALF_UP);
    return avg.intValue();
  }
}
