package com.procare_system.tracker_maintenance_service.listener;

import com.procare_system.tracker_maintenance_service.entity.Notification;
import com.procare_system.tracker_maintenance_service.event.TicketNotificationEvent;
import com.procare_system.tracker_maintenance_service.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationListener {

    private final NotificationRepository notificationRepository;

    @EventListener
    public void handleTicketNotificationEvent(TicketNotificationEvent event) {
        log.info("Nhận được event tạo thông báo: [{}] cho User: {}", event.getType(), event.getRecipientId());

        Notification notification = Notification.builder()
                .recipientId(event.getRecipientId())
                .title(event.getTitle())
                .message(event.getMessage())
                .type(event.getType())
                .referenceId(event.getTicketId())
                .isRead(false) // Mặc định là chưa đọc
                .build();

        notificationRepository.save(notification);
        log.info("Đã lưu thông báo thành công!");
    }
}