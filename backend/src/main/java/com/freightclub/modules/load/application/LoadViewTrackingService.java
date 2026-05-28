package com.freightclub.modules.load.application;

import com.freightclub.modules.load.domain.LoadView;
import com.freightclub.modules.load.infrastructure.LoadViewRepository;
import com.freightclub.security.TenantContextHolder;
import java.util.UUID;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class LoadViewTrackingService {

  private final LoadViewRepository repository;

  public LoadViewTrackingService(LoadViewRepository repository) {
    this.repository = repository;
  }

  public void recordLoadView(String loadId, String carrierId) {
    String tenantId = TenantContextHolder.getTenantId();

    LoadView view = new LoadView(
        UUID.randomUUID().toString(),
        loadId,
        carrierId,
        tenantId);

    repository.save(view);
  }

  @Transactional(readOnly = true)
  @Cacheable(
      value = "loadViewCounts",
      key = "#loadId + ':' + T(com.freightclub.security.TenantContextHolder).getTenantId()")
  public long getLoadViewCount(String loadId) {
    String tenantId = TenantContextHolder.getTenantId();
    return repository.countByLoadAndTenant(loadId, tenantId);
  }

  @Transactional(readOnly = true)
  @Cacheable(
      value = "loadInterest",
      key = "#loadId + ':' + T(com.freightclub.security.TenantContextHolder).getTenantId()")
  public long getLoadInterest(String loadId) {
    String tenantId = TenantContextHolder.getTenantId();
    return repository.countUniqueCarriersViewedLoad(loadId, tenantId);
  }
}
