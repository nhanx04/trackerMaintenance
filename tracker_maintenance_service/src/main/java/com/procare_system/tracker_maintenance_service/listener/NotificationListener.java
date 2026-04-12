package com.procare_system.tracker_maintenance_service.listener;

import com.procare_system.tracker_maintenance_service.dto.response.NotificationResponse;
import com.procare_system.tracker_maintenance_service.entity.Notification;
import com.procare_system.tracker_maintenance_service.event.TicketNotificationEvent;
import com.procare_system.tracker_maintenance_service.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationListener {

    private final NotificationRepository notificationRepository;

    private final SimpMessagingTemplate messagingTemplate;

    @EventListener
    public void handleTicketNotificationEvent(TicketNotificationEvent event) {
        log.info("Bắt được event tạo thông báo: [{}] cho User: {}", event.getType(), event.getRecipientId());

        Notification notification = Notification.builder()
                .recipientId(event.getRecipientId())
                .title(event.getTitle())
                .message(event.getMessage())
                .type(event.getType())
                .referenceId(event.getTicketId())
                .isRead(false)
                .build();

        notification = notificationRepository.save(notification);


        NotificationResponse response = NotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .referenceId(notification.getReferenceId())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();

        //Bắn Real-time qua WebSocket cho ĐÚNG user đó
        // Kênh đích sẽ có dạng: /topic/notifications/{userId}
        String destination = "/topic/notifications/" + event.getRecipientId();
        messagingTemplate.convertAndSend(destination, response);

        log.info("Đã push Notification qua WebSocket tới kênh: {}", destination);
    }
}