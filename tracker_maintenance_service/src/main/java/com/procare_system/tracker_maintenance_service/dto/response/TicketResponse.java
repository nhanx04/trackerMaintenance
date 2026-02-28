package com.procare_system.tracker_maintenance_service.dto.response;

import com.procare_system.tracker_maintenance_service.enums.TicketPriority;
import com.procare_system.tracker_maintenance_service.enums.TicketStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor @AllArgsConstructor @Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketResponse {
    String id;
    String title;
    String description;
    TicketStatus status;
    TicketPriority priority;
    String deviceId;
    String assignedTechnicianId;
    String createdByUserId;
    LocalDate scheduledDate;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}