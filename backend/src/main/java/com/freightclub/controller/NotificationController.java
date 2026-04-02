package com.freightclub.controller;

import com.freightclub.dto.NotificationResponse;
import com.freightclub.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public Page<NotificationResponse> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal String userId) {
        return notificationService.getNotifications(userId, page, size);
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount(@AuthenticationPrincipal String userId) {
        return Map.of("count", notificationService.getUnreadCount(userId));
    }

    @PatchMapping("/{id}/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markRead(@PathVariable String id,
                         @AuthenticationPrincipal String userId) {
        notificationService.markRead(id, userId);
    }

    @PatchMapping("/read-all")
    public Map<String, Integer> markAllRead(@AuthenticationPrincipal String userId) {
        int updated = notificationService.markAllRead(userId);
        return Map.of("marked", updated);
    }
}
