package com.procare_system.tracker_maintenance_service.dto.response;

import com.procare_system.tracker_maintenance_service.enums.NotificationType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationResponse {
    String id;
    String title;
    String message;
    NotificationType type;
    String referenceId;
    boolean isRead;
    LocalDateTime createdAt;
}