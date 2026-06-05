package com.freightclub.service;

import com.freightclub.domain.EquipmentType;
import com.freightclub.domain.Load;
import com.freightclub.domain.LoadStatus;
import com.freightclub.dto.LoadResponse;
import com.freightclub.exception.LoadNotFoundException;
import com.freightclub.exception.LoadStatusTransitionException;
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
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LoadServiceSettleDisputeTest {

    @Mock private LoadRepository loadRepository;
    @Mock private UserRepository userRepository;
    @Mock private DocumentService documentService;
    @Mock private RatingService ratingService;
    @Mock private ClaimRepository claimRepository;
    @Mock private LoadEventRepository loadEventRepository;
    @Mock private ApplicationEventPublisher eventPublisher;
    @Mock private CarrierCostProfileService carrierCostProfileService;
    @Mock private ShipperProfileService shipperProfileService;
    @Mock private PaymentService paymentService;

    @InjectMocks
    private LoadService loadService;

    private static final String LOAD_ID = "load-settle-1";
    private static final String SHIPPER_ID = "shipper-settle-1";
    private static final String TENANT_ID = "tenant-settle-1";

    @BeforeEach
    void setUp() {
        TenantContextHolder.setTenantId(TENANT_ID);
    }

    private Load buildDeliveredLoad() {
        Load load = new Load();
        ReflectionTestUtils.setField(load, "id", LOAD_ID);
        load.setTenantId(TENANT_ID);
        load.setShipperId(SHIPPER_ID);
        load.setTruckerId("trucker-settle-1");
        load.setStatus(LoadStatus.DELIVERED);
        load.setOriginCity("Atlanta");
        load.setOriginState("GA");
        load.setDestinationCity("Nashville");
        load.setDestinationState("TN");
        return load;
    }

    @Nested
    class SettleLoad {

        @Test
        @DisplayName("transitions DELIVERED load to SETTLED")
        void settleLoad_succeeds() {
            Load load = buildDeliveredLoad();
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.of(load));
            when(loadRepository.save(any())).thenReturn(load);
            when(userRepository.findById(any())).thenReturn(Optional.empty());

            LoadResponse response = loadService.settleLoad(LOAD_ID, SHIPPER_ID);

            assertThat(response.status()).isEqualTo(LoadStatus.SETTLED);
            assertThat(load.getSettledAt()).isNotNull();
            verify(loadRepository).save(load);
            verify(eventPublisher).publishEvent(any(LoadSettledEvent.class));
        }

        @Test
        @DisplayName("throws when load is not DELIVERED")
        void settleLoad_throwsWhenNotDelivered() {
            Load load = buildDeliveredLoad();
            load.setStatus(LoadStatus.IN_TRANSIT);
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.of(load));

            assertThatThrownBy(() -> loadService.settleLoad(LOAD_ID, SHIPPER_ID))
                    .isInstanceOf(LoadStatusTransitionException.class)
                    .hasMessageContaining("DELIVERED");
            verify(loadRepository, never()).save(any());
        }

        @Test
        @DisplayName("throws when load not found in tenant")
        void settleLoad_throwsWhenNotFound() {
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> loadService.settleLoad(LOAD_ID, SHIPPER_ID))
                    .isInstanceOf(LoadNotFoundException.class);
        }
    }

    @Nested
    class DisputeLoad {

        @Test
        @DisplayName("transitions DELIVERED load to DISPUTED with reason")
        void disputeLoad_succeeds() {
            Load load = buildDeliveredLoad();
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.of(load));
            when(loadRepository.save(any())).thenReturn(load);
            when(userRepository.findById(any())).thenReturn(Optional.empty());

            LoadResponse response = loadService.disputeLoad(LOAD_ID, SHIPPER_ID, "Damaged goods");

            assertThat(response.status()).isEqualTo(LoadStatus.DISPUTED);
            assertThat(load.getDisputedAt()).isNotNull();
            assertThat(load.getDisputeReason()).isEqualTo("Damaged goods");
            verify(loadRepository).save(load);
            verify(eventPublisher).publishEvent(any(LoadDisputedEvent.class));
        }

        @Test
        @DisplayName("throws when load is not DELIVERED")
        void disputeLoad_throwsWhenNotDelivered() {
            Load load = buildDeliveredLoad();
            load.setStatus(LoadStatus.CLAIMED);
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.of(load));

            assertThatThrownBy(() -> loadService.disputeLoad(LOAD_ID, SHIPPER_ID, "reason"))
                    .isInstanceOf(LoadStatusTransitionException.class)
                    .hasMessageContaining("DELIVERED");
            verify(loadRepository, never()).save(any());
        }

        @Test
        @DisplayName("throws when load not found in tenant")
        void disputeLoad_throwsWhenNotFound() {
            when(loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(LOAD_ID, TENANT_ID))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> loadService.disputeLoad(LOAD_ID, SHIPPER_ID, "reason"))
                    .isInstanceOf(LoadNotFoundException.class);
        }
    }
}
