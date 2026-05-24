package com.freightclub.modules.load.domain;

import com.freightclub.modules.load.application.CreateLoadCommand;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class LoadAggregate {

    private final String id;
    private final String tenantId;
    private final String shipperId;
    private final Weight weight;
    private final String originState;
    private final String destState;
    private LoadStatus status;
    private CarrierId carrierId;
    private String podUrl;
    private String cancelReason;
    private String equipmentType;
    private String originCity;
    private Money payRate;
    private PayRateType payRateType;
    private BigDecimal distanceMiles;

    private final List<DomainEvent> pendingEvents = new ArrayList<>();

    private LoadAggregate(String id, String tenantId, String shipperId, Weight weight,
                          String originState, String destState) {
        this.id = id;
        this.tenantId = tenantId;
        this.shipperId = shipperId;
        this.weight = weight;
        this.originState = originState;
        this.destState = destState;
        this.status = LoadStatus.DRAFT;
    }

    public static LoadAggregate create(String tenantId, String shipperId, CreateLoadCommand cmd) {
        LoadAggregate a = new LoadAggregate(
                UUID.randomUUID().toString(), tenantId, shipperId,
                Weight.of(cmd.weightLbs()), cmd.originState(), cmd.destState());
        if (cmd.payRate() != null) a.payRate = Money.of(cmd.payRate());
        a.payRateType = cmd.payRateType();
        a.distanceMiles = cmd.distanceMiles();
        return a;
    }

    /** Legacy factory for skeleton drafts without route information. */
    public static LoadAggregate create(String tenantId, String shipperId, Weight weight) {
        return new LoadAggregate(UUID.randomUUID().toString(), tenantId, shipperId, weight, null, null);
    }

    public static LoadAggregate reconstitute(
            String id, String tenantId, String shipperId,
            Weight weight, LoadStatus status,
            CarrierId carrierId, String podUrl, String cancelReason,
            String equipmentType, String originCity) {
        return reconstitute(id, tenantId, shipperId, weight, status,
                carrierId, podUrl, cancelReason, equipmentType, originCity,
                null, null, null, null, null);
    }

    public static LoadAggregate reconstitute(
            String id, String tenantId, String shipperId,
            Weight weight, LoadStatus status,
            CarrierId carrierId, String podUrl, String cancelReason,
            String equipmentType, String originCity,
            String originState, String destState,
            Money payRate, PayRateType payRateType, BigDecimal distanceMiles) {
        LoadAggregate a = new LoadAggregate(id, tenantId, shipperId, weight, originState, destState);
        a.status = status;
        a.carrierId = carrierId;
        a.podUrl = podUrl;
        a.cancelReason = cancelReason;
        a.equipmentType = equipmentType;
        a.originCity = originCity;
        a.payRate = payRate;
        a.payRateType = payRateType;
        a.distanceMiles = distanceMiles;
        return a;
    }

    public void publish() {
        if (status != LoadStatus.DRAFT) {
            throw new LoadDomainException("Only DRAFT loads can be published; current status: " + status);
        }
        status = LoadStatus.PUBLISHED;
        pendingEvents.add(new LoadPublishedEvent(id, tenantId, shipperId, equipmentType, originCity));
    }

    public void claim(CarrierId carrierId) {
        if (status != LoadStatus.PUBLISHED) {
            throw new LoadDomainException("Only PUBLISHED loads can be claimed; current status: " + status);
        }
        this.carrierId = carrierId;
        this.status = LoadStatus.CLAIMED;
        pendingEvents.add(new LoadClaimedEvent(id, carrierId, tenantId));
    }

    public void startTrip() {
        if (status != LoadStatus.CLAIMED) {
            throw new LoadDomainException("Only CLAIMED loads can start a trip; current status: " + status);
        }
        status = LoadStatus.IN_TRANSIT;
    }

    public void cancel(String reason) {
        if (status == LoadStatus.DELIVERED || status == LoadStatus.CANCELLED) {
            throw new LoadDomainException("Cannot cancel a load in status: " + status);
        }
        this.status = LoadStatus.CANCELLED;
        this.cancelReason = reason;
    }

    public void completeDelivery(String podUrl) {
        if (status != LoadStatus.IN_TRANSIT) {
            throw new LoadDomainException("Only IN_TRANSIT loads can be delivered; current status: " + status);
        }
        if (podUrl == null || podUrl.isBlank()) {
            throw new LoadDomainException("Proof of Delivery (POD) URL is required to complete delivery");
        }
        this.podUrl = podUrl;
        this.status = LoadStatus.DELIVERED;
        pendingEvents.add(new LoadDeliveredDomainEvent(id, carrierId, tenantId, podUrl));
    }

    // ── Analytics ─────────────────────────────────────────────────────────────

    /** Returns flat rate, or rate × distance for PER_MILE loads. Zero when unprice. */
    public Money calculateTotalPayout() {
        if (payRate == null) return Money.of(BigDecimal.ZERO);
        if (payRateType == PayRateType.PER_MILE && distanceMiles != null) {
            return Money.of(payRate.amount().multiply(distanceMiles));
        }
        return payRate;
    }

    /** Total payout divided by distance. Requires distanceMiles to be set. */
    public Money getProfitPerMile() {
        if (distanceMiles == null || distanceMiles.compareTo(BigDecimal.ZERO) == 0) {
            throw new LoadDomainException("Distance miles required for per-mile profit calculation");
        }
        return Money.of(calculateTotalPayout().amount()
                .divide(distanceMiles, 2, RoundingMode.HALF_UP));
    }

    /** Drains and returns all pending domain events. Call once per transaction. */
    public List<DomainEvent> pullDomainEvents() {
        List<DomainEvent> snapshot = List.copyOf(pendingEvents);
        pendingEvents.clear();
        return snapshot;
    }

    public String getId()                  { return id; }
    public String getTenantId()            { return tenantId; }
    public String getShipperId()           { return shipperId; }
    public LoadStatus getStatus()          { return status; }
    public Weight getWeight()              { return weight; }
    public CarrierId getCarrierId()        { return carrierId; }
    public String getPodUrl()              { return podUrl; }
    public String getCancelReason()        { return cancelReason; }
    public String getEquipmentType()       { return equipmentType; }
    public String getOriginCity()          { return originCity; }
    public String getOriginState()         { return originState; }
    public String getDestState()           { return destState; }
    public Money getPayRate()              { return payRate; }
    public PayRateType getPayRateType()    { return payRateType; }
    public BigDecimal getDistanceMiles()   { return distanceMiles; }
}
