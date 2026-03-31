package com.freightclub.service;

import com.freightclub.domain.Load;
import com.freightclub.domain.Notification;
import com.freightclub.domain.User;
import com.freightclub.dto.NotificationResponse;
import com.freightclub.repository.NotificationRepository;
import com.freightclub.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public NotificationService(NotificationRepository notificationRepository,
                               UserRepository userRepository,
                               EmailService emailService) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    /** Trucker claimed shipper's load — notify shipper. */
    public void notifyLoadClaimed(Load load, String truckerId) {
        User trucker = userRepository.findById(truckerId).orElse(null);
        User shipper = userRepository.findById(load.getShipperId()).orElse(null);
        if (trucker == null || shipper == null) return;

        String truckerName = trucker.getFirstName() + " " + trucker.getLastName();
        String route = route(load);
        notify(shipper, load, "LOAD_CLAIMED",
                truckerName + " claimed your load (" + route + ")",
                "[FreightClub] Your load was claimed");
    }

    /** Trucker marked pickup — notify shipper. */
    public void notifyLoadPickedUp(Load load) {
        User shipper = userRepository.findById(load.getShipperId()).orElse(null);
        if (shipper == null) return;

        notify(shipper, load, "LOAD_PICKED_UP",
                "Your load (" + route(load) + ") has been picked up and is in transit.",
                "[FreightClub] Load picked up");
    }

    /** Trucker marked delivered — notify shipper. */
    public void notifyLoadDelivered(Load load) {
        User shipper = userRepository.findById(load.getShipperId()).orElse(null);
        if (shipper == null) return;

        notify(shipper, load, "LOAD_DELIVERED",
                "Your load (" + route(load) + ") has been delivered.",
                "[FreightClub] Load delivered");
    }

    /** Shipper cancelled a claimed load — notify trucker with reason. */
    public void notifyLoadCancelledToTrucker(Load load, String truckerId, String reason) {
        User trucker = userRepository.findById(truckerId).orElse(null);
        if (trucker == null) return;

        notify(trucker, load, "LOAD_CANCELLED",
                "The load you claimed (" + route(load) + ") was cancelled. Reason: " + reason,
                "[FreightClub] Your claimed load was cancelled");
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getNotifications(String userId, int page, int size) {
        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size))
                .map(NotificationResponse::from);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public void markRead(String notificationId, String userId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (n.getUserId().equals(userId)) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        });
    }

    public int markAllRead(String userId) {
        return notificationRepository.markAllReadByUserId(userId);
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
    }

    private String route(Load load) {
        return load.getOriginCity() + ", " + load.getOriginState()
                + " \u2192 " + load.getDestinationCity() + ", " + load.getDestinationState();
    }
}
