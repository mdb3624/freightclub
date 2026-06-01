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
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;

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
    @Mock private SmsNotificationService smsNotificationService;

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

            service.onLoadClaimed(new LoadClaimedEvent(buildLoad(), TRUCKER_ID));

            verify(notificationRepository).save(any(Notification.class));
        }

        @Test
        @DisplayName("still notifies shipper when trucker not found")
        void truckerNotFound_shipperStillNotified() {
            User shipper = buildUser(SHIPPER_ID, "Bob", "Jones");
            when(userRepository.findById(TRUCKER_ID)).thenReturn(Optional.empty());
            when(userRepository.findById(SHIPPER_ID)).thenReturn(Optional.of(shipper));
            when(notificationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            service.onLoadClaimed(new LoadClaimedEvent(buildLoad(), TRUCKER_ID));

            verify(notificationRepository).save(any(Notification.class));
        }

        @Test
        @DisplayName("skips notification when shipper not found")
        void shipperNotFound_noOp() {
            when(userRepository.findById(TRUCKER_ID)).thenReturn(Optional.of(buildUser(TRUCKER_ID, "Alice", "Smith")));
            when(userRepository.findById(SHIPPER_ID)).thenReturn(Optional.empty());
            service.onLoadClaimed(new LoadClaimedEvent(buildLoad(), TRUCKER_ID));
            verify(notificationRepository, never()).save(any());
        }

        @Test
        @DisplayName("does not send email when shipper has notifyEmail=false")
        void emailSuppressedWhenNotifyEmailFalse() {
            User trucker = buildUser(TRUCKER_ID, "Alice", "Smith");
            User shipper = buildUser(SHIPPER_ID, "Bob", "Jones");
            shipper.setNotifyEmail(false);
            when(userRepository.findById(TRUCKER_ID)).thenReturn(Optional.of(trucker));
            when(userRepository.findById(SHIPPER_ID)).thenReturn(Optional.of(shipper));
            when(notificationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            service.onLoadClaimed(new LoadClaimedEvent(buildLoad(), TRUCKER_ID));

            verify(emailService, never()).send(any(), any(), any());
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

            service.onLoadPickedUp(new LoadPickedUpEvent(buildLoad()));

            verify(notificationRepository).save(any(Notification.class));
        }

        @Test
        @DisplayName("skips when shipper not found")
        void shipperNotFound_noOp() {
            when(userRepository.findById(SHIPPER_ID)).thenReturn(Optional.empty());
            service.onLoadPickedUp(new LoadPickedUpEvent(buildLoad()));
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
            when(userRepository.findById(TRUCKER_ID)).thenReturn(Optional.empty());
            when(notificationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            service.onLoadDelivered(new LoadDeliveredEvent(buildLoad(), TRUCKER_ID));

            verify(notificationRepository, atLeastOnce()).save(any(Notification.class));
        }

        @Test
        @DisplayName("notifies trucker on delivery")
        void notifiesTruckerOnDelivery() {
            User trucker = buildUser(TRUCKER_ID, "Alice", "Smith");
            when(userRepository.findById(SHIPPER_ID)).thenReturn(Optional.empty());
            when(userRepository.findById(TRUCKER_ID)).thenReturn(Optional.of(trucker));
            when(notificationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            service.onLoadDelivered(new LoadDeliveredEvent(buildLoad(), TRUCKER_ID));

            verify(notificationRepository).save(any(Notification.class));
            verify(emailService).send(eq("alice@example.com"), contains("Delivery confirmed"), anyString());
        }

        @Test
        @DisplayName("notifies both shipper and trucker on delivery")
        void notifiesBothOnDelivery() {
            User shipper = buildUser(SHIPPER_ID, "Bob", "Jones");
            User trucker = buildUser(TRUCKER_ID, "Alice", "Smith");
            when(userRepository.findById(SHIPPER_ID)).thenReturn(Optional.of(shipper));
            when(userRepository.findById(TRUCKER_ID)).thenReturn(Optional.of(trucker));
            when(notificationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            service.onLoadDelivered(new LoadDeliveredEvent(buildLoad(), TRUCKER_ID));

            verify(notificationRepository, times(2)).save(any(Notification.class));
            verify(emailService).send(eq("bob@example.com"), contains("Load delivered"), anyString());
            verify(emailService).send(eq("alice@example.com"), contains("Delivery confirmed"), anyString());
        }

        @Test
        @DisplayName("skips when both shipper and trucker not found")
        void neitherFound_noOp() {
            when(userRepository.findById(SHIPPER_ID)).thenReturn(Optional.empty());
            when(userRepository.findById(TRUCKER_ID)).thenReturn(Optional.empty());
            service.onLoadDelivered(new LoadDeliveredEvent(buildLoad(), TRUCKER_ID));
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

            service.onLoadCancelled(new LoadCancelledEvent(buildLoad(), TRUCKER_ID, "Equipment issue"));

            verify(notificationRepository).save(any(Notification.class));
        }

        @Test
        @DisplayName("skips when trucker not found")
        void truckerNotFound_noOp() {
            when(userRepository.findById(TRUCKER_ID)).thenReturn(Optional.empty());
            service.onLoadCancelled(new LoadCancelledEvent(buildLoad(), TRUCKER_ID, "reason"));
            verify(notificationRepository, never()).save(any());
        }
    }

    @Nested
    class MarkRead {

        @BeforeEach void setup() { TenantContextHolder.setTenantId(TENANT_ID); }
        @AfterEach  void teardown() { TenantContextHolder.clear(); }

        @Test
        @DisplayName("marks notification read when userId and tenant match")
        void ownershipMatches_marksRead() {
            Notification n = new Notification();
            n.setUserId(SHIPPER_ID);
            n.setTenantId(TENANT_ID);
            when(notificationRepository.findById("notif-1")).thenReturn(Optional.of(n));

            service.markRead("notif-1", SHIPPER_ID);

            verify(notificationRepository).save(n);
        }

        @Test
        @DisplayName("does not mark read when userId does not match")
        void userMismatch_noOp() {
            Notification n = new Notification();
            n.setUserId("other-user");
            n.setTenantId(TENANT_ID);
            when(notificationRepository.findById("notif-1")).thenReturn(Optional.of(n));

            service.markRead("notif-1", SHIPPER_ID);

            verify(notificationRepository, never()).save(any());
        }

        @Test
        @DisplayName("no-op when notification not found")
        void notFound_noOp() {
            when(notificationRepository.findById("notif-1")).thenReturn(Optional.empty());

            service.markRead("notif-1", SHIPPER_ID);

            verify(notificationRepository, never()).save(any());
        }
    }

    @Nested
    class MarkAllRead {

        @BeforeEach void setup() { TenantContextHolder.setTenantId(TENANT_ID); }
        @AfterEach  void teardown() { TenantContextHolder.clear(); }

        @Test
        @DisplayName("delegates to repository and returns count")
        void delegatesToRepository() {
            when(notificationRepository.markAllReadByUserIdAndTenantId(SHIPPER_ID, TENANT_ID)).thenReturn(5);

            int result = service.markAllRead(SHIPPER_ID);

            assertThat(result).isEqualTo(5);
        }
    }

    @Nested
    class SmsNotifications {

        @Test
        @DisplayName("sends SMS when notifySms=true and phone is set")
        void smsEnabled_phoneSet_sendsSms() {
            User shipper = buildUser(SHIPPER_ID, "Bob", "Jones");
            shipper.setPhone("+15551234567");
            shipper.setNotifySms(true);
            shipper.setNotifyInApp(false);
            shipper.setNotifyEmail(false);
            when(userRepository.findById(SHIPPER_ID)).thenReturn(Optional.of(shipper));

            service.onLoadPickedUp(new LoadPickedUpEvent(buildLoad()));

            verify(smsNotificationService).send(eq("+15551234567"), anyString());
        }

        @Test
        @DisplayName("truncates SMS body when message exceeds 160 chars")
        void longMessage_truncated() {
            User shipper = buildUser(SHIPPER_ID, "Bob", "Jones");
            shipper.setPhone("+15551234567");
            shipper.setNotifySms(true);
            shipper.setNotifyInApp(false);
            shipper.setNotifyEmail(false);
            // Make origin/dest long to force SMS body > 160 chars
            Load load = buildLoad();
            load.setOriginCity("A".repeat(80));
            load.setDestinationCity("B".repeat(80));
            when(userRepository.findById(SHIPPER_ID)).thenReturn(Optional.of(shipper));

            service.onLoadPickedUp(new LoadPickedUpEvent(load));

            verify(smsNotificationService).send(eq("+15551234567"), argThat(s -> s.endsWith("...")));
        }

        @Test
        @DisplayName("skips SMS when phone is null")
        void nullPhone_noSms() {
            User shipper = buildUser(SHIPPER_ID, "Bob", "Jones");
            shipper.setPhone(null);
            shipper.setNotifySms(true);
            shipper.setNotifyInApp(false);
            shipper.setNotifyEmail(false);
            when(userRepository.findById(SHIPPER_ID)).thenReturn(Optional.of(shipper));

            service.onLoadPickedUp(new LoadPickedUpEvent(buildLoad()));

            verify(smsNotificationService, never()).send(any(), any());
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
