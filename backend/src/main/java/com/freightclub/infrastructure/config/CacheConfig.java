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
        "loads",               // SEC-001: Load detail caching (tenant-aware key)
        "notifications",       // NotificationService pagination cache
        "notificationCount",   // NotificationService unread count
        "documentAudit",       // AC-308-8: Document audit trail (5m TTL)
        "carrierEquipment",    // AC-701: Carrier equipment listing (1h TTL)
        "carrierLanes",        // AC-702: Carrier lane preferences (1h TTL)
        "carrierAvailability", // AC-703: Carrier availability windows (30m TTL)
        "shipperReputation",   // US-712: Shipper payment speed metrics (1h TTL)
        "shipperRatings",      // RatingService: batch shipper rating summaries for load board
        "ratingList",          // RatingService: per-load and per-user rating lists
        "ratingSummary",       // RatingService: trucker/shipper rating summaries
        "carrierCostProfile",  // US-702/730: Cost profile calculations (1h TTL)
        "documents",           // DocumentService: BOL/document lookup by loadId+tenant
        "carrierProfiles",     // CarrierProfileService: public profile lookup (1h TTL)
        // Phase 7: Financial Intelligence & Analytics
        "assignedLoads",       // US-708: Direct load assignment cache (5m TTL)
        "blockedCarriers",     // US-709: Blocked carrier list (1h TTL)
        "preferredCarriers",   // US-707: Preferred carrier list (1h TTL)
        "loadAnalytics",       // US-704: Load analytics dashboard (5-30m TTL)
        "carrierPerformance",  // US-705: Carrier performance metrics (1-4h TTL)
        "loadFinancial",       // US-706: Load financial tracking (1h TTL)
        "loadViews",           // US-711: Load view tracking (5m TTL)
        "carrierProfileViews"  // US-711: Carrier profile view tracking (5m TTL)
    );
  }
}
