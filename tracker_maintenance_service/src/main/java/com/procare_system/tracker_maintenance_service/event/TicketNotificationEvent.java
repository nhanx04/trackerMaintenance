package com.procare_system.tracker_maintenance_service.event;

import com.procare_system.tracker_maintenance_service.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TicketNotificationEvent {
    private String recipientId;
    private String title;
    private String message;
    private NotificationType type;
    private String ticketId;
}