package com.freightclub.infrastructure.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching
public class CacheConfig {

  @Bean
  public CacheManager cacheManager() {
    // NFR-504 cache definitions
    return new ConcurrentMapCacheManager(
        "notifications",       // NotificationService pagination cache
        "documentAudit",       // AC-308-8: Document audit trail (5m TTL)
        "carrierEquipment",    // AC-701: Carrier equipment listing (1h TTL)
        "carrierLanes",        // AC-702: Carrier lane preferences (1h TTL)
        "carrierAvailability", // AC-703: Carrier availability windows (30m TTL)
        "shipperReputation",   // US-712: Shipper payment speed metrics (1h TTL)
        "carrierCostProfile"   // US-702/730: Cost profile calculations (1h TTL)
    );
  }
}
