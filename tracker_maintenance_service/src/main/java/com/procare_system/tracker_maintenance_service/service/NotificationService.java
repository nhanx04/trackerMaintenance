package com.procare_system.tracker_maintenance_service.service;

import com.procare_system.tracker_maintenance_service.dto.response.NotificationResponse;
import com.procare_system.tracker_maintenance_service.entity.Notification;
import com.procare_system.tracker_maintenance_service.exception.AppException;
import com.procare_system.tracker_maintenance_service.exception.ErrorCode;
import com.procare_system.tracker_maintenance_service.repository.NotificationRepository;
import com.procare_system.tracker_maintenance_service.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationService {

    NotificationRepository notificationRepository;
    UserRepository userRepository;

    // Helper: Lấy ID của user đang gọi API từ JWT Token
    private String currentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            String username = jwtAuth.getName();
            return userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username))
                    .getId();
        }
        throw new RuntimeException("Unauthenticated");
    }

    private NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .referenceId(notification.getReferenceId())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }


    public Page<NotificationResponse> getMyNotifications(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(currentUserId(), pageable)
                .map(this::toResponse);
    }

    public Long getUnreadCount() {
        return notificationRepository.countByRecipientIdAndIsReadFalse(currentUserId());
    }

    @Transactional
    public NotificationResponse markAsRead(String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));

        if (!notification.getRecipientId().equals(currentUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        notification.setRead(true);
        notification = notificationRepository.save(notification);
        return toResponse(notification);
    }

    @Transactional
    public void markAllAsRead() {
        var unreadNotifications = notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(currentUserId(), Pageable.unpaged())
                .stream()
                .filter(n -> !n.isRead())
                .toList();

        unreadNotifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }
}