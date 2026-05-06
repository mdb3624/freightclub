package com.freightclub.modules.shipper.application;

import org.springframework.cache.CacheManager;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class ShipperReputationCacheInvalidator {

  private final CacheManager cacheManager;

  public ShipperReputationCacheInvalidator(CacheManager cacheManager) {
    this.cacheManager = cacheManager;
  }

  @EventListener
  public void onPaymentConfirmed(PaymentConfirmedEvent event) {
    invalidateShipperCache(event.getShipperId());
  }

  @EventListener
  public void onRatingSubmitted(RatingSubmittedEvent event) {
    invalidateShipperCache(event.getShipperId());
  }

  @EventListener
  public void onLoadCancelled(LoadCancelledEvent event) {
    invalidateShipperCache(event.getShipperId());
  }

  private void invalidateShipperCache(String shipperId) {
    var cache = cacheManager.getCache("shipperReputation");
    if (cache != null) {
      cache.evict(shipperId);
    }
  }

  // Event classes (package-private domain events)

  public static class PaymentConfirmedEvent {
    private final String shipperId;

    public PaymentConfirmedEvent(String shipperId) {
      this.shipperId = shipperId;
    }

    public String getShipperId() {
      return shipperId;
    }
  }

  public static class RatingSubmittedEvent {
    private final String shipperId;

    public RatingSubmittedEvent(String shipperId) {
      this.shipperId = shipperId;
    }

    public String getShipperId() {
      return shipperId;
    }
  }

  public static class LoadCancelledEvent {
    private final String shipperId;

    public LoadCancelledEvent(String shipperId) {
      this.shipperId = shipperId;
    }

    public String getShipperId() {
      return shipperId;
    }
  }
}
