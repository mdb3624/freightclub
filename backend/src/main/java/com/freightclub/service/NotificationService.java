package com.freightclub.service;

import com.freightclub.domain.Load;
import com.freightclub.domain.Notification;
import com.freightclub.domain.User;
import com.freightclub.dto.NotificationResponse;
import com.freightclub.repository.NotificationRepository;
import com.freightclub.repository.UserRepository;
import com.freightclub.security.TenantContextHolder;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final SmsNotificationService smsNotificationService;

    public NotificationService(NotificationRepository notificationRepository,
                               UserRepository userRepository,
                               EmailService emailService,
                               SmsNotificationService smsNotificationService) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.smsNotificationService = smsNotificationService;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onLoadClaimed(LoadClaimedEvent event) {
        Load load = event.load();
        User trucker = userRepository.findById(event.truckerId()).orElse(null);
        User shipper = userRepository.findById(load.getShipperId()).orElse(null);
        if (shipper == null) {
            log.warn("Shipper not found for load claimed event, loadId={}", load.getId());
            return;
        }
        String truckerName = trucker != null
                ? trucker.getFirstName() + " " + trucker.getLastName()
                : "A trucker";
        notify(shipper, load, "LOAD_CLAIMED",
                truckerName + " claimed your load (" + route(load) + ")",
                "[FreightClub] Your load was claimed");
        if (trucker == null) {
            log.warn("Trucker not found for load claimed event, truckerId={}", event.truckerId());
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onLoadPickedUp(LoadPickedUpEvent event) {
        Load load = event.load();
        User shipper = userRepository.findById(load.getShipperId()).orElse(null);
        if (shipper == null) return;

        notify(shipper, load, "LOAD_PICKED_UP",
                "Your load (" + route(load) + ") has been picked up and is in transit.",
                "[FreightClub] Load picked up");
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onLoadDelivered(LoadDeliveredEvent event) {
        Load load = event.load();
        User shipper = userRepository.findById(load.getShipperId()).orElse(null);
        if (shipper != null) {
            notify(shipper, load, "LOAD_DELIVERED",
                    "Your load (" + route(load) + ") has been delivered. Please confirm receipt.",
                    "[FreightClub] Load delivered");
        }
        User trucker = userRepository.findById(event.truckerId()).orElse(null);
        if (trucker != null) {
            notify(trucker, load, "LOAD_DELIVERED",
                    "Delivery confirmed for load (" + route(load) + "). Your invoice will be generated shortly.",
                    "[FreightClub] Delivery confirmed");
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onLoadCancelled(LoadCancelledEvent event) {
        Load load = event.load();
        User trucker = userRepository.findById(event.truckerId()).orElse(null);
        if (trucker == null) return;

        notify(trucker, load, "LOAD_CANCELLED",
                "The load you claimed (" + route(load) + ") was cancelled. Reason: " + event.reason(),
                "[FreightClub] Your claimed load was cancelled");
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "notifications", key = "#userId + ':' + #page + ':' + #size + ':' + T(com.freightclub.security.TenantContextHolder).getTenantId()")
    public Page<NotificationResponse> getNotifications(String userId, int page, int size) {
        String tenantId = TenantContextHolder.getTenantId();
        return notificationRepository
                .findByUserIdAndTenantIdOrderByCreatedAtDesc(userId, tenantId, PageRequest.of(page, size))
                .map(NotificationResponse::from);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "notificationCount", key = "#userId + ':' + T(com.freightclub.security.TenantContextHolder).getTenantId()")
    public long getUnreadCount(String userId) {
        String tenantId = TenantContextHolder.getTenantId();
        return notificationRepository.countByUserIdAndTenantIdAndReadFalse(userId, tenantId);
    }

    @CacheEvict(value = {"notifications", "notificationCount"}, allEntries = true)
    public void markRead(String notificationId, String userId) {
        String tenantId = TenantContextHolder.getTenantId();
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (n.getUserId().equals(userId) && n.getTenantId().equals(tenantId)) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        });
    }

    @CacheEvict(value = {"notifications", "notificationCount"}, allEntries = true)
    public int markAllRead(String userId) {
        String tenantId = TenantContextHolder.getTenantId();
        return notificationRepository.markAllReadByUserIdAndTenantId(userId, tenantId);
    }

    // --- helpers ---

    private void notify(User recipient, Load load, String type, String message, String emailSubject) {
        if (recipient.isNotifyInApp()) {
            Notification notification = new Notification();
            notification.setTenantId(load.getTenantId());
            notification.setUserId(recipient.getId());
            notification.setLoadId(load.getId());
            notification.setType(type);
            notification.setMessage(message);
            notificationRepository.save(notification);
        }
        if (recipient.isNotifyEmail()) {
            emailService.send(recipient.getEmail(), emailSubject, message);
        }
        if (recipient.isNotifySms() && recipient.getPhone() != null) {
            String smsBody = ("FreightClub: " + message);
            if (smsBody.length() > 160) {
                smsBody = smsBody.substring(0, 157) + "...";
            }
            smsNotificationService.send(recipient.getPhone(), smsBody);
        }
    }

    private String route(Load load) {
        return load.getOriginCity() + ", " + load.getOriginState()
                + " → " + load.getDestinationCity() + ", " + load.getDestinationState();
    }
}
