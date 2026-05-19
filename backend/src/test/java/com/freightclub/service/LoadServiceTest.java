package com.freightclub.service;

import com.freightclub.domain.Load;
import com.freightclub.domain.LoadStatus;
import com.freightclub.exception.LoadEditForbiddenException;
import com.freightclub.exception.LoadNotFoundException;
import com.freightclub.exception.ProfileIncompleteException;
import com.freightclub.modules.carrier.application.CarrierCostProfileService;
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

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
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

            verify(loadRepository).save(load);
            verify(documentService).generateBolOnPublish(load);
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
    }
}
