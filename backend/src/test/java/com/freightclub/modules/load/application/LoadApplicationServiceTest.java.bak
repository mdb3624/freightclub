package com.freightclub.modules.load.application;

import com.freightclub.modules.load.application.ports.out.DomainEventPublisher;
import com.freightclub.modules.load.application.ports.out.LoadRepositoryPort;
import com.freightclub.modules.load.domain.CarrierId;
import com.freightclub.modules.load.domain.LoadAggregate;
import com.freightclub.modules.load.domain.LoadStatus;
import com.freightclub.modules.load.domain.Weight;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LoadApplicationServiceTest {

    @Mock
    private LoadRepositoryPort repository;
    @Mock
    private DomainEventPublisher eventPublisher;

    private LoadApplicationService service;

    private static final String TENANT   = "tenant-1";
    private static final String SHIPPER  = "shipper-1";
    private static final String LOAD_ID  = "load-abc";
    private static final String CARRIER  = "carrier-x";

    @BeforeEach
    void setUp() {
        service = new LoadApplicationService(repository, eventPublisher);
    }

    // ── createDraft ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("createDraft saves a new DRAFT aggregate and returns it")
    void createDraft_savesAndReturns() {
        LoadAggregate saved = draftAggregate();
        when(repository.save(any())).thenReturn(saved);

        LoadAggregate result = service.createDraft(TENANT, SHIPPER, BigDecimal.valueOf(5000));

        ArgumentCaptor<LoadAggregate> captor = ArgumentCaptor.forClass(LoadAggregate.class);
        verify(repository).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(LoadStatus.DRAFT);
        assertThat(captor.getValue().getTenantId()).isEqualTo(TENANT);
        assertThat(result).isSameAs(saved);
    }

    // ── publish ───────────────────────────────────────────────────────────────

    @Test
    @DisplayName("publish loads the aggregate, calls publish(), and saves")
    void publish_happyPath() {
        LoadAggregate draft = draftAggregate();
        when(repository.findById(TENANT, LOAD_ID)).thenReturn(Optional.of(draft));
        when(repository.save(draft)).thenReturn(draft);

        LoadAggregate result = service.publish(TENANT, LOAD_ID);

        assertThat(result.getStatus()).isEqualTo(LoadStatus.PUBLISHED);
        verify(repository).save(draft);
    }

    @Test
    @DisplayName("publish throws LoadNotFoundException when load is not found for tenant")
    void publish_notFound_throws() {
        when(repository.findById(TENANT, LOAD_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.publish(TENANT, LOAD_ID))
                .isInstanceOf(LoadNotFoundException.class)
                .hasMessageContaining(LOAD_ID);

        verify(repository, never()).save(any());
    }

    // ── claim ─────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("claim loads a PUBLISHED aggregate, assigns carrier, and saves as CLAIMED")
    void claim_happyPath() {
        LoadAggregate published = publishedAggregate();
        when(repository.findById(TENANT, LOAD_ID)).thenReturn(Optional.of(published));
        when(repository.save(published)).thenReturn(published);

        LoadAggregate result = service.claim(TENANT, LOAD_ID, CARRIER);

        assertThat(result.getStatus()).isEqualTo(LoadStatus.CLAIMED);
        assertThat(result.getCarrierId()).isEqualTo(CarrierId.of(CARRIER));
    }

    @Test
    @DisplayName("claim throws LoadNotFoundException when load is not found for tenant")
    void claim_notFound_throws() {
        when(repository.findById(TENANT, LOAD_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.claim(TENANT, LOAD_ID, CARRIER))
                .isInstanceOf(LoadNotFoundException.class);

        verify(repository, never()).save(any());
    }

    // ── cancelLoad ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("cancelLoad transitions a DRAFT aggregate to CANCELLED with reason")
    void cancelLoad_happyPath() {
        LoadAggregate draft = draftAggregate();
        when(repository.findById(TENANT, LOAD_ID)).thenReturn(Optional.of(draft));
        when(repository.save(draft)).thenReturn(draft);

        LoadAggregate result = service.cancelLoad(TENANT, LOAD_ID, "test reason");

        assertThat(result.getStatus()).isEqualTo(LoadStatus.CANCELLED);
        assertThat(result.getCancelReason()).isEqualTo("test reason");
    }

    @Test
    @DisplayName("cancelLoad throws LoadNotFoundException when load is not found")
    void cancelLoad_notFound_throws() {
        when(repository.findById(TENANT, LOAD_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.cancelLoad(TENANT, LOAD_ID, "reason"))
                .isInstanceOf(LoadNotFoundException.class);

        verify(repository, never()).save(any());
    }

    // ── startTrip ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("startTrip transitions a CLAIMED aggregate to IN_TRANSIT")
    void startTrip_happyPath() {
        LoadAggregate claimed = claimedAggregate();
        when(repository.findById(TENANT, LOAD_ID)).thenReturn(Optional.of(claimed));
        when(repository.save(claimed)).thenReturn(claimed);

        LoadAggregate result = service.startTrip(TENANT, LOAD_ID);

        assertThat(result.getStatus()).isEqualTo(LoadStatus.IN_TRANSIT);
        verify(repository).save(claimed);
    }

    @Test
    @DisplayName("startTrip throws LoadNotFoundException when load is not found")
    void startTrip_notFound_throws() {
        when(repository.findById(TENANT, LOAD_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.startTrip(TENANT, LOAD_ID))
                .isInstanceOf(LoadNotFoundException.class);

        verify(repository, never()).save(any());
    }

    // ── completeDelivery ──────────────────────────────────────────────────────

    @Test
    @DisplayName("completeDelivery transitions an IN_TRANSIT aggregate to DELIVERED and stores POD URL")
    void completeDelivery_happyPath() {
        LoadAggregate inTransit = inTransitAggregate();
        when(repository.findById(TENANT, LOAD_ID)).thenReturn(Optional.of(inTransit));
        when(repository.save(inTransit)).thenReturn(inTransit);

        LoadAggregate result = service.completeDelivery(TENANT, LOAD_ID, "https://cdn.example.com/pod.pdf");

        assertThat(result.getStatus()).isEqualTo(LoadStatus.DELIVERED);
        assertThat(result.getPodUrl()).isEqualTo("https://cdn.example.com/pod.pdf");
        verify(repository).save(inTransit);
    }

    @Test
    @DisplayName("completeDelivery drains domain events from the aggregate after save")
    void completeDelivery_drainsDomainEvents() {
        LoadAggregate inTransit = inTransitAggregate();
        when(repository.findById(TENANT, LOAD_ID)).thenReturn(Optional.of(inTransit));
        when(repository.save(inTransit)).thenReturn(inTransit);

        service.completeDelivery(TENANT, LOAD_ID, "https://cdn.example.com/pod.pdf");

        assertThat(inTransit.pullDomainEvents()).isEmpty();
    }

    @Test
    @DisplayName("completeDelivery throws LoadNotFoundException when load is not found")
    void completeDelivery_notFound_throws() {
        when(repository.findById(TENANT, LOAD_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.completeDelivery(TENANT, LOAD_ID, "https://cdn.example.com/pod.pdf"))
                .isInstanceOf(LoadNotFoundException.class);

        verify(repository, never()).save(any());
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private LoadAggregate draftAggregate() {
        return LoadAggregate.reconstitute(
                LOAD_ID, TENANT, SHIPPER,
                Weight.of(BigDecimal.valueOf(5000)), LoadStatus.DRAFT,
                null, null, null);
    }

    private LoadAggregate publishedAggregate() {
        return LoadAggregate.reconstitute(
                LOAD_ID, TENANT, SHIPPER,
                Weight.of(BigDecimal.valueOf(5000)), LoadStatus.PUBLISHED,
                null, null, null);
    }

    private LoadAggregate claimedAggregate() {
        return LoadAggregate.reconstitute(
                LOAD_ID, TENANT, SHIPPER,
                Weight.of(BigDecimal.valueOf(5000)), LoadStatus.CLAIMED,
                CarrierId.of(CARRIER), null, null);
    }

    private LoadAggregate inTransitAggregate() {
        return LoadAggregate.reconstitute(
                LOAD_ID, TENANT, SHIPPER,
                Weight.of(BigDecimal.valueOf(5000)), LoadStatus.IN_TRANSIT,
                CarrierId.of(CARRIER), null, null);
    }
}
