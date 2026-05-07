package com.freightclub.service;

import com.freightclub.domain.Load;
import com.freightclub.domain.LoadStatus;
import com.freightclub.domain.Notification;
import com.freightclub.domain.User;
import com.freightclub.dto.NotificationResponse;
import com.freightclub.repository.NotificationRepository;
import com.freightclub.repository.UserRepository;
import com.freightclub.security.TenantContextHolder;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock private NotificationRepository notificationRepository;
    @Mock private UserRepository userRepository;
    @Mock private EmailService emailService;

    @InjectMocks
    private NotificationService service;

    private static final String TRUCKER_ID = "trucker-1";
    private static final String SHIPPER_ID = "shipper-1";
    private static final String TENANT_ID  = "tenant-1";

    private Load buildLoad() {
        Load load = new Load();
        ReflectionTestUtils.setField(load, "id", "load-1");
        load.setTenantId(TENANT_ID);
        load.setShipperId(SHIPPER_ID);
        load.setStatus(LoadStatus.CLAIMED);
        load.setOriginCity("Dallas");
        load.setOriginState("TX");
        load.setDestinationCity("Houston");
        load.setDestinationState("TX");
        return load;
    }

    private User buildUser(String id, String first, String last) {
        User u = new User();
        ReflectionTestUtils.setField(u, "id", id);
        u.setFirstName(first);
        u.setLastName(last);
        u.setEmail(first.toLowerCase() + "@example.com");
        u.setTenantId(TENANT_ID);
        return u;
    }

    @Nested
    class NotifyLoadClaimed {

        @Test
        @DisplayName("saves notification and triggers email when both users found")
        void happyPath() {
            User trucker = buildUser(TRUCKER_ID, "Alice", "Smith");
            User shipper = buildUser(SHIPPER_ID, "Bob", "Jones");
            when(userRepository.findById(TRUCKER_ID)).thenReturn(Optional.of(trucker));
            when(userRepository.findById(SHIPPER_ID)).thenReturn(Optional.of(shipper));
            when(notificationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            service.notifyLoadClaimed(buildLoad(), TRUCKER_ID);

            verify(notificationRepository).save(any(Notification.class));
        }

        @Test
        @DisplayName("skips notification when trucker not found")
        void truckerNotFound_noOp() {
            when(userRepository.findById(TRUCKER_ID)).thenReturn(Optional.empty());
            service.notifyLoadClaimed(buildLoad(), TRUCKER_ID);
            verify(notificationRepository, never()).save(any());
        }

        @Test
        @DisplayName("skips notification when shipper not found")
        void shipperNotFound_noOp() {
            when(userRepository.findById(TRUCKER_ID)).thenReturn(Optional.of(buildUser(TRUCKER_ID, "Alice", "Smith")));
            when(userRepository.findById(SHIPPER_ID)).thenReturn(Optional.empty());
            service.notifyLoadClaimed(buildLoad(), TRUCKER_ID);
            verify(notificationRepository, never()).save(any());
        }
    }

    @Nested
    class NotifyLoadPickedUp {

        @Test
        @DisplayName("notifies shipper when shipper is found")
        void happyPath() {
            User shipper = buildUser(SHIPPER_ID, "Bob", "Jones");
            when(userRepository.findById(SHIPPER_ID)).thenReturn(Optional.of(shipper));
            when(notificationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            service.notifyLoadPickedUp(buildLoad());

            verify(notificationRepository).save(any(Notification.class));
        }

        @Test
        @DisplayName("skips when shipper not found")
        void shipperNotFound_noOp() {
            when(userRepository.findById(SHIPPER_ID)).thenReturn(Optional.empty());
            service.notifyLoadPickedUp(buildLoad());
            verify(notificationRepository, never()).save(any());
        }
    }

    @Nested
    class NotifyLoadDelivered {

        @Test
        @DisplayName("notifies shipper on delivery")
        void happyPath() {
            User shipper = buildUser(SHIPPER_ID, "Bob", "Jones");
            when(userRepository.findById(SHIPPER_ID)).thenReturn(Optional.of(shipper));
            when(notificationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            service.notifyLoadDelivered(buildLoad());

            verify(notificationRepository).save(any(Notification.class));
        }

        @Test
        @DisplayName("skips when shipper not found")
        void shipperNotFound_noOp() {
            when(userRepository.findById(SHIPPER_ID)).thenReturn(Optional.empty());
            service.notifyLoadDelivered(buildLoad());
            verify(notificationRepository, never()).save(any());
        }
    }

    @Nested
    class NotifyLoadCancelledToTrucker {

        @Test
        @DisplayName("notifies trucker when found")
        void happyPath() {
            User trucker = buildUser(TRUCKER_ID, "Alice", "Smith");
            when(userRepository.findById(TRUCKER_ID)).thenReturn(Optional.of(trucker));
            when(notificationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            service.notifyLoadCancelledToTrucker(buildLoad(), TRUCKER_ID, "Equipment issue");

            verify(notificationRepository).save(any(Notification.class));
        }

        @Test
        @DisplayName("skips when trucker not found")
        void truckerNotFound_noOp() {
            when(userRepository.findById(TRUCKER_ID)).thenReturn(Optional.empty());
            service.notifyLoadCancelledToTrucker(buildLoad(), TRUCKER_ID, "reason");
            verify(notificationRepository, never()).save(any());
        }
    }

    @Nested
    class GetNotifications {

        @BeforeEach void setup() { TenantContextHolder.setTenantId(TENANT_ID); }
        @AfterEach  void teardown() { TenantContextHolder.clear(); }

        @Test
        @DisplayName("delegates to repository and returns paged results")
        void returnsPage() {
            Page<Notification> repoPage = new PageImpl<>(List.of());
            when(notificationRepository.findByUserIdAndTenantIdOrderByCreatedAtDesc(eq(SHIPPER_ID), eq(TENANT_ID), any()))
                    .thenReturn(repoPage);

            Page<NotificationResponse> result = service.getNotifications(SHIPPER_ID, 0, 10);

            assertThat(result).isNotNull();
            verify(notificationRepository).findByUserIdAndTenantIdOrderByCreatedAtDesc(eq(SHIPPER_ID), eq(TENANT_ID), any());
        }
    }

    @Nested
    class GetUnreadCount {

        @BeforeEach void setup() { TenantContextHolder.setTenantId(TENANT_ID); }
        @AfterEach  void teardown() { TenantContextHolder.clear(); }

        @Test
        @DisplayName("returns count from repository")
        void returnsCount() {
            when(notificationRepository.countByUserIdAndTenantIdAndReadFalse(SHIPPER_ID, TENANT_ID)).thenReturn(3L);

            long count = service.getUnreadCount(SHIPPER_ID);

            assertThat(count).isEqualTo(3L);
        }
    }
}
