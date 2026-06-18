package com.freightclub.service;

import com.freightclub.domain.Claim;
import com.freightclub.domain.ClaimStatus;
import com.freightclub.domain.EquipmentType;
import com.freightclub.domain.Load;
import com.freightclub.domain.LoadStatus;
import com.freightclub.domain.User;
import com.freightclub.dto.CreateLoadRequest;
import com.freightclub.dto.LoadEventResponse;
import com.freightclub.exception.DocumentUploadRequiredException;
import com.freightclub.exception.LoadEditForbiddenException;
import com.freightclub.exception.LoadNotClaimableException;
import com.freightclub.exception.LoadNotFoundException;
import com.freightclub.exception.LoadStatusTransitionException;
import com.freightclub.exception.ProfileIncompleteException;
import com.freightclub.modules.carrier.application.CarrierCostProfileService;
import com.freightclub.modules.payment.application.PaymentService;
import com.freightclub.modules.shipper.application.ShipperProfileService;
import com.freightclub.repository.ClaimRepository;
import com.freightclub.repository.LoadEventRepository;
import com.freightclub.repository.LoadRepository;
import com.freightclub.repository.UserRepository;
import com.freightclub.security.TenantContextHolder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LoadServiceTest {

    @Mock
    private LoadRepository loadRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private DocumentService documentService;

    @Mock
    private RatingService ratingService;

    @Mock
    private ClaimRepository claimRepository;

    @Mock
    private LoadEventRepository loadEventRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private CarrierCostProfileService carrierCostProfileService;

    @Mock
    private ShipperProfileService shipperProfileService;

    @Mock
    private PaymentService paymentService;

    @InjectMocks
    private LoadService loadService;

    private static final String LOAD_ID = "load-1";
    private static final String SHIPPER_ID = "shipper-1";
    private static final String TENANT_ID = "tenant-1";

    @BeforeEach
    void setUp() {
        TenantContextHolder.setTenantId(TENANT_ID);
    }

    private Load buildDraftLoad() {
        Load load = new Load();
        ReflectionTestUtils.setField(load, "id", LOAD_ID);
        load.setTenantId(TENANT_ID);
        load.setShipperId(SHIPPER_ID);
        load.setStatus(LoadStatus.DRAFT);
        load.setOriginCity("New York");
        load.setOriginState("NY");
        load.setDestinationCity("Los Angeles");
        load.setDestinationState("CA");
        return load;
    }

    @Nested
    class PublishLoad {

        @Test
        @DisplayName("publishes load when profile is ready")
        void happyPath() {
            Load load = buildDraftLoad();
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.of(load));
            when(shipperProfileService.isPublishReady()).thenReturn(true);
            when(loadRepository.save(any())).thenReturn(load);

            loadService.publishLoad(LOAD_ID, SHIPPER_ID);

            verify(documentService).generateBolOnPublish(load);
            verify(loadRepository).save(load);
        }

        @Test
        @DisplayName("blocks publish when profile is incomplete")
        void publishLoad_blockedWhenProfileIncomplete() {
            Load load = buildDraftLoad();
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.of(load));
            when(shipperProfileService.isPublishReady()).thenReturn(false);
            when(shipperProfileService.getCompletenessPercent()).thenReturn(60);

            assertThatThrownBy(() -> loadService.publishLoad(LOAD_ID, SHIPPER_ID))
                    .isInstanceOf(ProfileIncompleteException.class)
                    .hasMessageContaining("Complete your company profile")
                    .hasMessageContaining("60% complete");
            verify(loadRepository, never()).save(any());
        }

        @Test
        @DisplayName("throws when load not found")
        void loadNotFound_throws() {
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> loadService.publishLoad(LOAD_ID, SHIPPER_ID))
                    .isInstanceOf(LoadNotFoundException.class);
        }

        @Test
        @DisplayName("throws when load is not DRAFT")
        void notDraft_throws() {
            Load load = buildDraftLoad();
            load.setStatus(LoadStatus.OPEN);
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.of(load));

            assertThatThrownBy(() -> loadService.publishLoad(LOAD_ID, SHIPPER_ID))
                    .isInstanceOf(LoadEditForbiddenException.class)
                    .hasMessageContaining("Only DRAFT loads can be published");
        }

        @Test
        @DisplayName("US-713: blocks incomplete profile when < 80%")
        void testPublishLoad_BlocksIncompleteProfile() {
            Load load = buildDraftLoad();
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.of(load));
            when(shipperProfileService.isPublishReady()).thenReturn(false);
            when(shipperProfileService.getCompletenessPercent()).thenReturn(60);

            assertThatThrownBy(() -> loadService.publishLoad(LOAD_ID, SHIPPER_ID))
                    .isInstanceOf(ProfileIncompleteException.class);
            verify(loadRepository, never()).save(any());
        }

        @Test
        @DisplayName("US-713: allows complete profile")
        void testPublishLoad_AllowsCompleteProfile() {
            Load load = buildDraftLoad();
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.of(load));
            when(shipperProfileService.isPublishReady()).thenReturn(true);
            when(loadRepository.save(any())).thenReturn(load);

            loadService.publishLoad(LOAD_ID, SHIPPER_ID);

            assertThat(load.getStatus()).isEqualTo(LoadStatus.OPEN);
            verify(loadRepository).save(load);
        }

        @Test
        @DisplayName("US-713: includes completeness percent in error message")
        void testPublishLoad_IncludedInErrorMessage() {
            Load load = buildDraftLoad();
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.of(load));
            when(shipperProfileService.isPublishReady()).thenReturn(false);
            when(shipperProfileService.getCompletenessPercent()).thenReturn(60);

            assertThatThrownBy(() -> loadService.publishLoad(LOAD_ID, SHIPPER_ID))
                    .isInstanceOf(ProfileIncompleteException.class)
                    .hasMessageContaining("60%");
        }
    }

    // -------------------------------------------------------------------------
    // Helpers shared by new nested classes
    // -------------------------------------------------------------------------

    private Load buildLoad(LoadStatus status) {
        Load load = new Load();
        ReflectionTestUtils.setField(load, "id", LOAD_ID);
        load.setTenantId(TENANT_ID);
        load.setShipperId(SHIPPER_ID);
        load.setStatus(status);
        load.setOriginCity("Dallas");
        load.setOriginState("TX");
        load.setDestinationCity("Chicago");
        load.setDestinationState("IL");
        return load;
    }

    private CreateLoadRequest minimalCreateRequest(BigDecimal weightLbs, Boolean overweightAck) {
        return new CreateLoadRequest(
                "Dallas", "TX", "75201", "123 Main St", null,
                "Chicago", "IL", "60601", "456 Elm St", null,
                BigDecimal.valueOf(1200),
                LocalDateTime.now().plusDays(1), LocalDateTime.now().plusDays(1).plusHours(4),
                LocalDateTime.now().plusDays(2), LocalDateTime.now().plusDays(2).plusHours(4),
                "Steel coils", weightLbs,
                null, null, null,
                EquipmentType.FLATBED,
                BigDecimal.valueOf(3.50),
                com.freightclub.domain.PayRateType.PER_MILE,
                null, null, overweightAck
        );
    }

    // -------------------------------------------------------------------------
    // validateWeight
    // -------------------------------------------------------------------------

    @Nested
    @DisplayName("validateWeight (via createDraft)")
    class ValidateWeight {

        @Test
        @DisplayName("throws when weight exceeds 80,000 lbs and not acknowledged")
        void overweight_withoutAcknowledgement_throws() {
            CreateLoadRequest req = minimalCreateRequest(BigDecimal.valueOf(85_000), false);

            assertThatThrownBy(() -> loadService.createDraft(req, SHIPPER_ID))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("80,000 lb");
        }

        @Test
        @DisplayName("allows weight exceeding 80,000 lbs when acknowledged")
        void overweight_withAcknowledgement_passes() {
            CreateLoadRequest req = minimalCreateRequest(BigDecimal.valueOf(85_000), true);
            Load saved = buildLoad(LoadStatus.DRAFT);
            when(loadRepository.save(any())).thenReturn(saved);
            when(userRepository.findById(SHIPPER_ID)).thenReturn(Optional.of(new User()));

            loadService.createDraft(req, SHIPPER_ID);

            verify(loadRepository).save(any());
        }

        @Test
        @DisplayName("allows legal weight without acknowledgement flag")
        void legalWeight_noAck_passes() {
            CreateLoadRequest req = minimalCreateRequest(BigDecimal.valueOf(45_000), null);
            Load saved = buildLoad(LoadStatus.DRAFT);
            when(loadRepository.save(any())).thenReturn(saved);
            when(userRepository.findById(SHIPPER_ID)).thenReturn(Optional.of(new User()));

            loadService.createDraft(req, SHIPPER_ID);

            verify(loadRepository).save(any());
        }
    }

    // -------------------------------------------------------------------------
    // createLoad (OPEN status + BOL generation)
    // -------------------------------------------------------------------------

    @Nested
    @DisplayName("createLoad")
    class CreateLoad {

        @Test
        @DisplayName("saves load as OPEN and triggers BOL generation")
        void happyPath_openStatusAndBol() {
            CreateLoadRequest req = minimalCreateRequest(BigDecimal.valueOf(40_000), null);
            Load saved = buildLoad(LoadStatus.OPEN);
            when(loadRepository.save(any())).thenReturn(saved);
            when(userRepository.findById(SHIPPER_ID)).thenReturn(Optional.of(new User()));

            loadService.createLoad(req, SHIPPER_ID);

            verify(documentService).generateBolOnPublish(any());
        }
    }

    // -------------------------------------------------------------------------
    // cancelLoad
    // -------------------------------------------------------------------------

    @Nested
    @DisplayName("cancelLoad")
    class CancelLoad {

        @Test
        @DisplayName("throws when load is already DELIVERED")
        void delivered_throws() {
            Load load = buildLoad(LoadStatus.DELIVERED);
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.of(load));

            assertThatThrownBy(() -> loadService.cancelLoad(LOAD_ID, SHIPPER_ID, "duplicate"))
                    .isInstanceOf(LoadEditForbiddenException.class);
        }

        @Test
        @DisplayName("throws when load is already SETTLED")
        void settled_throws() {
            Load load = buildLoad(LoadStatus.SETTLED);
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.of(load));

            assertThatThrownBy(() -> loadService.cancelLoad(LOAD_ID, SHIPPER_ID, "duplicate"))
                    .isInstanceOf(LoadEditForbiddenException.class);
        }

        @Test
        @DisplayName("throws when load is already CANCELLED")
        void alreadyCancelled_throws() {
            Load load = buildLoad(LoadStatus.CANCELLED);
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.of(load));

            assertThatThrownBy(() -> loadService.cancelLoad(LOAD_ID, SHIPPER_ID, "duplicate"))
                    .isInstanceOf(LoadEditForbiddenException.class);
        }

        @Test
        @DisplayName("cancels OPEN load and does NOT publish event (no trucker assigned)")
        void openLoad_noTrucker_noEvent() {
            Load load = buildLoad(LoadStatus.OPEN);
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.of(load));
            when(loadRepository.save(any())).thenReturn(load);
            when(userRepository.findById(SHIPPER_ID)).thenReturn(Optional.of(new User()));

            loadService.cancelLoad(LOAD_ID, SHIPPER_ID, "no longer needed");

            verify(eventPublisher, never()).publishEvent(any());
        }

        @Test
        @DisplayName("cancels CLAIMED load, cancels claim, and publishes LoadCancelledEvent")
        void claimedLoad_withTrucker_publishesEvent() {
            Load load = buildLoad(LoadStatus.CLAIMED);
            load.setTruckerId("trucker-1");
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.of(load));
            when(loadRepository.save(any())).thenReturn(load);
            when(claimRepository.findFirstByLoadIdAndStatus(LOAD_ID, ClaimStatus.ACTIVE))
                    .thenReturn(Optional.empty());
            when(userRepository.findById(SHIPPER_ID)).thenReturn(Optional.of(new User()));

            loadService.cancelLoad(LOAD_ID, SHIPPER_ID, "shipper cancels");

            verify(eventPublisher).publishEvent(any(LoadCancelledEvent.class));
        }
    }

    // -------------------------------------------------------------------------
    // markPickedUp
    // -------------------------------------------------------------------------

    @Nested
    @DisplayName("markPickedUp")
    class MarkPickedUp {

        @Test
        @DisplayName("throws when load status is not CLAIMED")
        void notClaimed_throws() {
            Load load = buildLoad(LoadStatus.IN_TRANSIT);
            load.setTruckerId("trucker-1");
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID))
                    .thenReturn(Optional.of(load));

            assertThatThrownBy(() -> loadService.markPickedUp(LOAD_ID, "trucker-1"))
                    .isInstanceOf(LoadStatusTransitionException.class)
                    .hasMessageContaining("CLAIMED");
        }

        @Test
        @DisplayName("throws when BOL photo is missing")
        void missingBolPhoto_throws() {
            Load load = buildLoad(LoadStatus.CLAIMED);
            load.setTruckerId("trucker-1");
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID))
                    .thenReturn(Optional.of(load));
            when(documentService.hasBolPhoto(LOAD_ID)).thenReturn(false);

            assertThatThrownBy(() -> loadService.markPickedUp(LOAD_ID, "trucker-1"))
                    .isInstanceOf(DocumentUploadRequiredException.class)
                    .hasMessageContaining("BOL");
        }

        @Test
        @DisplayName("transitions to IN_TRANSIT when BOL photo present")
        void bolPhotoPresent_transitionsToInTransit() {
            Load load = buildLoad(LoadStatus.CLAIMED);
            load.setTruckerId("trucker-1");
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID))
                    .thenReturn(Optional.of(load));
            when(documentService.hasBolPhoto(LOAD_ID)).thenReturn(true);
            when(loadRepository.save(any())).thenReturn(load);

            loadService.markPickedUp(LOAD_ID, "trucker-1");

            assertThat(load.getStatus()).isEqualTo(LoadStatus.IN_TRANSIT);
            verify(eventPublisher).publishEvent(any(LoadPickedUpEvent.class));
        }

        @Test
        @DisplayName("throws LoadNotFoundException when requester is not the assigned trucker")
        void wrongTrucker_throws() {
            Load load = buildLoad(LoadStatus.CLAIMED);
            load.setTruckerId("trucker-1");
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID))
                    .thenReturn(Optional.of(load));

            assertThatThrownBy(() -> loadService.markPickedUp(LOAD_ID, "other-trucker"))
                    .isInstanceOf(LoadNotFoundException.class);
        }
    }

    // -------------------------------------------------------------------------
    // markDelivered
    // -------------------------------------------------------------------------

    @Nested
    @DisplayName("markDelivered")
    class MarkDelivered {

        @Test
        @DisplayName("throws when load status is not IN_TRANSIT")
        void notInTransit_throws() {
            Load load = buildLoad(LoadStatus.CLAIMED);
            load.setTruckerId("trucker-1");
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID))
                    .thenReturn(Optional.of(load));

            assertThatThrownBy(() -> loadService.markDelivered(LOAD_ID, "trucker-1"))
                    .isInstanceOf(LoadStatusTransitionException.class)
                    .hasMessageContaining("IN_TRANSIT");
        }

        @Test
        @DisplayName("throws when POD photo is missing")
        void missingPodPhoto_throws() {
            Load load = buildLoad(LoadStatus.IN_TRANSIT);
            load.setTruckerId("trucker-1");
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID))
                    .thenReturn(Optional.of(load));
            when(documentService.hasPodPhoto(LOAD_ID)).thenReturn(false);

            assertThatThrownBy(() -> loadService.markDelivered(LOAD_ID, "trucker-1"))
                    .isInstanceOf(DocumentUploadRequiredException.class)
                    .hasMessageContaining("POD");
        }

        @Test
        @DisplayName("transitions to DELIVERED, publishes event, and creates invoice")
        void happyPath_deliveredAndInvoiceCreated() throws Exception {
            Load load = buildLoad(LoadStatus.IN_TRANSIT);
            load.setTruckerId("trucker-1");
            load.setPayRate(BigDecimal.valueOf(2000));
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID))
                    .thenReturn(Optional.of(load));
            when(documentService.hasPodPhoto(LOAD_ID)).thenReturn(true);
            when(loadRepository.save(any())).thenReturn(load);
            when(userRepository.findById(anyString())).thenReturn(Optional.of(new User()));

            loadService.markDelivered(LOAD_ID, "trucker-1");

            assertThat(load.getStatus()).isEqualTo(LoadStatus.DELIVERED);
            verify(eventPublisher).publishEvent(any(LoadDeliveredEvent.class));
            verify(paymentService).createInvoice(anyString(), anyString(), anyString(), anyString(), anyLong());
        }

        @Test
        @DisplayName("completes delivery even when invoice creation throws")
        void invoiceCreationFails_deliveryStillCompletes() throws Exception {
            Load load = buildLoad(LoadStatus.IN_TRANSIT);
            load.setTruckerId("trucker-1");
            load.setPayRate(BigDecimal.valueOf(2000));
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID))
                    .thenReturn(Optional.of(load));
            when(documentService.hasPodPhoto(LOAD_ID)).thenReturn(true);
            when(loadRepository.save(any())).thenReturn(load);
            when(userRepository.findById(anyString())).thenReturn(Optional.of(new User()));
            doThrow(new RuntimeException("Stripe error"))
                    .when(paymentService).createInvoice(anyString(), anyString(), anyString(), anyString(), anyLong());

            // Should not throw — invoice failure is swallowed
            loadService.markDelivered(LOAD_ID, "trucker-1");

            assertThat(load.getStatus()).isEqualTo(LoadStatus.DELIVERED);
        }

        @Test
        @DisplayName("skips invoice creation when payRate is null")
        void nullPayRate_skipsInvoice() throws Exception {
            Load load = buildLoad(LoadStatus.IN_TRANSIT);
            load.setTruckerId("trucker-1");
            load.setPayRate(null);
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID))
                    .thenReturn(Optional.of(load));
            when(documentService.hasPodPhoto(LOAD_ID)).thenReturn(true);
            when(loadRepository.save(any())).thenReturn(load);
            when(userRepository.findById(anyString())).thenReturn(Optional.of(new User()));

            loadService.markDelivered(LOAD_ID, "trucker-1");

            verify(paymentService, never()).createInvoice(anyString(), anyString(), anyString(), anyString(), anyLong());
        }
    }

    // -------------------------------------------------------------------------
    // claimLoad
    // -------------------------------------------------------------------------

    @Nested
    @DisplayName("claimLoad")
    class ClaimLoad {

        private static final String TRUCKER_ID = "trucker-1";

        @Test
        @DisplayName("throws when trucker already has an active load")
        void activeLoadExists_throws() {
            Load activeLoad = buildLoad(LoadStatus.CLAIMED);
            when(loadRepository.findFirstByTruckerIdAndStatusInAndDeletedAtIsNull(
                    eq(TRUCKER_ID), any()))
                    .thenReturn(Optional.of(activeLoad));

            assertThatThrownBy(() -> loadService.claimLoad(LOAD_ID, TRUCKER_ID))
                    .isInstanceOf(LoadNotClaimableException.class)
                    .hasMessageContaining("already have an active load");
        }

        @Test
        @DisplayName("throws when load is not OPEN")
        void loadNotOpen_throws() {
            when(loadRepository.findFirstByTruckerIdAndStatusInAndDeletedAtIsNull(
                    eq(TRUCKER_ID), any()))
                    .thenReturn(Optional.empty());
            Load load = buildLoad(LoadStatus.CLAIMED);
            when(loadRepository.findByIdAndDeletedAtIsNullForUpdate(LOAD_ID))
                    .thenReturn(Optional.of(load));

            assertThatThrownBy(() -> loadService.claimLoad(LOAD_ID, TRUCKER_ID))
                    .isInstanceOf(LoadNotClaimableException.class)
                    .hasMessageContaining("not available");
        }

        @Test
        @DisplayName("claims OPEN load, records claim, and publishes event")
        void happyPath_claimsLoad() {
            when(loadRepository.findFirstByTruckerIdAndStatusInAndDeletedAtIsNull(
                    eq(TRUCKER_ID), any()))
                    .thenReturn(Optional.empty());
            Load load = buildLoad(LoadStatus.OPEN);
            when(loadRepository.findByIdAndDeletedAtIsNullForUpdate(LOAD_ID))
                    .thenReturn(Optional.of(load));
            when(loadRepository.save(any())).thenReturn(load);

            loadService.claimLoad(LOAD_ID, TRUCKER_ID);

            assertThat(load.getStatus()).isEqualTo(LoadStatus.CLAIMED);
            assertThat(load.getTruckerId()).isEqualTo(TRUCKER_ID);
            verify(claimRepository).save(any(Claim.class));
            verify(eventPublisher).publishEvent(any(LoadClaimedEvent.class));
        }

        @Test
        @DisplayName("throws LoadNotFoundException when load does not exist")
        void loadNotFound_throws() {
            when(loadRepository.findFirstByTruckerIdAndStatusInAndDeletedAtIsNull(
                    eq(TRUCKER_ID), any()))
                    .thenReturn(Optional.empty());
            when(loadRepository.findByIdAndDeletedAtIsNullForUpdate(LOAD_ID))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> loadService.claimLoad(LOAD_ID, TRUCKER_ID))
                    .isInstanceOf(LoadNotFoundException.class);
        }
    }

    // -------------------------------------------------------------------------
    // getAvailableStates
    // -------------------------------------------------------------------------

    @Nested
    @DisplayName("getAvailableStates")
    class GetAvailableStates {

        @Test
        @DisplayName("returns empty lists when trucker has no equipment type set")
        void noEquipmentType_returnsEmptyLists() {
            User trucker = new User();
            trucker.setEquipmentType(null);
            when(userRepository.findById("trucker-1")).thenReturn(Optional.of(trucker));

            Map<String, List<String>> result = loadService.getAvailableStates("trucker-1");

            assertThat(result.get("originStates")).isEmpty();
            assertThat(result.get("destinationStates")).isEmpty();
        }

        @Test
        @DisplayName("returns empty lists when trucker not found")
        void truckerNotFound_returnsEmptyLists() {
            when(userRepository.findById("trucker-1")).thenReturn(Optional.empty());

            Map<String, List<String>> result = loadService.getAvailableStates("trucker-1");

            assertThat(result.get("originStates")).isEmpty();
            assertThat(result.get("destinationStates")).isEmpty();
        }

        @Test
        @DisplayName("queries distinct states when equipment type is present")
        void withEquipmentType_queriesRepository() {
            User trucker = new User();
            trucker.setEquipmentType(EquipmentType.FLATBED);
            when(userRepository.findById("trucker-1")).thenReturn(Optional.of(trucker));
            when(loadRepository.findDistinctOriginStatesByEquipmentType(EquipmentType.FLATBED))
                    .thenReturn(List.of("TX", "CA"));
            when(loadRepository.findDistinctDestinationStatesByEquipmentType(EquipmentType.FLATBED))
                    .thenReturn(List.of("IL", "NY"));

            Map<String, List<String>> result = loadService.getAvailableStates("trucker-1");

            assertThat(result.get("originStates")).containsExactly("TX", "CA");
            assertThat(result.get("destinationStates")).containsExactly("IL", "NY");
        }
    }

    // -------------------------------------------------------------------------
    // getLoadEvents
    // -------------------------------------------------------------------------

    @Nested
    @DisplayName("getLoadEvents")
    class GetLoadEvents {

        @Test
        @DisplayName("throws LoadNotFoundException when load not found")
        void loadNotFound_throws() {
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> loadService.getLoadEvents(LOAD_ID, SHIPPER_ID))
                    .isInstanceOf(LoadNotFoundException.class);
        }

        @Test
        @DisplayName("throws LoadNotFoundException when requester is neither shipper nor trucker")
        void unauthorizedRequester_throws() {
            Load load = buildLoad(LoadStatus.CLAIMED);
            load.setTruckerId("trucker-1");
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID)).thenReturn(Optional.of(load));

            assertThatThrownBy(() -> loadService.getLoadEvents(LOAD_ID, "intruder-99"))
                    .isInstanceOf(LoadNotFoundException.class);
        }

        @Test
        @DisplayName("returns events when requester is the shipper")
        void shipperAccess_returnsEvents() {
            Load load = buildLoad(LoadStatus.OPEN);
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID)).thenReturn(Optional.of(load));
            when(loadEventRepository.findByLoadIdOrderByCreatedAtAsc(LOAD_ID))
                    .thenReturn(Collections.emptyList());

            List<LoadEventResponse> events = loadService.getLoadEvents(LOAD_ID, SHIPPER_ID);

            assertThat(events).isEmpty();
        }

        @Test
        @DisplayName("returns events when requester is the assigned trucker")
        void truckerAccess_returnsEvents() {
            Load load = buildLoad(LoadStatus.CLAIMED);
            load.setTruckerId("trucker-1");
            when(loadRepository.findByIdAndDeletedAtIsNull(LOAD_ID)).thenReturn(Optional.of(load));
            when(loadEventRepository.findByLoadIdOrderByCreatedAtAsc(LOAD_ID))
                    .thenReturn(Collections.emptyList());

            List<LoadEventResponse> events = loadService.getLoadEvents(LOAD_ID, "trucker-1");

            assertThat(events).isEmpty();
        }
    }

    // -------------------------------------------------------------------------
    // getMyActiveLoad
    // -------------------------------------------------------------------------

    @Nested
    @DisplayName("getMyActiveLoad")
    class GetMyActiveLoad {

        @Test
        @DisplayName("returns empty when trucker has no active load")
        void noActiveLoad_returnsEmpty() {
            when(loadRepository.findFirstByTruckerIdAndStatusInAndDeletedAtIsNull(
                    eq("trucker-1"), any()))
                    .thenReturn(Optional.empty());

            Optional<com.freightclub.dto.LoadResponse> result = loadService.getMyActiveLoad("trucker-1");

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("returns active load when one exists")
        void activeLoadFound_returnsResponse() {
            Load load = buildLoad(LoadStatus.IN_TRANSIT);
            load.setTruckerId("trucker-1");
            when(loadRepository.findFirstByTruckerIdAndStatusInAndDeletedAtIsNull(
                    eq("trucker-1"), any()))
                    .thenReturn(Optional.of(load));
            when(userRepository.findById(SHIPPER_ID)).thenReturn(Optional.of(new User()));
            when(userRepository.findById("trucker-1")).thenReturn(Optional.of(new User()));

            Optional<com.freightclub.dto.LoadResponse> result = loadService.getMyActiveLoad("trucker-1");

            assertThat(result).isPresent();
        }
    }

    // -------------------------------------------------------------------------
    // isOwner
    // -------------------------------------------------------------------------

    @Nested
    @DisplayName("isOwner")
    class IsOwner {

        @Test
        @DisplayName("returns true when load belongs to current tenant")
        void ownedLoad_returnsTrue() {
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.of(buildLoad(LoadStatus.OPEN)));

            assertThat(loadService.isOwner(LOAD_ID)).isTrue();
        }

        @Test
        @DisplayName("returns false when load not found or tenant mismatch")
        void notFound_returnsFalse() {
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.empty());

            assertThat(loadService.isOwner(LOAD_ID)).isFalse();
        }
    }

    // -------------------------------------------------------------------------
    // requireEditable (via updateLoad)
    // -------------------------------------------------------------------------

    @Nested
    @DisplayName("requireEditable (via updateLoad)")
    class RequireEditable {

        @Test
        @DisplayName("throws when load is CLAIMED (not editable)")
        void claimedLoad_throws() {
            Load load = buildLoad(LoadStatus.CLAIMED);
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.of(load));
            com.freightclub.dto.UpdateLoadRequest req = new com.freightclub.dto.UpdateLoadRequest(
                    "Dallas", "TX", "75201", "123 Main St", null,
                    "Chicago", "IL", "60601", "456 Elm St", null,
                    BigDecimal.valueOf(1200),
                    LocalDateTime.now().plusDays(1), LocalDateTime.now().plusDays(1).plusHours(4),
                    LocalDateTime.now().plusDays(2), LocalDateTime.now().plusDays(2).plusHours(4),
                    "Steel coils", BigDecimal.valueOf(40_000),
                    null, null, null,
                    EquipmentType.FLATBED,
                    BigDecimal.valueOf(3.50),
                    com.freightclub.domain.PayRateType.PER_MILE,
                    null, null, null
            );

            assertThatThrownBy(() -> loadService.updateLoad(LOAD_ID, req, SHIPPER_ID))
                    .isInstanceOf(LoadEditForbiddenException.class);
        }
    }

    // AC-3: Date Window Validation
    @Nested
    @DisplayName("AC-3: Date Window Validation (US-103-v2)")
    class DateWindowValidation {

        private LocalDateTime baseTime;
        private LocalDateTime oneDayLater;
        private LocalDateTime twoDaysLater;

        @BeforeEach
        void setUpDates() {
            baseTime = LocalDateTime.now().plusHours(1);
            oneDayLater = baseTime.plusDays(1);
            twoDaysLater = baseTime.plusDays(2);
        }

        @Test
        @DisplayName("rejects pickup when Latest Pickup < Earliest Pickup")
        void rejectPickupWindowInvalid() {
            CreateLoadRequest req = new CreateLoadRequest(
                    "New York",                // originCity
                    "NY",                      // originState
                    "10001",                   // originZip
                    "123 Main St",             // originAddress1
                    null,                      // originAddress2
                    "Los Angeles",             // destinationCity
                    "CA",                      // destinationState
                    "90001",                   // destinationZip
                    "456 Oak Ave",             // destinationAddress1
                    null,                      // destinationAddress2
                    BigDecimal.valueOf(2000),  // distanceMiles
                    oneDayLater,               // pickupFrom
                    baseTime,                  // pickupTo (INVALID: before pickupFrom)
                    twoDaysLater,              // deliveryFrom
                    twoDaysLater.plusHours(2), // deliveryTo
                    "Fragile Electronics",     // commodity
                    BigDecimal.valueOf(500),   // weightLbs
                    BigDecimal.valueOf(2),    // lengthFt
                    BigDecimal.valueOf(1),    // widthFt
                    BigDecimal.valueOf(3),    // heightFt
                    EquipmentType.DRY_VAN,
                    BigDecimal.valueOf(2.50),
                    com.freightclub.domain.PayRateType.PER_MILE,
                    com.freightclub.domain.PaymentTerms.NET_7,
                    null, null
            );

            assertThatThrownBy(() -> loadService.createDraft(req, SHIPPER_ID))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Latest Pickup cannot be before Earliest Pickup");
        }

        @Test
        @DisplayName("rejects delivery when Earliest Delivery < Latest Pickup")
        void rejectDeliveryBeforePickup() {
            CreateLoadRequest req = new CreateLoadRequest(
                    "New York",                // originCity
                    "NY",                      // originState
                    "10001",                   // originZip
                    "123 Main St",             // originAddress1
                    null,                      // originAddress2
                    "Los Angeles",             // destinationCity
                    "CA",                      // destinationState
                    "90001",                   // destinationZip
                    "456 Oak Ave",             // destinationAddress1
                    null,                      // destinationAddress2
                    BigDecimal.valueOf(2000),  // distanceMiles
                    baseTime,                  // pickupFrom
                    oneDayLater,               // pickupTo
                    baseTime,                  // deliveryFrom (INVALID: before pickupTo)
                    baseTime.plusHours(2),     // deliveryTo
                    "Fragile Electronics",     // commodity
                    BigDecimal.valueOf(500),   // weightLbs
                    BigDecimal.valueOf(2),    // lengthFt
                    BigDecimal.valueOf(1),    // widthFt
                    BigDecimal.valueOf(3),    // heightFt
                    EquipmentType.DRY_VAN,
                    BigDecimal.valueOf(2.50),
                    com.freightclub.domain.PayRateType.PER_MILE,
                    com.freightclub.domain.PaymentTerms.NET_7,
                    null, null
            );

            assertThatThrownBy(() -> loadService.createDraft(req, SHIPPER_ID))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Earliest Delivery cannot be before Latest Pickup");
        }

        @Test
        @DisplayName("rejects delivery when Latest Delivery < Earliest Delivery")
        void rejectDeliveryWindowInvalid() {
            CreateLoadRequest req = new CreateLoadRequest(
                    "New York",                // originCity
                    "NY",                      // originState
                    "10001",                   // originZip
                    "123 Main St",             // originAddress1
                    null,                      // originAddress2
                    "Los Angeles",             // destinationCity
                    "CA",                      // destinationState
                    "90001",                   // destinationZip
                    "456 Oak Ave",             // destinationAddress1
                    null,                      // destinationAddress2
                    BigDecimal.valueOf(2000),  // distanceMiles
                    baseTime,                  // pickupFrom
                    oneDayLater,               // pickupTo
                    twoDaysLater,              // deliveryFrom
                    baseTime,                  // deliveryTo (INVALID: before deliveryFrom)
                    "Fragile Electronics",     // commodity
                    BigDecimal.valueOf(500),   // weightLbs
                    BigDecimal.valueOf(2),    // lengthFt
                    BigDecimal.valueOf(1),    // widthFt
                    BigDecimal.valueOf(3),    // heightFt
                    EquipmentType.DRY_VAN,
                    BigDecimal.valueOf(2.50),
                    com.freightclub.domain.PayRateType.PER_MILE,
                    com.freightclub.domain.PaymentTerms.NET_7,
                    null, null
            );

            assertThatThrownBy(() -> loadService.createDraft(req, SHIPPER_ID))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Latest Delivery cannot be before Earliest Delivery");
        }

        @Test
        @DisplayName("accepts valid date windows")
        void acceptValidDateWindows() {
            CreateLoadRequest req = new CreateLoadRequest(
                    "New York",                // originCity
                    "NY",                      // originState
                    "10001",                   // originZip
                    "123 Main St",             // originAddress1
                    null,                      // originAddress2
                    "Los Angeles",             // destinationCity
                    "CA",                      // destinationState
                    "90001",                   // destinationZip
                    "456 Oak Ave",             // destinationAddress1
                    null,                      // destinationAddress2
                    BigDecimal.valueOf(2000),  // distanceMiles
                    baseTime,                  // pickupFrom
                    oneDayLater,               // pickupTo (valid: after pickupFrom)
                    oneDayLater.plusHours(1), // deliveryFrom (valid: after pickupTo)
                    twoDaysLater,              // deliveryTo (valid: after deliveryFrom)
                    "Fragile Electronics",     // commodity
                    BigDecimal.valueOf(500),   // weightLbs
                    BigDecimal.valueOf(2),    // lengthFt
                    BigDecimal.valueOf(1),    // widthFt
                    BigDecimal.valueOf(3),    // heightFt
                    EquipmentType.DRY_VAN,
                    BigDecimal.valueOf(2.50),
                    com.freightclub.domain.PayRateType.PER_MILE,
                    com.freightclub.domain.PaymentTerms.NET_7,
                    null, null
            );

            com.freightclub.dto.LoadResponse draft = loadService.createDraft(req, SHIPPER_ID);

            assertThat(draft).isNotNull();
            assertThat(draft.pickupFrom()).isEqualTo(baseTime);
            assertThat(draft.pickupTo()).isEqualTo(oneDayLater);
            assertThat(draft.deliveryFrom()).isEqualTo(oneDayLater.plusHours(1));
            assertThat(draft.deliveryTo()).isEqualTo(twoDaysLater);
        }
    }
}
