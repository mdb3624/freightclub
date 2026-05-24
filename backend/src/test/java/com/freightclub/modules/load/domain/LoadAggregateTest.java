package com.freightclub.modules.load.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import com.freightclub.modules.load.domain.DomainEvent;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class LoadAggregateTest {

    private static final String TENANT  = "tenant-1";
    private static final String SHIPPER = "shipper-1";
    private static final CarrierId CARRIER = CarrierId.of("carrier-abc");
    private static final String POD_URL = "https://storage.example.com/pod/receipt.pdf";

    // ── Weight Value Object ───────────────────────────────────────────────────

    @Test
    @DisplayName("Weight rejects zero lbs")
    void weight_rejects_zero() {
        assertThatThrownBy(() -> Weight.of(BigDecimal.ZERO))
                .isInstanceOf(LoadDomainException.class)
                .hasMessageContaining("greater than zero");
    }

    @Test
    @DisplayName("Weight rejects negative lbs")
    void weight_rejects_negative() {
        assertThatThrownBy(() -> Weight.of(new BigDecimal("-1")))
                .isInstanceOf(LoadDomainException.class);
    }

    @Test
    @DisplayName("Weight accepts a positive value")
    void weight_accepts_positive() {
        Weight w = Weight.of(new BigDecimal("1000"));
        assertThat(w.lbs()).isEqualByComparingTo("1000");
    }

    // ── CarrierId Value Object ────────────────────────────────────────────────

    @Test
    @DisplayName("CarrierId rejects blank value")
    void carrierId_rejects_blank() {
        assertThatThrownBy(() -> CarrierId.of(""))
                .isInstanceOf(LoadDomainException.class);
        assertThatThrownBy(() -> CarrierId.of("   "))
                .isInstanceOf(LoadDomainException.class);
    }

    @Test
    @DisplayName("CarrierId.newId() produces a non-blank id")
    void carrierId_new_id_is_not_blank() {
        assertThat(CarrierId.newId().value()).isNotBlank();
    }

    // ── Publish invariant ─────────────────────────────────────────────────────

    @Test
    @DisplayName("[RED→GREEN] publish() fails when weight is zero — invariant guard")
    void shouldFailToPublishWhenWeightIsZero() {
        assertThatThrownBy(() -> {
            Weight zeroWeight = Weight.of(BigDecimal.ZERO);
            LoadAggregate.create(TENANT, SHIPPER, zeroWeight).publish();
        })
                .isInstanceOf(LoadDomainException.class)
                .hasMessageContaining("greater than zero");
    }

    @Test
    @DisplayName("publish() transitions DRAFT → PUBLISHED")
    void shouldTransitionToPublishedFromDraft() {
        LoadAggregate load = validDraftLoad();
        load.publish();
        assertThat(load.getStatus()).isEqualTo(LoadStatus.PUBLISHED);
    }

    @Test
    @DisplayName("publish() rejects a non-DRAFT load")
    void shouldRejectDoublePublish() {
        LoadAggregate load = validDraftLoad();
        load.publish();
        assertThatThrownBy(load::publish)
                .isInstanceOf(LoadDomainException.class)
                .hasMessageContaining("DRAFT");
    }

    // ── Claim invariants ──────────────────────────────────────────────────────

    @Test
    @DisplayName("shouldFailWhenClaimingDraftLoad — DRAFT cannot be claimed")
    void shouldFailWhenClaimingDraftLoad() {
        assertThatThrownBy(() -> validDraftLoad().claim(CARRIER))
                .isInstanceOf(LoadDomainException.class)
                .hasMessageContaining("PUBLISHED");
    }

    @Test
    @DisplayName("shouldSucceedWhenClaimingPublishedLoad — assigns carrierId and transitions to CLAIMED")
    void shouldSucceedWhenClaimingPublishedLoad() {
        LoadAggregate load = publishedLoad();

        load.claim(CARRIER);

        assertThat(load.getStatus()).isEqualTo(LoadStatus.CLAIMED);
        assertThat(load.getCarrierId()).isEqualTo(CARRIER);
    }

    @Test
    @DisplayName("claim() emits a LoadClaimedEvent with correct data")
    void shouldEmitLoadClaimedEventOnClaim() {
        LoadAggregate load = publishedLoad();
        load.claim(CARRIER);

        List<DomainEvent> events = load.pullDomainEvents();

        assertThat(events).hasSize(1);
        assertThat(events.get(0)).isInstanceOfSatisfying(LoadClaimedEvent.class, e -> {
            assertThat(e.carrierId()).isEqualTo(CARRIER);
            assertThat(e.tenantId()).isEqualTo(TENANT);
            assertThat(e.loadId()).isEqualTo(load.getId());
        });
    }

    @Test
    @DisplayName("pullDomainEvents() drains the list — second call returns empty")
    void pullDomainEvents_drainsOnce() {
        LoadAggregate load = publishedLoad();
        load.claim(CARRIER);

        load.pullDomainEvents();
        assertThat(load.pullDomainEvents()).isEmpty();
    }

    @Test
    @DisplayName("no domain events on a load that has not been claimed")
    void noDomainEventsOnUnclaimedLoad() {
        assertThat(publishedLoad().pullDomainEvents()).isEmpty();
    }

    // ── startTrip invariants ──────────────────────────────────────────────────

    @Test
    @DisplayName("[RED] shouldSucceedWhenTransitioningToInTransit — CLAIMED → IN_TRANSIT")
    void shouldSucceedWhenTransitioningToInTransit() {
        LoadAggregate load = claimedLoad();

        load.startTrip();

        assertThat(load.getStatus()).isEqualTo(LoadStatus.IN_TRANSIT);
    }

    @Test
    @DisplayName("startTrip() rejects a PUBLISHED load — must be CLAIMED first")
    void shouldFailStartTripWhenNotClaimed() {
        LoadAggregate load = publishedLoad();
        assertThatThrownBy(load::startTrip)
                .isInstanceOf(LoadDomainException.class)
                .hasMessageContaining("CLAIMED");
    }

    @Test
    @DisplayName("startTrip() rejects a DRAFT load")
    void shouldFailStartTripFromDraft() {
        assertThatThrownBy(() -> validDraftLoad().startTrip())
                .isInstanceOf(LoadDomainException.class)
                .hasMessageContaining("CLAIMED");
    }

    // ── cancel invariants ─────────────────────────────────────────────────────

    @Test
    @DisplayName("cancel() transitions DRAFT → CANCELLED and stores reason")
    void cancel_fromDraft_succeeds() {
        LoadAggregate load = validDraftLoad();
        load.cancel("shipper changed plans");
        assertThat(load.getStatus()).isEqualTo(LoadStatus.CANCELLED);
        assertThat(load.getCancelReason()).isEqualTo("shipper changed plans");
    }

    @Test
    @DisplayName("cancel() transitions PUBLISHED → CANCELLED")
    void cancel_fromPublished_succeeds() {
        LoadAggregate load = publishedLoad();
        load.cancel("no drivers available");
        assertThat(load.getStatus()).isEqualTo(LoadStatus.CANCELLED);
    }

    @Test
    @DisplayName("cancel() rejects a DELIVERED load — terminal state")
    void cancel_fromDelivered_throws() {
        LoadAggregate load = inTransitLoad();
        load.completeDelivery(POD_URL);
        assertThatThrownBy(() -> load.cancel("too late"))
                .isInstanceOf(LoadDomainException.class)
                .hasMessageContaining("DELIVERED");
    }

    @Test
    @DisplayName("cancel() rejects an already-CANCELLED load — idempotency guard")
    void cancel_fromCancelled_throws() {
        LoadAggregate load = validDraftLoad();
        load.cancel("first cancellation");
        assertThatThrownBy(() -> load.cancel("second cancellation"))
                .isInstanceOf(LoadDomainException.class)
                .hasMessageContaining("CANCELLED");
    }

    // ── completeDelivery invariants ───────────────────────────────────────────

    @Test
    @DisplayName("[RED] shouldFailToDeliverWithoutPOD — null pod reference rejected")
    void shouldFailToDeliverWithoutPOD() {
        LoadAggregate load = inTransitLoad();

        assertThatThrownBy(() -> load.completeDelivery(null))
                .isInstanceOf(LoadDomainException.class)
                .hasMessageContaining("Proof of Delivery");
    }

    @Test
    @DisplayName("shouldFailToDeliverWithoutPOD — blank pod reference rejected")
    void shouldFailToDeliverWithBlankPOD() {
        LoadAggregate load = inTransitLoad();

        assertThatThrownBy(() -> load.completeDelivery("  "))
                .isInstanceOf(LoadDomainException.class)
                .hasMessageContaining("Proof of Delivery");
    }

    @Test
    @DisplayName("[RED] shouldFailToDeliverIfStillPublished — cannot skip CLAIMED/IN_TRANSIT")
    void shouldFailToDeliverIfStillPublished() {
        LoadAggregate load = publishedLoad();

        assertThatThrownBy(() -> load.completeDelivery(POD_URL))
                .isInstanceOf(LoadDomainException.class)
                .hasMessageContaining("IN_TRANSIT");
    }

    @Test
    @DisplayName("shouldFailToDeliverIfClaimed — must be IN_TRANSIT before DELIVERED")
    void shouldFailToDeliverIfClaimed() {
        LoadAggregate load = claimedLoad();

        assertThatThrownBy(() -> load.completeDelivery(POD_URL))
                .isInstanceOf(LoadDomainException.class)
                .hasMessageContaining("IN_TRANSIT");
    }

    @Test
    @DisplayName("completeDelivery() transitions IN_TRANSIT → DELIVERED and stores POD URL")
    void shouldTransitionToDeliveredFromInTransit() {
        LoadAggregate load = inTransitLoad();

        load.completeDelivery(POD_URL);

        assertThat(load.getStatus()).isEqualTo(LoadStatus.DELIVERED);
        assertThat(load.getPodUrl()).isEqualTo(POD_URL);
    }

    @Test
    @DisplayName("completeDelivery() emits a LoadDeliveredDomainEvent with correct data")
    void shouldEmitLoadDeliveredEventOnDelivery() {
        LoadAggregate load = inTransitLoad();
        load.completeDelivery(POD_URL);

        List<DomainEvent> events = load.pullDomainEvents();

        assertThat(events).hasSize(1);
        assertThat(events.get(0)).isInstanceOfSatisfying(LoadDeliveredDomainEvent.class, e -> {
            assertThat(e.loadId()).isEqualTo(load.getId());
            assertThat(e.carrierId()).isEqualTo(CARRIER);
            assertThat(e.tenantId()).isEqualTo(TENANT);
            assertThat(e.podUrl()).isEqualTo(POD_URL);
        });
    }

    // ── Factory / initial state ───────────────────────────────────────────────

    @Test
    @DisplayName("new load starts in DRAFT status with no carrier or POD assigned")
    void newLoadStartsAsDraft() {
        LoadAggregate load = validDraftLoad();
        assertThat(load.getStatus()).isEqualTo(LoadStatus.DRAFT);
        assertThat(load.getCarrierId()).isNull();
        assertThat(load.getPodUrl()).isNull();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private LoadAggregate validDraftLoad() {
        return LoadAggregate.create(TENANT, SHIPPER, Weight.of(new BigDecimal("45000")));
    }

    private LoadAggregate publishedLoad() {
        LoadAggregate load = validDraftLoad();
        load.publish();
        load.pullDomainEvents(); // drain publish event — mirrors real outbox flow
        return load;
    }

    private LoadAggregate claimedLoad() {
        LoadAggregate load = publishedLoad();
        load.claim(CARRIER);
        load.pullDomainEvents(); // drain claim event so delivery assertions are clean
        return load;
    }

    private LoadAggregate inTransitLoad() {
        LoadAggregate load = claimedLoad();
        load.startTrip();
        return load;
    }
}
